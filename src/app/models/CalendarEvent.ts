import { Client } from "./Client"
import { Label } from "./Label"
import { Service } from "./Service"

export class CalendarEvent {
    id?: number
    name?: string
    time?: string
    client?: Client
    label?: Label
    comment?: string
    services?: Service[]
    calendar_id?: number
    created_at?: string
    updated_at?: string
}
