export class ParameterDecodeError extends Error {
  errors: Array<string>

  constructor(errors: Array<string>) {
    super()
    this.errors = errors
  }
}
