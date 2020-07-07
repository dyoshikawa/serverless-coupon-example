export class ResourceId {
  prefix: string
  name: string

  constructor(prefix: string, name: string) {
    this.prefix = prefix
    this.name = name
  }

  toString(): string {
    return `${this.prefix}-${this.name}`
  }
}
