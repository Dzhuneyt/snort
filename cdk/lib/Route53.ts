import {Construct, Stack, StackProps} from "@aws-cdk/core";
import {HostedZone, IHostedZone, PublicHostedZone} from "@aws-cdk/aws-route53";
import {Certificate, DnsValidatedCertificate, ICertificate} from "@aws-cdk/aws-certificatemanager";

export class Route53 extends Stack {
    readonly route53: IHostedZone;
    readonly route53certificate: ICertificate;

    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        this.route53 = PublicHostedZone.fromPublicHostedZoneId(this, 'domain', 'Z3F60K0OWWJH8I');
        this.route53certificate = Certificate.fromCertificateArn(this, 'cert', 'arn:aws:acm:us-east-1:347315207830:certificate/05a8c11a-82d1-4cc1-8ef5-f1b31eea3362');
    }
}