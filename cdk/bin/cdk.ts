#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import {BaseInfrastructure} from '../lib/baseInfrastructure';

const app = new cdk.App();

// Step 1: Create the base infrastructure
new BaseInfrastructure(app, 'snort-base-infrastructure', {
    env: {
        region: 'us-east-1',
        account: process.env.CDK_DEFAULT_ACCOUNT,
    }
});

// new Snort(app, 'Snort', {
//     env: {
//         region: 'us-east-1'
//     }
// });

