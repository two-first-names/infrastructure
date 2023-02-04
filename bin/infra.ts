#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DnsStack } from '../lib/dns-stack';
import { VpcStack } from '../lib/vpc-stack';
import { InstancesStack } from '../lib/instances-stack';

const app = new cdk.App();

new DnsStack(app, 'DnsStack', {
  env: { account: '661138919196', region: 'us-east-1' }
});

const vpcStack = new VpcStack(app, 'VpcStack', {
  env: { account: '661138919196', region: 'us-east-1' }
});

new InstancesStack(app, 'InstancesStack', {
  vpc: vpcStack.vpc,
  env: { account: '661138919196', region: 'us-east-1' }
});

app.synth();
