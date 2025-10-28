#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkSaaSStack } from '../lib/cdk-saas-stack';

const app = new cdk.App();
new CdkSaaSStack(app, 'CdkSaaSStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  description: 'Multi-tenant SaaS Backend Infrastructure',
});
