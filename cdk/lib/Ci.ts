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
        cdkDeployOutput: codepipeline.Artifact,
    };

    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);
        this.artifacts = this.createArtifacts();
        this.createPipelines();
    }

    private createCodeBuildActions(environmentName: string) {
        const cdkBuild = new PipelineProject(this, `${environmentName}-cdk-build`, {
            buildSpec: BuildSpec.fromObject({
                version: '0.2',
                phases: {
                    install: {
                        commands: [
                            'cd cdk && npm ci --no-audit'
                        ],
                    },
                    build: {
                        commands: [
                            'npm run build:lambdas',
                            'npm run deploy:app'
                        ],
                    },
                },
                cache: {
                    paths: [
                        'cdk/node_modules/**/*',
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

        return {
            cdkBuild: cdkBuild,
        }
    }

    private createArtifacts() {
        const sourceOutput = new codepipeline.Artifact();
        const cdkDeployOutput = new codepipeline.Artifact('cdk_deploy');
        return {
            sourceOutput,
            cdkDeployOutput
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
                            outputs: [this.artifacts.cdkDeployOutput],
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
                            actionName: 'CDK_Deploy',
                            project: actionsProduction.cdkBuild,
                            input: this.artifacts.sourceOutput,
                            outputs: [this.artifacts.cdkDeployOutput],
                        }),
                    ],
                },
            ],
        });

        staging.addToRolePolicy(new PolicyStatement({
            actions: ["cloudformation:*"],
            resources: ["*"]
        }));
        production.addToRolePolicy(new PolicyStatement({
            actions: ["cloudformation:*"],
            resources: ["*"]
        }));

        return {
            staging,
            production,
        }
    }
}
