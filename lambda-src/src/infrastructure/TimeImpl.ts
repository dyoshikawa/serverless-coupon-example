import dayjs from 'dayjs'
import 'dayjs/locale/ja'
import { Time } from '../time/Time'

export class TimeImpl implements Time {
  constructor(locale: 'utc' | 'ja' = 'ja') {
    dayjs().locale(locale)
  }

  now(): Date {
    return dayjs().toDate()
  }

  format(date: Date, fmt: string): string {
    return dayjs(date).format(fmt)
  }

  fromString(isoString: string): Date {
    return dayjs(isoString).toDate()
  }
}
