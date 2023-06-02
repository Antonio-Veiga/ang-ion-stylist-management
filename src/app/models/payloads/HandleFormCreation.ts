export class FormStructure {
    objective?: boolean
    hair_state?: boolean
    advised_treatment?: boolean
    product_tab?: boolean
    attachments?: boolean
}

export class FormPayload {
    client_id?: number
    service_id?: number
    assoc_event_id?: number
    form_structure?: FormStructure
}