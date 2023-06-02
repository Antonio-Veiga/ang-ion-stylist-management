import { Calendar } from "./Calendar"
import { Client } from "./Client"
import { Form } from "./Form"
import { Label } from "./Label"
import { Restriction } from "./Restriction"
import { Service } from "./Service"

export class GenericCalendarEvent {
    id!: number
    title!: string
    time?: string
    client?: Client
    label?: Label
    comment?: string
    day_id?: number
    services?: Service[]
    calendar_id?: number
    calendar?: Calendar
    forms?: Form[]
    restrictions?: Restriction[]
    isPredefined!: boolean
    created_at?: string
    updated_at?: string
}