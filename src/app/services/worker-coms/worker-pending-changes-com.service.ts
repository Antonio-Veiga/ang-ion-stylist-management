import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { WorkerChangesData } from 'src/app/data/PedingChangesData';
import { isEqual, cloneDeep, isEmpty } from 'lodash';

@Injectable()
export class WorkerPendingChangesComService {
  public PendingChanges: WorkerChangesData[] = []
  public PCSubject = new Subject<WorkerChangesData[]>()

  private notifyValueChanged(data: WorkerChangesData[]): void {
    this.PCSubject.next(data);
  }

  addPendingChange(data: WorkerChangesData) {
    let wd = this.findValue(data.worker_id)

    if (wd) {
      let idx = this.PendingChanges.findIndex((pc) => { return isEqual(pc, wd) })

      // check calendar data persistence
      data.calendarsData?.forEach((calendarData) => {
        if (isEmpty(calendarData.selected_actions)) {
          let persistedData = wd?.calendarsData?.find((calData) => { return calData.calendar.id === calendarData.calendar.id })

          if (persistedData) {
            calendarData.selected_actions = cloneDeep(persistedData.selected_actions)
          } else {
            calendarData.selected_actions = {
              remove_past_events: false,
              remove_ongoing_events: false,
            }
          }
        }
      })

      this.PendingChanges[idx] = data
    } else {

      data.calendarsData?.forEach((calendarData) => {
        calendarData.selected_actions = {
          remove_past_events: false,
          remove_ongoing_events: false,
        }
      })
      this.PendingChanges?.push(data)
    }

    this.notifyValueChanged(this.PendingChanges)
  }

  getPedingChanges() {
    return this.PendingChanges
  }

  removePendingChange(data: WorkerChangesData) {
    let wd = this.findValue(data.worker_id)

    if (wd) {
      let idx = this.PendingChanges.findIndex((pc) => { return isEqual(pc, wd) })
      this.PendingChanges.splice(idx, 1)
      this.notifyValueChanged(this.PendingChanges)
    }
  }

  public findValue(worker_id: number) {
    return this.PendingChanges.find((data) => { return data.worker_id == worker_id })
  }
}
