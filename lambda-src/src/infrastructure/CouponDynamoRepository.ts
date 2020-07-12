import AWS from 'aws-sdk'
import { Coupon, CouponIndex } from '../entity/Coupon'
import { CouponRepository } from '../repository/CouponRepository'
import { CouponStorage } from '../storage/CouponStorage'
import { Time } from '../time/Time'
import { COUPON_NOT_FOUND } from '../constant/error'
import { SearchCouponResult } from '../app_service/CouponAppService'
import { CouponTitle } from '../entity/CouponTitle'
import { CouponDescription } from '../entity/CouponDescription'
import { CouponId } from '../entity/CouponId'
import { Url } from '../entity/Url'
import { Keyword } from '../entity/Keyword'
import { StartKey } from '../entity/StartKey'
import { PagePer } from '../entity/PagePer'

export type CouponDynamoItem = {
  id: string
  title: string
  description: string
  imageUrl: string
  qrCodeUrl: string
  savedAt: string
  savedAtDay: string
}

export type CouponIndexDynamoItem = {
  key: string
  couponId: string
  savedAt: string
}

export class CouponDynamoRepository implements CouponRepository {
  private dynamoClient: AWS.DynamoDB.DocumentClient
  private tableName: string
  private indexTableName: string
  private couponStorage: CouponStorage
  private time: Time

  constructor({
    dynamoClient,
    tableName,
    indexTableName,
    couponStorage,
    time,
  }: {
    dynamoClient: AWS.DynamoDB.DocumentClient
    tableName: string
    indexTableName: string
    couponStorage: CouponStorage
    time: Time
  }) {
    this.dynamoClient = dynamoClient
    this.tableName = tableName
    this.indexTableName = indexTableName
    this.couponStorage = couponStorage
    this.time = time
  }

  private toCoupon(item: CouponDynamoItem) {
    const { id, title, description, imageUrl, qrCodeUrl, savedAt } = item
    return new Coupon({
      id: new CouponId(id),
      title: new CouponTitle(title),
      description: new CouponDescription(description),
      imageUrl: new Url(imageUrl),
      qrCodeUrl: new Url(qrCodeUrl),
      savedAt: this.time.fromString(savedAt),
    })
  }

  private toCouponIndex(item: CouponIndexDynamoItem) {
    const { key, couponId, savedAt } = item
    return new CouponIndex({
      key: new Keyword(key),
      couponId: new CouponId(couponId),
      savedAt: this.time.fromString(savedAt),
    })
  }

  async findAll(): Promise<Array<Coupon>> {
    const couponDynamoItems =
      ((
        await this.dynamoClient
          .scan({
            TableName: this.tableName,
          })
          .promise()
          .catch((e) => Promise.reject(e))
      ).Items as Array<CouponDynamoItem>) || []
    return couponDynamoItems.map((item) => this.toCoupon(item))
  }

  async findById(id: CouponId): Promise<Coupon> {
    const output = await this.dynamoClient
      .get({
        TableName: this.tableName,
        Key: {
          id: id.toString(),
        },
      })
      .promise()
    const item = output.Item as CouponDynamoItem | undefined
    if (item === undefined) return Promise.reject(new Error(COUPON_NOT_FOUND))

    return this.toCoupon(item)
  }

  async findByKeyword({
    keyword,
    startKey,
    per,
  }: {
    keyword: Keyword
    startKey?: StartKey
    per?: PagePer
  }): Promise<SearchCouponResult> {
    const output = await this.dynamoClient
      .query({
        TableName: this.indexTableName,
        ExpressionAttributeNames: { '#name': 'key' },
        ExpressionAttributeValues: { ':val': keyword.toString() },
        KeyConditionExpression: '#name = :val',
        ExclusiveStartKey: startKey?.toObject(),
        Limit: per?.toNumber() || 5,
      })
      .promise()
      .catch((e) => Promise.reject(e))
    const indexDynamoItems =
      (output.Items as Array<CouponIndexDynamoItem>) || []
    const couponDynamoPromises = indexDynamoItems.map((item) => {
      return this.dynamoClient
        .get({
          TableName: this.tableName,
          Key: {
            id: item.couponId,
          },
        })
        .promise()
    })
    const couponDynamoItems = (await Promise.all(couponDynamoPromises)).map(
      (item) => item.Item
    ) as Array<CouponDynamoItem>
    const lastEvaluatedKey = output.LastEvaluatedKey as
      | {
          key: string
          couponId: string
        }
      | undefined
    return {
      coupons: couponDynamoItems.map((item) => this.toCoupon(item)),
      startKey:
        lastEvaluatedKey === undefined
          ? undefined
          : new StartKey(
              new Keyword(lastEvaluatedKey.key),
              new CouponId(lastEvaluatedKey.couponId)
            ),
    }
  }

