import { FormStructure } from "./HandleFormCreation"

export class FormTreatmentPayload {
    type!: 'new-form' | 'new-treatment' | 'assoc-treatment'
    form_structure?: FormStructure
    client_id?: number
    service_id?: number
    assoc_event_id?: number
    treatment_id?: number
}

export class ManipulateFormTreatmentPayload {
    payload?: FormTreatmentPayload[]
}