import * as cdk from '@aws-cdk/core'
import * as lambda from '@aws-cdk/aws-lambda'
import * as dynamodb from '@aws-cdk/aws-dynamodb'
import * as iam from '@aws-cdk/aws-iam'
import * as lambdaEventSources from '@aws-cdk/aws-lambda-event-sources'
import * as s3 from '@aws-cdk/aws-s3'
import { ResourceId } from './ResourceId'

const defaultLambdaProps: lambda.FunctionProps = {
  runtime: lambda.Runtime.NODEJS_12_X,
  handler: '',
  code: lambda.Code.fromAsset('../lambda-src/dist/lambda'),
  functionName: '',
  environment: {},
}

export type LambdaEnvironment = {
  COUPON_TABLE_NAME: string
  COUPON_INDEX_TABLE_NAME: string
  BUCKET_NAME: string
  DOMAIN_NAME: string
}

export type LambdaProps = {
  scope: cdk.Construct
  prefix: string
  environment: LambdaEnvironment
}

export const createCreateCouponLambda = ({
  scope,
  prefix,
  environment,
  couponTable,
  couponIndexTable,
  bucket,
}: LambdaProps & {
  couponTable: dynamodb.Table
  couponIndexTable: dynamodb.Table
  bucket: s3.Bucket
}): lambda.Function => {
  const createCouponLambdaId = new ResourceId(prefix, 'create-coupon-function')
  const createCouponLambda = new lambda.Function(
    scope,
    createCouponLambdaId.toString(),
    {
      ...defaultLambdaProps,
      handler: 'bundle.createCoupon',
      functionName: createCouponLambdaId.toString(),
      environment,
    }
  )
  couponTable.grantFullAccess(createCouponLambda)
  couponIndexTable.grantFullAccess(createCouponLambda)
  bucket.grantReadWrite(createCouponLambda)
  return createCouponLambda
}

export const createCreateCouponIndexLambda = ({
  scope,
  prefix,
  environment,
  couponTable,
  couponIndexTable,
}: LambdaProps & {
  couponTable: dynamodb.Table
  couponIndexTable: dynamodb.Table
}): lambda.Function => {
  const createCouponIndexLambdaId = new ResourceId(
    prefix,
    'create-coupon-index-function'
  )
  const createCouponIndexLambda = new lambda.Function(
    scope,
    createCouponIndexLambdaId.toString(),
    {
      ...defaultLambdaProps,
      handler: 'bundle.createCouponIndex',
      functionName: createCouponIndexLambdaId.toString(),
      environment,
    }
  )
  createCouponIndexLambda.addToRolePolicy(
    new iam.PolicyStatement({
      resources: ['*'],
      actions: ['comprehend:*'],
    })
  )
  couponTable.grantFullAccess(createCouponIndexLambda)
  couponIndexTable.grantFullAccess(createCouponIndexLambda)
  createCouponIndexLambda.addEventSource(
    new lambdaEventSources.DynamoEventSource(couponTable, {
      startingPosition: lambda.StartingPosition.TRIM_HORIZON,
      batchSize: 5,
      retryAttempts: 3, // 再試行
    })
  )
  return createCouponIndexLambda
}

export const createSearchCouponLambda = ({
  scope,
  prefix,
  environment,
  couponTable,
  couponIndexTable,
}: LambdaProps & {
  couponTable: dynamodb.Table
  couponIndexTable: dynamodb.Table
}): lambda.Function => {
  const searchCouponLambdaId = new ResourceId(prefix, 'search-coupon-function')
  const searchCouponLambda = new lambda.Function(
    scope,
    searchCouponLambdaId.toString(),
    {
      ...defaultLambdaProps,
      handler: 'bundle.searchCoupon',
      functionName: searchCouponLambdaId.toString(),
      environment,
    }
  )
  couponTable.grantFullAccess(searchCouponLambda)
  couponIndexTable.grantFullAccess(searchCouponLambda)
  return searchCouponLambda
}

export const createFindCouponById = ({
  scope,
  prefix,
  environment,
  couponTable,
}: LambdaProps & {
  couponTable: dynamodb.Table
}): lambda.Function => {
  const findCouponByIdLambdaId = new ResourceId(
    prefix,
    'find-coupon-by-id-function'
  )
  const findCouponByIdLambda = new lambda.Function(
    scope,
    findCouponByIdLambdaId.toString(),
    {
      ...defaultLambdaProps,
      handler: 'bundle.findCouponById',
      functionName: findCouponByIdLambdaId.toString(),
      environment,
    }
  )
  couponTable.grantFullAccess(findCouponByIdLambda)
  return findCouponByIdLambda
}
