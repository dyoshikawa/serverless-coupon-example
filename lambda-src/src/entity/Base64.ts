import isBase64 from 'validator/lib/isBase64'
import { INVALID_BASE64 } from '../constant/error'

export class Base64 {
  private readonly value: string

  constructor(value: string) {
    if (!isBase64(value)) throw new Error(INVALID_BASE64)
    this.value = value
  }

  toString(): string {
    return this.value
  }
}
