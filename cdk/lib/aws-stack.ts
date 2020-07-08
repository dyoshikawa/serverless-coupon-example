import * as cdk from '@aws-cdk/core'
import {
  createCreateCouponIndexLambda,
  createCreateCouponLambda,
  createFindCouponById,
  createSearchCouponLambda,
} from './lambda'
import { createApi } from './apigateway'
import { createBucket } from './s3'
import { createDistribution, createOriginAccessIdentity } from './cloudfront'
import { createCouponIndexTable, createCouponTable } from './dynamodb'
import { getStage } from './Stage'

export class AwsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)
    const stage = getStage()
    const prefix = id

    // s3 & cloudfront
    const originAccessIdentity = createOriginAccessIdentity({
      scope: this,
      prefix,
    })
    const bucket = createBucket({
      scope: this,
      prefix,
      originAccessIdentity,
      stage,
    })
    const distribution = createDistribution({
      scope: this,
      prefix,
      originAccessIdentity,
      bucket,
    })

    // dynamodb
    const couponTable = createCouponTable({ prefix, scope: this, stage })
    const couponIndexTable = createCouponIndexTable({
      prefix,
      scope: this,
      stage,
    })

    // lambda
    const lambdaEnvironment = {
      COUPON_TABLE_NAME: couponTable.tableName,
      COUPON_INDEX_TABLE_NAME: couponIndexTable.tableName,
      BUCKET_NAME: bucket.bucketName,
      DOMAIN_NAME: distribution.domainName,
      ALLOW_ORIGIN: stage === 'prod' ? '' : '*',
    }
    const findCouponByIdLambda = createFindCouponById({
      scope: this,
      prefix,
      environment: lambdaEnvironment,
      couponTable,
    })
    const searchCouponLambda = createSearchCouponLambda({
      scope: this,
      prefix,
      environment: lambdaEnvironment,
      couponTable,
      couponIndexTable,
    })
    const createCouponLambda = createCreateCouponLambda({
      scope: this,
      prefix,
      environment: lambdaEnvironment,
      couponTable,
      couponIndexTable,
      bucket,
    })
    createCreateCouponIndexLambda({
      scope: this,
      prefix,
      environment: lambdaEnvironment,
      couponTable,
      couponIndexTable,
    })

    // apigateway
    createApi({
      scope: this,
      prefix,
      stage,
      findCouponByIdLambda,
      searchCouponLambda,
      createCouponLambda,
    })
  }
}
