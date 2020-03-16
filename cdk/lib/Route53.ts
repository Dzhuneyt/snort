import {Construct, Stack, StackProps} from "@aws-cdk/core";
import {HostedZone, IHostedZone} from "@aws-cdk/aws-route53";
import {DnsValidatedCertificate} from "@aws-cdk/aws-certificatemanager";

export class Route53 extends Stack {
    readonly route53: IHostedZone;
    readonly route53certificate: DnsValidatedCertificate;

    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        this.route53 = HostedZone.fromLookup(this, 'domain', {
            domainName: 'snort.cc',
        });

        this.route53certificate = new DnsValidatedCertificate(this, 'cert', {
            domainName: 'snort.cc',
            hostedZone: this.route53,
            subjectAlternativeNames: [
                "staging.snort.cc",
                "production.snort.cc",
            ]
        });
    }
}