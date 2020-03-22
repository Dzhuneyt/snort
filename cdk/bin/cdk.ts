#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import {Snort} from "../lib/Snort";
import {Ci} from "../lib/Ci";
import {Route53} from "../lib/Route53";
import {Environment} from "@aws-cdk/core";
import {Route53Certificate} from "../lib/Route53Certificate";
import {SnortFrontend} from "../lib/SnortFrontend";

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

    const route53 = new Route53(app, `snort-route53-base-${environmentName}`, {
        description: 'Snort - the domain part',
        env
    });
    const route53certificate = new Route53Certificate(app, `snort-route53-cert-${environmentName}`, {
        description: 'Snort - the domain certificate and validation mechanism',
        env,
    });
    route53certificate.addDependency(route53);

    const theAppStack = new Snort(app, `snort-app-${environmentName}`, {
        description: 'Snort - the app itself',
        env,
    });
    const frontend = new SnortFrontend(app, `snort-app-frontend-${environmentName}`, {
        description: 'Snort - the app itself',
        env,
        bucket: theAppStack.bucket,
    });

    theAppStack.addDependency(route53);
    theAppStack.addDependency(route53certificate);
} catch (e) {
    console.log(e);
    process.exit(1);
}