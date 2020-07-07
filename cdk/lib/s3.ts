import { ResourceId } from './ResourceId'
import * as s3 from '@aws-cdk/aws-s3'
import * as cdk from '@aws-cdk/core'
import * as cloudfront from '@aws-cdk/aws-cloudfront'
import * as iam from '@aws-cdk/aws-iam'
import { CanonicalUserPrincipal } from '@aws-cdk/aws-iam'
import { Stage } from './Stage'

const createBucketPolicy = ({
  bucket,
  originAccessIdentity,
}: {
  bucket: s3.Bucket
  originAccessIdentity: cloudfront.OriginAccessIdentity
}): iam.PolicyStatement =>
  new iam.PolicyStatement({
    effect: iam.Effect.ALLOW,
    actions: ['s3:GetObject'],
    principals: [
      new CanonicalUserPrincipal(
        originAccessIdentity.cloudFrontOriginAccessIdentityS3CanonicalUserId
      ),
    ],
    resources: [bucket.bucketArn + '/*'],
  })

export const createBucket = ({
  scope,
  prefix,
  originAccessIdentity,
  stage,
}: {
  scope: cdk.Construct
  prefix: string
  originAccessIdentity: cloudfront.OriginAccessIdentity
  stage: Stage
}): s3.Bucket => {
  const bucketId = new ResourceId(prefix, 'coupon-image')
  const bucket = new s3.Bucket(scope, bucketId.toString(), {
    bucketName: bucketId.toString(),
    removalPolicy:
      stage === 'prod' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
  })
  const policy = createBucketPolicy({
    bucket,
    originAccessIdentity,
  })
  bucket.addToResourcePolicy(policy)
  return bucket
}
