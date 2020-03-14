#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import {Snort} from "../lib/Snort";
import {Ci} from "../lib/Ci";

const app = new cdk.App();
const environmentName = process.env.STAGE;

if (!environmentName) {
    throw new Error('STAGE environment variable parameter not present. Can not deploy');
}

new Ci(app, `snort-ci-${environmentName}`, {
    description: 'Snort - Continuous Integration pipelines',
    env: {
        region: 'us-east-1',
    }
});

new Snort(app, `snort-app-${environmentName}`, {
    description: 'Snort - the app itself',
    env: {
        region: 'us-east-1',
    }
});
