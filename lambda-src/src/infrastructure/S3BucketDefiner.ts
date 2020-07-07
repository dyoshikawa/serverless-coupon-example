import * as AWS from 'aws-sdk'

/** S3をローカルテストする際に利用するクラス */
export class S3BucketDefiner {
  private s3Client: AWS.S3
  private readonly couponBucketName: string

  constructor({
    s3Client,
    couponBucketName,
  }: {
    s3Client: AWS.S3
    couponBucketName: string
  }) {
    this.s3Client = s3Client
    this.couponBucketName = couponBucketName
  }

  async createCouponBucket(): Promise<void> {
    const bucketNames = (
      (await this.s3Client.listBuckets().promise()).Buckets || []
    ).map((bucket) => bucket.Name)
    if (bucketNames.includes(this.couponBucketName)) return

    await this.s3Client
      .createBucket({
        Bucket: this.couponBucketName,
      })
      .promise()
      .catch((e) => Promise.reject(e))
  }
}
