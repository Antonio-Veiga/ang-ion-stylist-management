import { Calendar } from "../models/Calendar"

export class WorkerCellData {
    cellId!: number
    rowIdx!: number | null
    worker_name!: string
    color_hex_value!: string
    assoc_calendars!: Calendar[]
}