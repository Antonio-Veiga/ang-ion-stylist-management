import { Calendar } from "@fullcalendar/core"

export class Label {
    id!: number
    name?: string
    color_hex_value?: string
    assoc_calendars?: Calendar[]
    createdAt?: string
    updatedAt?: string
}