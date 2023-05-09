import { Client } from "../models/Client";

export interface ClientDialogData {
    client: Client
    action: 'add' | 'edit' | 'fast-add'
    predefined_sex?: 'M' | 'F'
    response: boolean
}