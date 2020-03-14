#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import {IamStack} from '../lib/iamStack';
import {Snort} from "../lib/Snort";

const app = new cdk.App();

// Step 1: Create the base infrastructure
new IamStack(app, 'snort-iam', {
    description: "IAM definitions for the Snort infrastructure. E.g. the IAM role to be used by GitHub actions",
    env: {
        region: 'us-east-1',
        account: process.env.CDK_DEFAULT_ACCOUNT,
    }
});
new Snort(app, 'snort-app', {
    description: 'Snort app',
    env: {
        region: 'us-east-1',
    }
});
