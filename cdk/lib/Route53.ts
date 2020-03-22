import {CfnOutput, Construct, Stack, StackProps} from "@aws-cdk/core";
import {IHostedZone, PublicHostedZone, ZoneDelegationRecord} from "@aws-cdk/aws-route53";
import {ICertificate} from "@aws-cdk/aws-certificatemanager";

export class Route53 extends Stack {
    private readonly route53: IHostedZone;

    private envName = process.env.STAGE;

    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        // const mainDomain = PublicHostedZone.fromLookup(this, 'tld', {
        //     domainName: "snort.cc",
        // });
        //
        // this.route53 = new PublicHostedZone(this, 'route53', {
        //     zoneName: this.envName + '.snort.cc',
        // });
        //
        // const zoneDelegation = new ZoneDelegationRecord(this, 'route53_subdomain', {
        //     zone: mainDomain,
        //     recordName: this.route53.zoneName,
        //     nameServers: this.route53.hostedZoneNameServers! // <-- the "!" means "I know this won't be undefined"
        // });

        new CfnOutput(this, 'domain-name', {
            value: "ignored"
        });
    }
}