import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import Cdk = require('../lib/Snort');

test('Empty Stack', () => {
    // const app = new cdk.App();
    // // WHEN
    // const stack = new Cdk.Snort(app, 'MyTestStack', {});
    // // THEN
    // expectCDK(stack).to(matchTemplate({
    //   "Resources": {}
    // }, MatchStyle.EXACT))
});
