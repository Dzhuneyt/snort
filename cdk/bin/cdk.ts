#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import {Snort} from "../lib/Snort";
import {Ci} from "../lib/Ci";
import {Route53} from "../lib/Route53";

const app = new cdk.App();
const environmentName = process.env.STAGE;

if (!environmentName) {
    throw new Error('STAGE environment variable parameter not present. Can not deploy');
}

new Ci(app, `snort-ci`, {
    description: 'Snort - CI pipelines',
    env: {
        region: 'us-east-1',
        account: process.env.CDK_DEFAULT_ACCOUNT,
    }
});

const route53 = new Route53(app, `snort-route53-${environmentName}`, {
    description: 'Snort - the domain part',
    env: {
        region: 'us-east-1',
        account: process.env.CDK_DEFAULT_ACCOUNT,
    }
});

new Snort(app, `snort-app-${environmentName}`, {
    description: 'Snort - the app itself',
    env: {
        region: 'us-east-1',
        account: process.env.CDK_DEFAULT_ACCOUNT,
    },
    route53: route53.route53,
    route53certificate: route53.route53certificate,
});
