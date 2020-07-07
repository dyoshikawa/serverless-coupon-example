import AWS from 'aws-sdk'
import { CouponStorage } from '../storage/CouponStorage'

export class CouponS3Storage implements CouponStorage {
  private s3Client: AWS.S3
  private bucketName: string
  private baseUrl: string

  constructor({
    s3Client,
    bucketName,
    baseUrl,
  }: {
    s3Client: AWS.S3
    bucketName: string
    baseUrl: string
  }) {
    this.s3Client = s3Client
    this.bucketName = bucketName
    this.baseUrl = baseUrl
  }

  async save(buf: Buffer, fileName: string): Promise<string> {
    await this.s3Client
      .putObject({
        Bucket: this.bucketName,
        Key: fileName,
        Body: buf,
      })
      .promise()
      .catch((e) => Promise.reject(e))
    return Promise.resolve(`${this.baseUrl}/${fileName}`)
  }
}
