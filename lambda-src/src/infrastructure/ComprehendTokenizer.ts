import AWS from 'aws-sdk'
import { Tokenizer } from '../domain/tokenier/Tokenizer'

export class ComprehendTokenizer implements Tokenizer {
  private comprehendClient: AWS.Comprehend

  constructor(comprehendClient: AWS.Comprehend) {
    this.comprehendClient = comprehendClient
  }

  async pickWords(sentence: string): Promise<Array<string>> {
    const res = await this.comprehendClient
      .detectEntities({
        Text: sentence,
        LanguageCode: 'ja',
      })
      .promise()
      .catch((e) => Promise.reject(e))
    const entities = res.Entities
    if (entities === undefined) return []

    return entities
      .map((entity) => entity.Text || '')
      .filter((text) => text !== '')
  }
}
