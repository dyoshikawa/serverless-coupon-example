import AWS from 'aws-sdk'
import { ImageEncoder } from './domain/encoder/ImageEncoder'
import { CouponStorage } from './domain/storage/CouponStorage'
import { CouponS3Storage } from './infrastructure/CouponS3Storage'
import * as Config from './config'
import { CouponRepository } from './domain/repository/CouponRepository'
import { CouponDynamoRepository } from './infrastructure/CouponDynamoRepository'
import { ImageEncoderImpl } from './infrastructure/ImageEncoderImpl'
import { ComprehendTokenizer } from './infrastructure/ComprehendTokenizer'
import { Tokenizer } from './domain/tokenier/Tokenizer'
import { TimeImpl } from './infrastructure/TimeImpl'
import { Time } from './domain/time/Time'
import { CouponApplication } from './application/CouponApplication'
import { CouponApplicationImpl } from './application/CouponApplicationImpl'
import { Url } from './domain/entity/Url'
import { JsonSerializerImpl } from './presentation/json_serializer/JsonSerializerImpl'
import { JsonSerializer } from './presentation/json_serializer/JsonSerializer'

export type Container = {
  couponStorage: CouponStorage
  couponRepository: CouponRepository
  imageEncoder: ImageEncoder
  couponService: CouponApplication
  jsonSerializer: JsonSerializer
}

export const bootstrap = (): Container => {
  const couponStorage: CouponStorage = new CouponS3Storage({
    s3Client: new AWS.S3(),
    bucketName: Config.bucketName(),
    baseUrl: new Url(`https://${Config.domainName()}`),
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
  const couponService: CouponApplication = new CouponApplicationImpl({
    couponRepository,
    imageEncoder,
    tokenizer,
  })
  const jsonSerializer = new JsonSerializerImpl()
  return {
    couponStorage,
    couponRepository,
    imageEncoder,
    couponService,
    jsonSerializer,
  }
}
