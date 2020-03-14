import {Construct, SecretValue, Stack, StackProps} from "@aws-cdk/core";
import {GitHubTrigger} from "@aws-cdk/aws-codepipeline-actions";
import codepipeline = require('@aws-cdk/aws-codepipeline');
import codepipeline_actions = require('@aws-cdk/aws-codepipeline-actions');
import {BuildSpec, LinuxBuildImage, PipelineProject} from "@aws-cdk/aws-codebuild";

export class Ci extends Stack {

    private codeBuildActions: {
        cdkBuild: PipelineProject,
    };

    private artifacts: {
        sourceOutput: codepipeline.Artifact,
        cdkDeployOutput: codepipeline.Artifact,
    };

    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);
        this.createArtifacts();
        this.createCodeBuildActions();
        this.createPipelines();
    }

    private createCodeBuildActions() {
        const cdkBuild = new PipelineProject(this, 'CdkBuild', {
            buildSpec: BuildSpec.fromObject({
                version: '0.2',
                phases: {
                    install: {
                        commands: 'cd cdk && npm ci --no-audit',
                    },
                    build: {
                        commands: [
                            'npm run build:lambdas',
                            'npm run cdk deploy:app'
                        ],
                    },
                },
            }),
            environment: {
                buildImage: LinuxBuildImage.STANDARD_2_0,
            },
        });

        this.codeBuildActions = {
            cdkBuild,
        }
    }

    private createArtifacts() {
        const sourceOutput = new codepipeline.Artifact();
        const cdkDeployOutput = new codepipeline.Artifact('cdk_deploy');
        this.artifacts = {
            sourceOutput,
            cdkDeployOutput
        };
    }

    private createPipelines() {
        const staging = new codepipeline.Pipeline(this, 'staging', {
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
                            project: this.codeBuildActions.cdkBuild,
                            input: this.artifacts.sourceOutput,
                            outputs: [this.artifacts.cdkDeployOutput],
                        }),
                    ],
                },
            ],
        });

        const production = new codepipeline.Pipeline(this, 'production', {
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
                            project: this.codeBuildActions.cdkBuild,
                            input: this.artifacts.sourceOutput,
                            outputs: [this.artifacts.cdkDeployOutput],
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
