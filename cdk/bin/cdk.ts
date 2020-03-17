#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import {Snort} from "../lib/Snort";
import {Ci} from "../lib/Ci";
import {Route53} from "../lib/Route53";
import {Environment} from "@aws-cdk/core";

const app = new cdk.App();
const environmentName = process.env.STAGE;

if (!environmentName) {
    throw new Error('STAGE environment variable parameter not present. Can not deploy');
}

const env: Environment = {
    region: 'us-east-1',
    account: '347315207830',
};

try {
    new Ci(app, `snort-ci`, {
        description: 'Snort - CI pipelines',
        env,
    });

    const route53 = new Route53(app, `snort-route53-${environmentName}`, {
        description: 'Snort - the domain part',
        env
    });

    new Snort(app, `snort-app-${environmentName}`, {
        description: 'Snort - the app itself',
        env,
        route53: route53.route53,
        route53certificate: route53.route53certificate,
    });
} catch (e) {
    console.log(e);
    process.exit(1);
}