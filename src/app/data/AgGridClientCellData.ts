import { Client } from "../models/Client"

export class ClientCellData {
    action!: 'edit' | 'delete' | 'none'
    client!: Client
}