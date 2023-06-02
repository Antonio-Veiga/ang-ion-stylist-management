export class EventPayload {
    title?: string
    time?: string
    client_id?: number
    worker_id?: number
    calendar_id?: number
    comment?: string | null
    assoc_service_ids?: number[]
}