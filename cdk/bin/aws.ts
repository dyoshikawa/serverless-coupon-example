#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from '@aws-cdk/core'
import { AwsStack } from '../lib/aws-stack'
import { getStage } from '../lib/Stage'

const app = new cdk.App()
const stage = getStage()
new AwsStack(app, `serverless-coupon-example-${stage}`)
