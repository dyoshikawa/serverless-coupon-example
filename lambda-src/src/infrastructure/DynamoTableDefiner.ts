import * as AWS from 'aws-sdk'

/** DynamoDBをローカルテストする際に利用するクラス */
export class DynamoTableDefiner {
  private dynamoClient: AWS.DynamoDB
  private readonly tableName: string
  private readonly indexTableName: string

  constructor({
    dynamoClient,
    tableName,
    indexTableName,
  }: {
    dynamoClient: AWS.DynamoDB
    tableName: string
    indexTableName: string
  }) {
    this.dynamoClient = dynamoClient
    this.tableName = tableName
    this.indexTableName = indexTableName
  }

  async createCouponTable(): Promise<void> {
    const tableNames =
      (await this.dynamoClient.listTables().promise()).TableNames || []
    if (tableNames.includes(this.tableName)) return

    await this.dynamoClient
      .createTable({
        TableName: this.tableName,
        AttributeDefinitions: [
          {
            AttributeType: 'S',
            AttributeName: 'id',
          },
        ],
        KeySchema: [
          {
            KeyType: 'HASH',
            AttributeName: 'id',
          },
        ],
        BillingMode: 'PAY_PER_REQUEST',
      })
      .promise()
      .catch((e) => Promise.reject(e))
  }

  async createCouponIndexTable(): Promise<void> {
    const tableNames =
      (await this.dynamoClient.listTables().promise()).TableNames || []
    if (tableNames.includes(this.indexTableName)) return

    await this.dynamoClient
      .createTable({
        TableName: this.indexTableName,
        AttributeDefinitions: [
          {
            AttributeType: 'S',
            AttributeName: 'key',
          },
          {
            AttributeType: 'S',
            AttributeName: 'couponId',
          },
        ],
        KeySchema: [
          {
            KeyType: 'HASH',
            AttributeName: 'key',
          },
          {
            KeyType: 'RANGE',
            AttributeName: 'couponId',
          },
        ],
        GlobalSecondaryIndexes: [
          {
            Projection: {
              ProjectionType: 'KEYS_ONLY',
            },
            IndexName: 'couponId-index',
            KeySchema: [{ KeyType: 'HASH', AttributeName: 'couponId' }],
          },
        ],
        BillingMode: 'PAY_PER_REQUEST',
      })
      .promise()
      .catch((e) => Promise.reject(e))
  }

  async destroyCouponTable(): Promise<void> {
    const tableNames =
      (await this.dynamoClient.listTables().promise()).TableNames || []
    if (!tableNames.includes(this.tableName)) return

    await this.dynamoClient
      .deleteTable({
        TableName: this.tableName,
      })
      .promise()
      .catch((e) => Promise.reject(e))
  }

  async destroyCouponIndexTable(): Promise<void> {
    const tableNames =
      (await this.dynamoClient.listTables().promise()).TableNames || []
    if (!tableNames.includes(this.indexTableName)) return

    await this.dynamoClient
      .deleteTable({
        TableName: this.indexTableName,
      })
      .promise()
      .catch((e) => Promise.reject(e))
  }
}
