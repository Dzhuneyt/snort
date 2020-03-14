#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import {Snort} from "../lib/Snort";

const app = new cdk.App();

new Snort(app, 'snort-app', {
    description: 'Snort app',
    env: {
        region: 'us-east-1',
    }
});