  async save({
    id,
    title,
    description,
    imageFile,
    imageName,
    qrCodeFile,
    qrCodeName,
  }: {
    id: CouponId
    title: CouponTitle
    description: CouponDescription
    imageFile: Buffer
    imageName: string
    qrCodeFile: Buffer
    qrCodeName: string
  }): Promise<Coupon> {
    const imageUrl = await this.couponStorage.save(imageFile, imageName)
    const qrCodeUrl = await this.couponStorage.save(qrCodeFile, qrCodeName)
    const savedAt = this.time.now()
    const savedAtDay = this.time.format(savedAt, 'YYYY-MM-DD')
    const dynamoItem: CouponDynamoItem = {
      id: id.toString(),
      title: title.toString(),
      description: description.toString(),
      imageUrl: imageUrl.toString(),
      qrCodeUrl: qrCodeUrl.toString(),
      savedAt: savedAt.toISOString(), // DynamoDBにDate型はないため
      savedAtDay,
    }
    await this.dynamoClient
      .put({
        TableName: this.tableName,
        Item: dynamoItem,
      })
      .promise()
      .catch((e) => Promise.reject(e))
    return this.toCoupon(dynamoItem)
  }

  async destroy(id: CouponId): Promise<void> {
    await this.dynamoClient
      .delete({
        TableName: this.tableName,
        Key: {
          id: id.toString(),
        },
      })
      .promise()
      .catch((e) => Promise.reject(e))
  }

  async findAllIndexes(): Promise<Array<CouponIndex>> {
    const dynamoItems =
      ((
        await this.dynamoClient
          .scan({
            TableName: this.indexTableName,
          })
          .promise()
          .catch((e) => Promise.reject(e))
      ).Items as Array<CouponIndexDynamoItem>) || []
    return dynamoItems.map((item) => this.toCouponIndex(item))
  }

  async saveIndexes(
    params: Array<{ key: Keyword; couponId: CouponId }>
  ): Promise<Array<CouponIndex>> {
    const savedAt = this.time.now()
    const promises = params.map(({ key, couponId }) => {
      return this.dynamoClient
        .put({
          TableName: this.indexTableName,
          Item: {
            key: key.toString(),
            couponId: couponId.toString(),
            savedAt: savedAt.toISOString(),
          },
        })
        .promise()
    })
    await Promise.all(promises).catch((errs) => Promise.reject(errs))
    return params.map(
      ({ key, couponId }) =>
        new CouponIndex({
          key,
          couponId,
          savedAt,
        })
    )
  }

  async findIndexesByCouponId(couponId: CouponId): Promise<Array<CouponIndex>> {
    const output = await this.dynamoClient
      .query({
        TableName: this.indexTableName,
        IndexName: 'couponId-index',
        ExpressionAttributeNames: { '#name': 'couponId' },
        ExpressionAttributeValues: { ':val': couponId.toString() },
        KeyConditionExpression: '#name = :val',
      })
      .promise()
      .catch((e) => Promise.reject(e))
    const indexDynamoItems = output.Items as
      | Array<CouponIndexDynamoItem>
      | undefined
    if (indexDynamoItems === undefined) return []

    return indexDynamoItems.map((item) => this.toCouponIndex(item))
  }

  async destroyIndexes(
    params: Array<{
      key: Keyword
      couponId: CouponId
    }>
  ): Promise<void> {
    const promises = params.map(({ key, couponId }) => {
      return this.dynamoClient
        .delete({
          TableName: this.indexTableName,
          Key: {
            key: key.toString(),
            couponId: couponId.toString(),
          },
        })
        .promise()
    })
    await Promise.all(promises).catch((errs) => Promise.reject(errs))
  }
}
