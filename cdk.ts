#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as dotenv from 'dotenv'; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import { PropertyBridgeStack } from './my-lambda/ infra/my-lambda-stack';
import * as events from 'aws-cdk-lib/aws-events';

const isProd = !!process.env.PROD;
if (isProd) {
  dotenv.config({
    path: './.env.prod',
  });
} else {
  dotenv.config();
}

const suffix = isProd ? 'prod' : 'test';

const app = new cdk.App();

const vpc = cdk.Vpc.fromLookup(this, 'vpc', {
  isDefault: true,
});
const bus = new events.EventBus(this, `eb`, {
  eventBusName: `eb`
});

bus.archive('archive',{
  eventPattern:{
    account: [cdk.Stack.of(this).account],
  },
  retention: cdk.Duration.days(30),
})



new PropertyBridgeStack(app, `property-bridge-stack-${suffix}`, {
  vpc,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  isProd: isProd,
  eventBus:bus,
});
