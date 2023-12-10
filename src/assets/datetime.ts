import moment, {Moment} from "moment";

export const ISO_DATE = 'YYYY-MM-DD'
export const ISO_DATETIME = 'YYYY-MM-DDTHH:mm:SS'

export function getIsoDate(d: Moment | Date | string): string {
  return moment(d).format(ISO_DATE)
}

export function getIsoDatetime(d: Moment | Date | string): string {
  return moment(d).format(ISO_DATETIME)
}

export function getDatesRange(dateStart: Moment | Date | string, dateEnd: Moment | Date | string): Array<moment.Moment> {
  const dates: Array<moment.Moment> = [];

  dateStart = moment(dateStart)
  dateEnd = moment(dateEnd)

  while(dateStart.format(ISO_DATE) <= dateEnd.format(ISO_DATE)) {
    dates.push(dateStart.clone());
    dateStart.add(1, 'days')
  }

  return dates;
}
