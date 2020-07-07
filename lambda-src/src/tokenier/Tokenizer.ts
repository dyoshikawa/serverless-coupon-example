export interface Tokenizer {
  pickWords: (sentence: string) => Promise<Array<string>>
}
