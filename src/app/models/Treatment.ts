import { Client } from "./Client"
import { Service } from "./Service"

export class Treatment {
    id?: number
    closed?: boolean
    service_id?: number
    client_id?: number
    service?: Service
    client?: Client
    closed_at?: string
    created_at?: string
    updated_at?: string
}