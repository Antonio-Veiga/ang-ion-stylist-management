import { Component } from '@angular/core';
import { WorkerCalendarData, WorkerChangesData } from 'src/app/data/PedingChangesData';
import { WorkerPendingChangesComService } from 'src/app/services/worker-coms/worker-pending-changes-com.service';
import { cloneDeep, isEmpty, isEqual } from 'lodash';
import { APIService } from 'src/app/services/api/api.service';
import { Label } from 'src/app/models/Label';
import { Default_PT } from 'src/app/defaults/langs/pt-pt/Defaults';
import { LabelGlues } from 'src/app/models/LabelGlues';
import { ProcessingWorkerComService } from 'src/app/services/worker-coms/processing-worker-com.service';

@Component({
  selector: 'app-pending-changes',
  templateUrl: './pending-changes.component.html',
  styleUrls: ['./pending-changes.component.scss'],
})
export class PendingChangesComponent {
  public pendingData: WorkerChangesData[] = []
  public selectedWorker?: WorkerChangesData
  public selectedCalendar?: 1 | 2 | 3 | 4 | number
  public replacementsLoading: boolean = false
  public replacementOptions: any[] = []
  public replacementWorker?: Label
  public isProcessing: boolean = false

  public overlay = {
    title: Default_PT.WORKER_PC_OVERLAY_TITLE,
    desc: Default_PT.WORKER_PC_OVERLAY_DESC
  }

  public replaceWorkerPlaceholderText: string = Default_PT.REPLACE_WORKER_PLACEHOLDER_TEXT

  constructor(public wpc: WorkerPendingChangesComService,
    public ps: ProcessingWorkerComService,
    public api: APIService) {

    this.ps.processing.subscribe((isProcessing) => {
      this.isProcessing = isProcessing
    })

    this.wpc.PCSubject.subscribe((data) => {
      if (!isEqual(data, this.pendingData)) {
        this.pendingData = cloneDeep(data)
        this.setSelectedWorker()
      }
    })
  }

  setSelectedWorker(worker_id?: number) {
    if (worker_id && this.selectedWorker && this.selectedWorker.worker_id != worker_id) {
      this.selectedWorker = this.findWorkerByIdx(worker_id)
      this.handleCalendarSelected()
    }
    else {
      if (!this.selectedWorker || !this.workerOnChangesList(this.selectedWorker)) {
        this.selectedWorker = this.pendingData[0]
      } else {
        this.selectedWorker = this.findWorkerByIdx(this.selectedWorker.worker_id)
      }

      this.handleCalendarSelected()
    }
  }

  changeDeleteNextEvents(event: any) {
    let calendarData = this.findCalendarData()!
    calendarData.selected_actions!.remove_ongoing_events = event.target.checked
    calendarData.selected_actions!.replacement_worker = undefined
    this.replacementWorker = undefined
    this.wpc.addPendingChange(this.selectedWorker!)
  }

  changeDeletePreviousEvents(event: any) {
    this.findCalendarData()!.selected_actions!.remove_past_events = event.target.checked
    this.wpc.addPendingChange(this.selectedWorker!)
  }

  getReplacementWorker() {
    if (this.selectedWorker && this.selectedCalendar) {
      return this.findCalendarData()?.selected_actions?.replacement_worker
    }
    return undefined
  }

  getDeleteNextEvents() {
    if (this.selectedWorker && this.selectedCalendar) {
      return this.findCalendarData()?.selected_actions?.remove_ongoing_events
    }
    return false
  }

  getDeletePreviousEvents() {
    if (this.selectedWorker && this.selectedCalendar) {
      return this.findCalendarData()?.selected_actions?.remove_past_events
    }
    return false
  }

  replacementWorkerChanged(changed: any) {
    this.findCalendarData()!.selected_actions!.replacement_worker = changed
    this.wpc.addPendingChange(this.selectedWorker!)
  }

  handleCalendarSelected(calendarId?: 1 | 2 | 3 | 4) {
    if (this.selectedWorker && calendarId) {
      if (this.selectedWorker.calendarsData?.find((calendarData => { return calendarData.calendar.id === calendarId }))) {
        this.selectedCalendar = calendarId
      }
    } else if (this.selectedCalendar && this.workerHasCalendar(this.selectedCalendar!)) { } else {
      this.selectedCalendar = this.selectedWorker!.calendarsData![0].calendar.id
    }

    this.setupReplacementChoices()
  }

  findWorkerByIdx(id: number): WorkerChangesData | undefined {
    return this.pendingData.find((w) => { return w.worker_id === id })
  }

  findCalendarData(): WorkerCalendarData | undefined {
    if (this.selectedCalendar && this.selectedWorker) {
      return this.selectedWorker.calendarsData?.find((calData) => { return calData.calendar.id === this.selectedCalendar })
    }
    return undefined
  }

  workerHasCalendar(calendarId: number) {
    return this.selectedWorker?.calendarsData?.findIndex((calendarData) => { return calendarData.calendar.id === calendarId }) != -1
  }

  workerOnChangesList(worker: WorkerChangesData) {
    return this.pendingData.findIndex((data) => { return worker.worker_id === data.worker_id }) != -1
  }

  hasCalendar(calendarId: number): boolean {
    if (!isEmpty(this.selectedWorker)) {
      return this.selectedWorker.calendarsData?.find((calData) => { return calData.calendar.id === calendarId }) != undefined
    }
    return false
  }

  setupReplacementChoices() {
    if (!isEmpty(this.selectedWorker)) {
      this.replacementsLoading = true

      this.api.getGluedLabels(this.selectedCalendar!).subscribe((wrapper) => {
        let options: any[] = []

        wrapper.data.map((glue) => {
          if (glue.label!.id !== this.selectedWorker!.worker_id && !this.toBeReplaced(glue)) {
            options.push({ id: glue.label!.id, name: glue.label!.name })
          }
        })

        this.replacementOptions = options
        this.replacementsLoading = false

        let rWorker = this.getReplacementWorker()

        if (rWorker && options.some(option => isEqual(option, rWorker))) {
          this.replacementWorker = this.getReplacementWorker()
        } else { this.replacementWorker = undefined; this.replacementWorkerChanged(undefined) }
      })
    }
  }

  toBeReplaced(glue: LabelGlues) {
    let found = false
    this.pendingData.forEach((pd) => {
      if (pd.worker_id === glue.label?.id) {
        pd.calendarsData?.forEach((cd) => {
          if (cd.calendar.id === glue.calendar?.id) { found = true }
        })
      }
    })

    return found
  }

  compareFn(a: any, b: any) {
    return isEqual(a, b)
  }

  empty() {
    return isEmpty(this.pendingData)
  }
}
