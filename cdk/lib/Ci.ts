import {Construct, SecretValue, Stack, StackProps} from "@aws-cdk/core";
import {GitHubTrigger} from "@aws-cdk/aws-codepipeline-actions";
import {BuildSpec, Cache, LinuxBuildImage, LocalCacheMode, PipelineProject} from "@aws-cdk/aws-codebuild";
import {Bucket, BucketEncryption} from "@aws-cdk/aws-s3";
import {PolicyStatement} from "@aws-cdk/aws-iam";
import codepipeline = require('@aws-cdk/aws-codepipeline');
import codepipeline_actions = require('@aws-cdk/aws-codepipeline-actions');

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
        const cdkBuild = new PipelineProject(this, `${environmentName}-cdk-build`, {
            buildSpec: BuildSpec.fromSourceFilename('buildspec.yml'),
            environmentVariables: {
                STAGE: {
                    value: environmentName,
                }
            },
            environment: {
                buildImage: LinuxBuildImage.STANDARD_4_0,
            },
            cache: Cache.local(LocalCacheMode.SOURCE, LocalCacheMode.CUSTOM),
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
        const artifactsBucket = new Bucket(this, 'ci-artifacts', {
            encryption: BucketEncryption.S3_MANAGED,
        });

        const actionsStaging = this.createCodeBuildActions('staging');
        const actionsProduction = this.createCodeBuildActions("production");

        const staging = new codepipeline.Pipeline(this, 'staging', {
            pipelineName: 'snort-ci-develop',
            restartExecutionOnUpdate: true,
            artifactBucket: artifactsBucket,
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
            pipelineName: 'snort-ci-master',
            restartExecutionOnUpdate: true,
            artifactBucket: artifactsBucket,
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
