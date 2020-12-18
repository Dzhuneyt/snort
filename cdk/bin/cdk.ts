#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import {App} from "../lib/App";
import {Ci} from "../lib/Ci";
import env from "./env";
import getStage from "../lib/util/getStage";

const stageName = getStage();

try {
    const app = new cdk.App();
    new Ci(app, `snort-ci`, {
        description: 'Snort - CI pipelines',
        env,
    });

    new App(app, `snort-app-${stageName}`, {
        description: 'Snort - the app itself',
        env,
    });
} catch (e) {
    console.error(e);
    process.exit(1);
}