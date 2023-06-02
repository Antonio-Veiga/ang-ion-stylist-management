import { Calendar } from "./Calendar"
import { Client } from "./Client"
import { Label } from "./Label"
import { Service } from "./Service"

export class CalendarEvent {
    id?: number
    title!: string
    time?: string
    client?: Client
    label?: Label
    comment?: string
    services?: Service[]
    calendar_id?: number
    calendar?: Calendar
    created_at?: string
    updated_at?: string
}
