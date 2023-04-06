import { Client } from "../models/Client";

export interface ClientDialogData {
    client: Client
    action: 'add' | 'edit' | 'none'
    response: boolean
}