import AWS from 'aws-sdk'
import { Coupon, CouponIndex } from '../entity/Coupon'
import { CouponRepository } from '../repository/CouponRepository'
import { CouponStorage } from '../storage/CouponStorage'
import { Time } from '../time/Time'
import { COUPON_NOT_FOUND } from '../constant/error'
import { SearchCouponResult, StartKey } from '../service/CouponService'

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
    return couponDynamoItems.map((item) => ({
      ...item,
      savedAt: this.time.fromString(item.savedAt),
    }))
  }

  async findById(id: string): Promise<Coupon> {
    const output = await this.dynamoClient
      .get({
        TableName: this.tableName,
        Key: {
          id,
        },
      })
      .promise()
    const item = output.Item as CouponDynamoItem | undefined
    if (item === undefined) return Promise.reject(new Error(COUPON_NOT_FOUND))

    return {
      ...item,
      savedAt: this.time.fromString(item.savedAt),
    }
  }

  async findByWord({
    word,
    startKey,
    per,
  }: {
    word: string
    startKey?: { key: string; couponId: string }
    per?: number
  }): Promise<SearchCouponResult> {
    const output = await this.dynamoClient
      .query({
        TableName: this.indexTableName,
        ExpressionAttributeNames: { '#name': 'key' },
        ExpressionAttributeValues: { ':val': word },
        KeyConditionExpression: '#name = :val',
        ExclusiveStartKey: startKey,
        Limit: per || 5,
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
    return {
      coupons: couponDynamoItems.map((item) => ({
        ...item,
        savedAt: this.time.fromString(item.savedAt),
      })),
      startKey: output.LastEvaluatedKey as StartKey | undefined,
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
    id: string
    title: string
    description: string
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
      id,
      title,
      description,
      imageUrl,
      qrCodeUrl,
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
    return { ...dynamoItem, savedAt: savedAt }
  }

  async destroy(id: string): Promise<void> {
    await this.dynamoClient
      .delete({
        TableName: this.tableName,
        Key: {
          id,
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
    return dynamoItems.map((item) => ({
      ...item,
      savedAt: this.time.fromString(item.savedAt),
    }))
  }

  async saveIndexes(
    params: Array<{ key: string; couponId: string }>
  ): Promise<Array<CouponIndex>> {
    const savedAt = this.time.now()
    const promises = params.map(({ key, couponId }) => {
      return this.dynamoClient
        .put({
          TableName: this.indexTableName,
          Item: {
            key,
            couponId,
            savedAt: savedAt.toISOString(),
          },
        })
        .promise()
    })
    await Promise.all(promises).catch((errs) => Promise.reject(errs))
    return params.map(({ key, couponId }) => ({
      key,
      couponId,
      savedAt,
    }))
  }

  async findIndexesByCouponId(couponId: string): Promise<Array<CouponIndex>> {
    const output = await this.dynamoClient
      .query({
        TableName: this.indexTableName,
        IndexName: 'couponId-index',
        ExpressionAttributeNames: { '#name': 'couponId' },
        ExpressionAttributeValues: { ':val': couponId },
        KeyConditionExpression: '#name = :val',
      })
      .promise()
      .catch((e) => Promise.reject(e))
    const indexDynamoItems = output.Items as
      | Array<CouponIndexDynamoItem>
      | undefined
    if (indexDynamoItems === undefined) return []

    return indexDynamoItems.map((item) => ({
      ...item,
      savedAt: this.time.fromString(item.savedAt),
    }))
  }

  async destroyIndexes(
    params: Array<{
      key: string
      couponId: string
    }>
  ): Promise<void> {
    const promises = params.map(({ key, couponId }) => {
      return this.dynamoClient
        .delete({
          TableName: this.indexTableName,
          Key: {
            key,
            couponId,
          },
        })
        .promise()
    })
    await Promise.all(promises).catch((errs) => Promise.reject(errs))
  }
}
