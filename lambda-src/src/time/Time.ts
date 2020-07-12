export interface Time {
  now: () => Date
  format: (date: Date, fmt: string) => string
  fromString: (isoString: string) => Date
}
