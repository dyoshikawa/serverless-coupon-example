import { AttributeValue, DynamoDBStreamEvent } from 'aws-lambda'
import { bootstrap } from '../../bootstrap'
import { CouponId } from '../../entity/CouponId'
import { CouponTitle } from '../../entity/CouponTitle'

export const createCouponIndex = async (
  event: DynamoDBStreamEvent
): Promise<void> => {
  const { couponApplication } = bootstrap()
  for (const record of event.Records) {
    switch (record.eventName) {
      case 'INSERT': {
        console.log('insert')
        const newItem = record.dynamodb?.NewImage as
          | {
              id: AttributeValue
              title: AttributeValue
            }
          | undefined
        if (newItem === undefined)
          return Promise.reject(new Error('Undefined: newItem'))

        if (newItem.id.S === undefined)
          return Promise.reject(new Error('Undefined: newItem.id.S'))
        if (newItem.title.S === undefined)
          return Promise.reject(new Error('Undefined: newItem.title.S'))

        await couponApplication
          .createIndexes(
            new CouponId(newItem.id.S),
            new CouponTitle(newItem.title.S)
          )
          .catch((e) => Promise.reject(e))
        break
      }
      case 'MODIFY': {
        console.log('modify')
        const newItem = record.dynamodb?.NewImage as
          | {
              id: AttributeValue
              title: AttributeValue
            }
          | undefined
        if (newItem === undefined)
          return Promise.reject(new Error('Undefined: newItem'))

        if (newItem.id.S === undefined)
          return Promise.reject(new Error('Undefined: newItem.id.S'))
        if (newItem.title.S === undefined)
          return Promise.reject(new Error('Undefined: newItem.title.S'))
        break
      }
      case 'REMOVE': {
        console.log('remove')
        const oldItem = record.dynamodb?.OldImage as
          | {
              id: AttributeValue
              title: AttributeValue
            }
          | undefined
        if (oldItem === undefined)
          return Promise.reject(new Error('Undefined: newItem'))

        if (oldItem.id.S === undefined)
          return Promise.reject(new Error('Undefined: newItem.id.S'))

        await couponApplication
          .destroyIndexes(new CouponId(oldItem.id.S))
          .catch((e) => Promise.reject(e))
        break
      }
      default: {
        return Promise.reject(new Error('Undefined value: record.eventName'))
      }
    }
  }
}
