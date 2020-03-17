import {Construct, Stack, StackProps} from "@aws-cdk/core";
import {HostedZone, IHostedZone, PublicHostedZone} from "@aws-cdk/aws-route53";
import {DnsValidatedCertificate} from "@aws-cdk/aws-certificatemanager";

export class Route53 extends Stack {
    readonly route53: IHostedZone;
    readonly route53certificate: DnsValidatedCertificate;

    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        this.route53 = new PublicHostedZone(this, 'domain', {
            zoneName: 'snort.cc',
        })
    }
}