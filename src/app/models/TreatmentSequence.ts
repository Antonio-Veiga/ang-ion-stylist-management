import { Client } from "./Client"
import { Service } from "./Service"
import { Treatment } from "./Treatment"

export class TreatmentSequence {
    id?: number
    treatment_id?: number
    form_id?: number
    created_at?: string
    updated_at?: string
    self_sequence?: TreatmentSequence[]
    treatment?: Treatment
    client?: Client
    service?: Service
}