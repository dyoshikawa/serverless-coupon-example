import { ResourceId } from './ResourceId'
import * as dynamodb from '@aws-cdk/aws-dynamodb'
import * as cdk from '@aws-cdk/core'
import { Stage } from './Stage'

export const createCouponTable = ({
  prefix,
  scope,
  stage,
}: {
  prefix: string
  scope: cdk.Construct
  stage: Stage
}): dynamodb.Table => {
  const couponTableId = new ResourceId(prefix, 'coupon-table')
  return new dynamodb.Table(scope, couponTableId.toString(), {
    partitionKey: {
      name: 'id',
      type: dynamodb.AttributeType.STRING,
    },
    tableName: couponTableId.toString(),
    stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
    billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    removalPolicy:
      stage === 'prod' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
  })
}

export const createCouponIndexTable = ({
  prefix,
  scope,
  stage,
}: {
  prefix: string
  scope: cdk.Construct
  stage: Stage
}): dynamodb.Table => {
  const couponIndexTableId = new ResourceId(prefix, 'coupon-index-table')
  const couponIndexTable = new dynamodb.Table(
    scope,
    couponIndexTableId.toString(),
    {
      partitionKey: {
        name: 'key',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'couponId',
        type: dynamodb.AttributeType.STRING,
      },
      tableName: couponIndexTableId.toString(),
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy:
        stage === 'prod' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    }
  )
  couponIndexTable.addGlobalSecondaryIndex({
    indexName: `couponId-index`,
    partitionKey: {
      name: 'couponId',
      type: dynamodb.AttributeType.STRING,
    },
  })
  return couponIndexTable
}
