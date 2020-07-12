import AWS from 'aws-sdk'
import { ImageEncoder } from './encoder/ImageEncoder'
import { CouponStorage } from './storage/CouponStorage'
import { CouponS3Storage } from './infrastructure/CouponS3Storage'
import * as Config from './config'
import { CouponRepository } from './repository/CouponRepository'
import { CouponDynamoRepository } from './infrastructure/CouponDynamoRepository'
import { ImageEncoderImpl } from './infrastructure/ImageEncoderImpl'
import { ComprehendTokenizer } from './infrastructure/ComprehendTokenizer'
import { Tokenizer } from './tokenier/Tokenizer'
import { TimeImpl } from './infrastructure/TimeImpl'
import { Time } from './time/Time'
import { CouponService } from './service/CouponAppService'
import { CouponServiceImpl } from './service/CouponAppServiceImpl'

export type Container = {
  couponStorage: CouponStorage
  couponRepository: CouponRepository
  imageEncoder: ImageEncoder
  couponService: CouponService
}

export const bootstrap = (): Container => {
  const couponStorage: CouponStorage = new CouponS3Storage({
    s3Client: new AWS.S3(),
    bucketName: Config.bucketName(),
    baseUrl: `https://${Config.domainName()}`,
  })
  const tokenizer: Tokenizer = new ComprehendTokenizer(new AWS.Comprehend())
  const time: Time = new TimeImpl()
  const couponRepository: CouponRepository = new CouponDynamoRepository({
    dynamoClient: new AWS.DynamoDB.DocumentClient(),
    tableName: Config.couponTableName(),
    indexTableName: Config.couponIndexTableName(),
    couponStorage,
    time,
  })
  const imageEncoder: ImageEncoder = new ImageEncoderImpl()
  const couponService: CouponService = new CouponServiceImpl({
    couponRepository,
    imageEncoder,
    tokenizer,
  })
  return {
    couponStorage,
    couponRepository,
    imageEncoder,
    couponService,
  }
}
