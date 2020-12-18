import {Construct, Duration, SecretValue, Stack, StackProps} from "@aws-cdk/core";
import {GitHubTrigger} from "@aws-cdk/aws-codepipeline-actions";
import {BuildSpec, Cache, LinuxBuildImage, PipelineProject} from "@aws-cdk/aws-codebuild";
import {BucketEncryption, IBucket} from "@aws-cdk/aws-s3";
import {AccountPrincipal, ManagedPolicy, Role} from "@aws-cdk/aws-iam";
import {AutoDeleteBucket} from "@mobileposse/auto-delete-bucket";
import codepipeline = require('@aws-cdk/aws-codepipeline');
import codepipeline_actions = require('@aws-cdk/aws-codepipeline-actions');

export class Ci extends Stack {

    private artifacts: {
        sourceOutput: codepipeline.Artifact,
        deploy: codepipeline.Artifact,
    };
    private readonly role: Role;
    private readonly cacheBucket: IBucket;

    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);
        this.artifacts = this.createArtifacts();
        this.role = new Role(this, 'role', {
            assumedBy: new AccountPrincipal(Stack.of(this).account),
        });
        this.role.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'));
        this.cacheBucket = new AutoDeleteBucket(this, 'cache', {
            encryption: BucketEncryption.S3_MANAGED,
            lifecycleRules: [{expiration: Duration.days(3)}],
        });
        this.createPipelines();
    }

    private getCdkDeployAction(environmentName: string) {
        return new PipelineProject(this, `${environmentName}-cdk-build`, {
            buildSpec: BuildSpec.fromSourceFilename('buildspec.yml'),
            role: this.role,
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
    }

    private createArtifacts() {
        const sourceOutput = new codepipeline.Artifact();
        const deploy = new codepipeline.Artifact('deploy');
        return {
            sourceOutput,
            deploy,
        };
    }

    private createPipelines() {
        const artifactsBucket = new AutoDeleteBucket(this, 'ci-artifacts', {
            encryption: BucketEncryption.S3_MANAGED,
            lifecycleRules: [{expiration: Duration.days(3)}],
        });

        const cdkDeployStaging = this.getCdkDeployAction('staging');
        const cdkDeployProd = this.getCdkDeployAction("production");

        const staging = new codepipeline.Pipeline(this, 'staging', {
            pipelineName: 'snort-ci-develop',
            restartExecutionOnUpdate: false,
            artifactBucket: artifactsBucket,
            stages: [
                {
                    stageName: 'Source',
                    actions: [
                        new codepipeline_actions.GitHubSourceAction({
                            actionName: "Source",
                            oauthToken: SecretValue.secretsManager('GITHUB_TOKEN'),
                            owner: 'Dzhuneyt',
                            repo: 'snort',
                            branch: 'develop',
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
                            project: cdkDeployStaging,
                            role: this.role,
                            input: this.artifacts.sourceOutput,
                            outputs: [this.artifacts.deploy],
                        }),
                    ],
                },
            ],
        });

        const production = new codepipeline.Pipeline(this, 'production', {
            pipelineName: 'snort-ci-master',
            restartExecutionOnUpdate: false,
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
                            project: cdkDeployProd,
                            role: this.role,
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
