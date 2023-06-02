import { Form } from "./Form"

export class Attachment {
    id?: number
    image_name?: string
    relative_path?: string
    form_id?: number
    form?: Form
    created_at?: string
    updated_at?: string
}