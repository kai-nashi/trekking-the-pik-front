import moment from "moment";
import {ISO_DATE} from "@/assets/datetime";
import {th} from "vuetify/locale";

export const FLAT_KEY_ROOMS_NONE = '-1'
export const FLAT_KEY_ROOMS_ONE = '1'
export const FLAT_KEY_ROOMS_TWO = '2'
export const FLAT_KEY_ROOMS_THREE = '3'

export const FLAT_LABEL_ROOMS_NONE = 'Студия'
export const FLAT_LABEL_ROOMS_ONE = 'Однокомнатная'
export const FLAT_LABEL_ROOMS_TWO = 'Двухкомнатная'
export const FLAT_LABEL_ROOMS_THREE = 'Трехкомнатная'


export const FLATS_NAME_BY_ROOMS_COUNT: Record<string, string> = {
    [FLAT_KEY_ROOMS_NONE]: FLAT_LABEL_ROOMS_NONE,
    [FLAT_KEY_ROOMS_ONE]: FLAT_LABEL_ROOMS_ONE,
    [FLAT_KEY_ROOMS_TWO]: FLAT_LABEL_ROOMS_TWO,
    [FLAT_KEY_ROOMS_THREE]: FLAT_LABEL_ROOMS_THREE,
}

export type ApiFlatChangeLog = {
  created_at: string,
  key: string,
  value: any,
  value_new: any
}

export const FLAT_STATUS_FREE = 'free'
export const FLAT_STATUS_RESERVE = 'reserve'
export const FLAT_STATUS_SOLD = 'sold'

export type ApiFlatStatus = typeof FLAT_STATUS_FREE | typeof FLAT_STATUS_RESERVE | typeof FLAT_STATUS_SOLD

export type ApiFlatJson = {
  id: number,
  area: number,
  changelog: Array<ApiFlatChangeLog>,
  block_id: number,
  block_name: string,
  block_slug: string,
  bulk_name: string,
  created_at: string,
  floor: number,
  price: number,
  rooms: number,
  status: ApiFlatStatus
}


export interface ApiFlatI {
  id: number
  area: number
  changelog: ApiFlatChangeLog[]
  blockId: number
  blockName: string
  blockSlug: string
  bulkName: string
  createdAt: moment.Moment
  floor: number
  price: number
  rooms: number
  status: ApiFlatStatus
}


export class ApiFlat implements ApiFlatI {
  public id
  public area
  public changelog
  public blockId
  public blockName
  public blockSlug
  public bulkName
  public createdAt
  public floor
  public price
  public rooms
  public status

  constructor(data: ApiFlatI) {
    this.id = data.id
    this.area = data.area
    this.changelog = data.changelog
    this.blockId = data.blockId
    this.blockName = data.blockName
    this.blockSlug = data.blockSlug
    this.bulkName = data.bulkName
    this.createdAt = data.createdAt
    this.floor = data.floor
    this.price = data.price
    this.rooms = data.rooms
    this.status = data.status
  }

  $getValueOnDate(date: moment.Moment | Date | string, instanceKey: keyof ApiFlatI, changeKey: string | null = null): any {
    const changelog = this.changelog.filter(change => change.key === (changeKey || instanceKey))
    const dateParsedISO = moment(date).format(ISO_DATE);

    // no changes or first change was past of requested date
    // return value on creation or null if created past then requested date
    if (changelog.length === 0) {
      return this.createdAt.format(ISO_DATE) <= dateParsedISO
          ? this[instanceKey]
          : null
    }

    const change = changelog.toReversed()
        .find(change => moment(change.created_at).format(ISO_DATE) <= dateParsedISO)

    if (change) {
      change.value_new
    }

    if (this.createdAt.format(ISO_DATE) <= dateParsedISO) {
      changelog[0].value
    }

    return null
  }

  static $parse(data: ApiFlatJson): ApiFlatI {
    return {
      id: data.id,
      area: data.area,
      changelog: data.changelog,
      blockId: data.block_id,
      blockName: data.block_name,
      blockSlug: data.block_slug,
      bulkName: data.bulk_name,
      createdAt: moment(data.created_at),
      floor: data.floor,
      price: data.price,
      rooms: data.rooms,
      status: data.status
    }
  }

  static fromJson(data: ApiFlatJson): ApiFlat {
    return new ApiFlat(ApiFlat.$parse(data))
  }

  public getPriceOnDate(date: moment.Moment | Date | string): number | null {
    return this.$getValueOnDate(date, 'price')
  }

  public getStatusOnDate(date: moment.Moment | Date | string): ApiFlatStatus | null {
    return this.$getValueOnDate(date, 'status')
  }

  update(data: ApiFlatJson) {
    Object.assign(this, ApiFlat.$parse(data))
  }
}

