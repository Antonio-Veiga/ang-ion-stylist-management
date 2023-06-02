import { AdvisedTreatment } from "./AdvisedTreatment"
import { Attachment } from "./Attachment"
import { CalendarEvent } from "./CalendarEvent"
import { Client } from "./Client"
import { HairState } from "./HairState"
import { Product } from "./Product"
import { Service } from "./Service"
import { TreatmentSequence } from "./TreatmentSequence"

export class Form {
    id?: number
    assoc_event_id?: number
    assoc_event?: CalendarEvent
    has_client_objective?: boolean
    client_objective?: string
    has_advised_treatment?: boolean
    advised_treatment_id?: number
    advised_treatment?: AdvisedTreatment
    has_hair_state?: boolean
    hair_state?: HairState
    has_product_list?: boolean
    product_list?: Product[]
    has_attachments?: boolean
    attachments?: Attachment[]
    is_singleton?: boolean
    service_id?: number
    service?: Service
    client_id?: number
    client?: Client
    treatment_sequence?: TreatmentSequence
    hair_condition?: HairState[]
    observations?: string
    created_at?: string
    updated_at?: string
}