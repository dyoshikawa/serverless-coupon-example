import { PER_INVALID } from '../constant/error'

export class PagePer {
  private readonly value: number

  constructor(value: number) {
    if (value < 1) throw new Error(PER_INVALID)
    this.value = value
  }

  toNumber(): number {
    return this.value
  }
}
