import {Construct, SecretValue, Stack, StackProps} from "@aws-cdk/core";
import {GitHubTrigger} from "@aws-cdk/aws-codepipeline-actions";
import {BuildSpec, Cache, LinuxBuildImage, LocalCacheMode, PipelineProject} from "@aws-cdk/aws-codebuild";
import {Bucket, BucketEncryption} from "@aws-cdk/aws-s3";
import codepipeline = require('@aws-cdk/aws-codepipeline');
import codepipeline_actions = require('@aws-cdk/aws-codepipeline-actions');
import {PolicyStatement} from "@aws-cdk/aws-iam";

export class Ci extends Stack {

    private artifacts: {
        sourceOutput: codepipeline.Artifact,
        deploy: codepipeline.Artifact,
    };

    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);
        this.artifacts = this.createArtifacts();
        this.createPipelines();
    }

    private createCodeBuildActions(environmentName: string) {

        const buildCommands = [
            'echo Building Lambdas',
            'cd ${CODEBUILD_SRC_DIR}/cdk && npm run build:lambdas',


            // CI Self provision on master branch commits
            environmentName === 'production' ? 'echo Deploying CI infrastructure' : null,
            environmentName === 'production' ? 'cd ${CODEBUILD_SRC_DIR}/cdk && npm run deploy:ci' : null,

            'echo Deploying APP infrastructure',
            'cd ${CODEBUILD_SRC_DIR}/cdk && npm run deploy:app',

            'export BACKEND_URL=$(cd ${CODEBUILD_SRC_DIR} && npx -q aws-cdk-output --name=backendurl --fromStack=snort-app-${STAGE})',
            'echo Backend URL is ${BACKEND_URL}',

            'echo Building frontend',
            'cd ${CODEBUILD_SRC_DIR}/frontend && BACKEND_URL=${BACKEND_URL} npm run ci:replace-env-vars',
            'cd ${CODEBUILD_SRC_DIR}/frontend && npm run build:prod',
            'cd ${CODEBUILD_SRC_DIR}/frontend && npm run copy-to-s3',
        ].filter(value => value !== null);


        const cdkBuild = new PipelineProject(this, `${environmentName}-cdk-build`, {
            buildSpec: BuildSpec.fromObject({
                version: '0.2',
                phases: {
                    install: {
                        commands: [
                            'cd ${CODEBUILD_SRC_DIR} && npm ci --no-audit',
                            'cd ${CODEBUILD_SRC_DIR}/cdk && npm ci --no-audit',
                            'cd ${CODEBUILD_SRC_DIR}/frontend && npm ci --no-audit',
                        ],
                    },
                    build: {
                        commands: buildCommands,
                    },
                },
                cache: {
                    paths: [
                        'cdk/node_modules/**/*',
                        'frontend/node_modules/**/*',
                        '/root/.npm/**/*'
                    ],
                }
            }),
            environmentVariables: {
                STAGE: {
                    value: environmentName,
                }
            },
            environment: {
                buildImage: LinuxBuildImage.STANDARD_2_0,
            },
            cache: Cache.local(LocalCacheMode.SOURCE),
        });
        cdkBuild.addToRolePolicy(new PolicyStatement({
            actions: ["*"],
            resources: ["*"]
        }));

        return {
            cdkBuild: cdkBuild,
        }
    }

    private createArtifacts() {
        const sourceOutput = new codepipeline.Artifact();
        const deploy = new codepipeline.Artifact('deploy');
        return {
            sourceOutput,
            deploy: deploy
        };
    }

    private createPipelines() {
        const artifactsbucket = new Bucket(this, 'ci-artifacts', {
            encryption: BucketEncryption.S3_MANAGED,
        });

        const actionsStaging = this.createCodeBuildActions('staging');
        const actionsProduction = this.createCodeBuildActions("production");

        const staging = new codepipeline.Pipeline(this, 'staging', {
            restartExecutionOnUpdate: true,
            artifactBucket: artifactsbucket,
            stages: [
                {
                    stageName: 'Source',
                    actions: [
                        new codepipeline_actions.GitHubSourceAction({
                            branch: 'develop',
                            actionName: "Source",
                            oauthToken: SecretValue.secretsManager('GITHUB_TOKEN'),
                            owner: 'Dzhuneyt',
                            repo: 'snort',
                            trigger: GitHubTrigger.WEBHOOK,
                            output: this.artifacts.sourceOutput,
                        }),
                    ],
                },
                {
                    stageName: 'Build',
                    actions: [
                        new codepipeline_actions.CodeBuildAction({
                            actionName: 'CDK_Deploy',
                            project: actionsStaging.cdkBuild,
                            input: this.artifacts.sourceOutput,
                            outputs: [this.artifacts.deploy],
                        }),
                    ],
                },
            ],
        });

        const production = new codepipeline.Pipeline(this, 'production', {
            restartExecutionOnUpdate: true,
            artifactBucket: artifactsbucket,
            stages: [
                {
                    stageName: 'Source',
                    actions: [
                        new codepipeline_actions.GitHubSourceAction({
                            branch: 'master',
                            actionName: "Source",
                            oauthToken: SecretValue.secretsManager('GITHUB_TOKEN'),
                            owner: 'Dzhuneyt',
                            repo: 'snort',
                            trigger: GitHubTrigger.WEBHOOK,
                            output: this.artifacts.sourceOutput,
                        }),
                    ],
                },
                {
                    stageName: 'Build',
                    actions: [
                        new codepipeline_actions.CodeBuildAction({
                            actionName: 'Deploy',
                            project: actionsProduction.cdkBuild,
                            input: this.artifacts.sourceOutput,
                            outputs: [this.artifacts.deploy],
                        }),
                    ],
                },
            ],
        });

        return {
            staging,
            production,
        }
    }
}
