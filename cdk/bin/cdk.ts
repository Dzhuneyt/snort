#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import {Snort} from "../lib/Snort";
import {Ci} from "../lib/Ci";
import {Environment} from "@aws-cdk/core";

const app = new cdk.App();
const environmentName = process.env.STAGE;

if (!environmentName) {
    throw new Error('STAGE environment variable parameter not present. Can not deploy');
}

const env: Environment = {
    region: 'us-east-1',
    account: '216987438199',
};

try {
    new Ci(app, `snort-ci`, {
        description: 'Snort - CI pipelines',
        env,
    });

    const theAppStack = new Snort(app, `snort-app-${environmentName}`, {
        description: 'Snort - the app itself',
        env,
    });
} catch (e) {
    console.log(e);
    process.exit(1);
}