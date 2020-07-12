import dayjs from 'dayjs'
import { Time } from '../domain/time/Time'

export class TimeImpl implements Time {
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
