import * as cdk from '@aws-cdk/core'
import * as apigateway from '@aws-cdk/aws-apigateway'
import * as lambda from '@aws-cdk/aws-lambda'
import { ResourceId } from './ResourceId'
import { Stage } from './Stage'

const defaultApiProps: apigateway.RestApiProps = {
  restApiName: '',
  deployOptions: {
    stageName: 'dev',
  },
}

export const createApi = ({
  scope,
  prefix,
  stage,
  findCouponByIdLambda,
  searchCouponLambda,
  createCouponLambda,
}: {
  scope: cdk.Construct
  prefix: string
  stage: Stage
  findCouponByIdLambda: lambda.Function
  searchCouponLambda: lambda.Function
  createCouponLambda: lambda.Function
}): apigateway.RestApi => {
  const apiId = new ResourceId(prefix, 'api')
  const api = new apigateway.RestApi(scope, apiId.toString(), {
    ...defaultApiProps,
    restApiName: apiId.toString(),
    deployOptions: {
      stageName: stage,
    },
  })

  const coupons = api.root.addResource('coupons')

  const findCouponByIdIntegration = new apigateway.LambdaIntegration(
    findCouponByIdLambda
  )
  coupons.addResource('{couponId}').addMethod('GET', findCouponByIdIntegration)

  const searchCouponIntegration = new apigateway.LambdaIntegration(
    searchCouponLambda
  )
  coupons.addResource('search').addMethod('GET', searchCouponIntegration)

  if (stage !== 'prod') {
    // テストデータ投入用エンドポイント
    const createCouponIntegration = new apigateway.LambdaIntegration(
      createCouponLambda
    )
    coupons.addMethod('POST', createCouponIntegration)
  }

  return api
}
