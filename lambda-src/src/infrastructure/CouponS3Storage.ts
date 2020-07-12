import AWS from 'aws-sdk'
import { CouponStorage } from '../domain/storage/CouponStorage'
import { Url } from '../domain/entity/Url'

export class CouponS3Storage implements CouponStorage {
  private readonly s3Client: AWS.S3
  private readonly bucketName: string
  private readonly baseUrl: Url

  constructor({
    s3Client,
    bucketName,
    baseUrl,
  }: {
    s3Client: AWS.S3
    bucketName: string
    baseUrl: Url
  }) {
    this.s3Client = s3Client
    this.bucketName = bucketName
    this.baseUrl = baseUrl
  }

  async save(buf: Buffer, fileName: string): Promise<Url> {
    await this.s3Client
      .putObject({
        Bucket: this.bucketName,
        Key: fileName,
        Body: buf,
      })
      .promise()
      .catch((e) => Promise.reject(e))
    return Promise.resolve(new Url(`${this.baseUrl}/${fileName}`))
  }
}
