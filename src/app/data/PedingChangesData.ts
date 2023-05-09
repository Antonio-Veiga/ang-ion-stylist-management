import { Calendar } from "../models/Calendar"
import { Label } from "../models/Label"

export class WorkerCRActions {
    remove_past_events?: boolean
    remove_ongoing_events?: boolean
    replacement_worker?: Label
}

export class WorkerCalendarData {
    calendar!: Calendar
    selected_actions?: WorkerCRActions
}

export class WorkerChangesData {
    worker_id!: number
    worker_name!: string
    action!: "deleted" | "removed"
    calendarsData?: WorkerCalendarData[]
}
