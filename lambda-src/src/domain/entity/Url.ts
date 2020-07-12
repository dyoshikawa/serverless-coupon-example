import isURL from 'validator/lib/isURL'
import { INVALID_URL } from '../../constant/error'

export class Url {
  private readonly url: string

  constructor(url: string) {
    if (!isURL(url)) throw new Error(INVALID_URL)
    this.url = url
  }

  toString(): string {
    return this.url
  }
}
