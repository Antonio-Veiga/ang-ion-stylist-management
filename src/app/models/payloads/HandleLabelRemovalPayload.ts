export class LabelRemovalPayload {
    label_id!: number
    calendar_id!: number
    remove_past_events!: boolean
    remove_ongoing_events!: boolean
    replacement_label_id!: number
}