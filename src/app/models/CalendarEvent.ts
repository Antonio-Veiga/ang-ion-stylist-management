import { Client } from "./Client"
import { Label } from "./Label"
import { Service } from "./Service"

export class CalendarEvent {
    id!: number
    name!: string
    time!: string
    duration!: number
    client?: Client
    label?: Label
    service?: Service
    calendarId!: number
    createdAt?: string
    updatedAt?: string
}
