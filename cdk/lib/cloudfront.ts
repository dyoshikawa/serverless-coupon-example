import { ResourceId } from './ResourceId'
import * as cdk from '@aws-cdk/core'
import * as s3 from '@aws-cdk/aws-s3'
import * as cloudfront from '@aws-cdk/aws-cloudfront'

export const createOriginAccessIdentity = ({
  prefix,
  scope,
}: {
  prefix: string
  scope: cdk.Construct
}): cloudfront.OriginAccessIdentity => {
  const originAccessIdentityId = new ResourceId(
    prefix,
    'coupon-origin-access-identity'
  )
  return new cloudfront.OriginAccessIdentity(
    scope,
    originAccessIdentityId.toString()
  )
}

export const createDistribution = ({
  prefix,
  scope,
  originAccessIdentity,
  bucket,
}: {
  prefix: string
  scope: cdk.Construct
  originAccessIdentity: cloudfront.OriginAccessIdentity
  bucket: s3.Bucket
}): cloudfront.CloudFrontWebDistribution => {
  const distributionId = new ResourceId(prefix, 'coupon-distribution')
  return new cloudfront.CloudFrontWebDistribution(
    scope,
    distributionId.toString(),
    {
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      httpVersion: cloudfront.HttpVersion.HTTP2,
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: bucket,
            originAccessIdentity: originAccessIdentity,
          },
          behaviors: [
            {
              isDefaultBehavior: true,
              compress: true,
              minTtl: cdk.Duration.seconds(0),
              maxTtl: cdk.Duration.days(365),
              defaultTtl: cdk.Duration.days(1),
            },
          ],
        },
      ],
    }
  )
}
