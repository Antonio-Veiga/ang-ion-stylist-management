import { Calendar } from "./Calendar"
import { Client } from "./Client"
import { Label } from "./Label"
import { Restriction } from "./Restriction"

export class PredefinedEvent {
    id!: number
    title?: string
    time?: string
    day_id?: number
    label_id?: number
    label?: Label
    client_id?: number
    client?: Client
    calendar_id?: number
    calendar?: Calendar
    restrictions?: Restriction[]
    created_at?: string
    updated_at?: string
}