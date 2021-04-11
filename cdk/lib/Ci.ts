import {Annotations, Construct, Duration, SecretValue, Stack, StackProps} from "@aws-cdk/core";
import {GitHubTrigger} from "@aws-cdk/aws-codepipeline-actions";
import {BuildSpec, Cache, LinuxBuildImage, PipelineProject} from "@aws-cdk/aws-codebuild";
import {BucketEncryption, IBucket} from "@aws-cdk/aws-s3";
import {AutoDeleteBucket} from "@mobileposse/auto-delete-bucket";
import {ManagedPolicy} from "@aws-cdk/aws-iam";
import codepipeline = require('@aws-cdk/aws-codepipeline');
import codepipeline_actions = require('@aws-cdk/aws-codepipeline-actions');

export class Ci extends Stack {

    private readonly cacheBucket: IBucket;
    private readonly branch: string;

    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        this.branch = this.node.tryGetContext('branch');

        if (!this.branch) {
            Annotations.of(this).addError('Context value with name "branch" is required to deploy the CI stack');
            return;
        }

        this.cacheBucket = new AutoDeleteBucket(this, 'cache', {
            encryption: BucketEncryption.S3_MANAGED,
            lifecycleRules: [{expiration: Duration.days(3)}],
        });

        this.createPipeline();
    }

    private getCdkDeployAction(environmentName: string) {
        const project = new PipelineProject(this, `${environmentName}-cdk-build`, {
            buildSpec: BuildSpec.fromSourceFilename('buildspec.yml'),
            environmentVariables: {
                STAGE: {
                    value: environmentName,
                }
            },
            environment: {
                buildImage: LinuxBuildImage.AMAZON_LINUX_2_3,
            },
            cache: Cache.bucket(this.cacheBucket, {
                prefix: `${environmentName}-cdk-build`,
            }),
        });
        project.role?.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'));
        return project;
    }

    private createPipeline() {
        const sourceOutput = new codepipeline.Artifact();
        const deployOutput = new codepipeline.Artifact('cdk-deploy');
        const cdkDeployAction = this.getCdkDeployAction(this.branch);
        new codepipeline.Pipeline(this, this.branch, {
            pipelineName: `snort-ci-${this.branch}`,
            restartExecutionOnUpdate: false,
            artifactBucket: this.cacheBucket,
            stages: [
                {
                    stageName: 'Source',
                    actions: [
                        new codepipeline_actions.GitHubSourceAction({
                            actionName: "Source",
                            oauthToken: SecretValue.secretsManager('GITHUB_TOKEN'),
                            owner: 'Dzhuneyt',
                            repo: 'snort',
                            branch: this.branch,
                            trigger: GitHubTrigger.WEBHOOK,
                            output: sourceOutput,
                        }),
                    ],
                },
                {
                    stageName: 'Build',
                    actions: [
                        new codepipeline_actions.CodeBuildAction({
                            actionName: 'CDK_Deploy',
                            project: cdkDeployAction,
                            input: sourceOutput,
                            outputs: [deployOutput],
                        }),
                    ],
                },
            ],
        });

    }
}
