import {Construct, Stack, StackProps} from "@aws-cdk/core";
import {HostedZone, IHostedZone, PublicHostedZone} from "@aws-cdk/aws-route53";
import {Certificate, DnsValidatedCertificate, ICertificate} from "@aws-cdk/aws-certificatemanager";

interface Props extends StackProps {
}

export class Route53Certificate extends Stack {
    readonly route53certificate: ICertificate;

    private envName = process.env.STAGE;

    constructor(scope: Construct, id: string, props: Props) {
        super(scope, id, props);

        // const domain = HostedZone.fromLookup(this, 'domain', {
        //     domainName: this.envName + '.snort.cc',
        // });
        // this.route53certificate = new DnsValidatedCertificate(this, 'cert', {
        //     domainName: domain.zoneName,
        //     hostedZone: domain,
        //     region: 'us-east-1',
        // });

    }
}