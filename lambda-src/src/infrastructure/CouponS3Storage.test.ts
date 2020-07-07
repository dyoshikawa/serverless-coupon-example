import * as AWS from 'aws-sdk'
import { S3BucketDefiner } from './S3BucketDefiner'
import { CouponS3Storage } from './CouponS3Storage'
import { readFileSync } from 'fs'

describe('CouponS3Storage', () => {
  const s3Client = new AWS.S3({
    region: 'ap-northeast-1',
    endpoint: 'http://localhost:4566',
    s3ForcePathStyle: true,
  })
  const bucketName = 'coupon-image'
  const baseUrl = 'https://example.com'

  beforeAll(async () => {
    const s3BucketDefiner = new S3BucketDefiner({
      s3Client,
      couponBucketName: bucketName,
    })
    await s3BucketDefiner.createCouponBucket()
  })

  it('ファイルをアップロードし、アップロードされたファイルURLを取得する', async () => {
    const couponS3Storage = new CouponS3Storage({
      s3Client,
      bucketName,
      baseUrl,
    })
    const imageFile = readFileSync('./resource/coupon_image.png')
    const imageUrl = await couponS3Storage.save(imageFile, 'image.png')
    expect(imageUrl).toBe('https://example.com/image.png')
  })
})
