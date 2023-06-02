import { Component, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { IonSelect, NavParams } from '@ionic/angular';
import { isEmpty, sortBy } from 'lodash';
import { WorkerCellData } from 'src/app/data/AgGridWorkerCellData';
import { Default_PT } from 'src/app/defaults/langs/pt-pt/Defaults';
import { InfoSnackBarComponent } from 'src/app/partials/info-snack/info-snack.component';
import { WorkerAgGridComService } from 'src/app/services/worker-coms/worker-ag-grid-com.service';
import { WorkerPendingChangesComService } from 'src/app/services/worker-coms/worker-pending-changes-com.service';

@Component({
  selector: 'app-manage-worker-helper-view',
  templateUrl: './manage-worker-helper-view.component.html',
  styleUrls: ['./manage-worker-helper-view.component.scss'],
})
export class ManageWorkerHelperViewComponent implements OnDestroy {
  public componentTitle?: string
  public defaultCellData!: WorkerCellData
  public updatedCellData!: WorkerCellData
  public color_hex_value?: string

  private wpc!: WorkerPendingChangesComService
  private agGridCom!: WorkerAgGridComService

  public addCalBtnText = Default_PT.ADD_CAL_BTN_TEXT
  public rmvCalBtnText = Default_PT.RMV_CAL_BTN_TEXT
  public okTextBtn = Default_PT.OK_BTN
  public cancelTextBtn = Default_PT.CANCEL_BTN
  public CALENDAR_1_ICON = "man-outline"
  public CALENDAR_2_ICON = "woman-outline"
  public CALENDAR_3_ICON = "flash-outline"
  public CALENDAR_4_ICON = "color-fill-outline"
  public DELETE_ICON = "close-outline"

  public addNewCalendarOptions = {
    header: "Adicionar Calendário",
    subHeader: "",
    message: 'Selecione o(s) calendário(s) a adicionar',
  }

  @ViewChild('addCalendar') public calendarOptions!: IonSelect

  public calendars = [
    {
      id: 1,
      name: Default_PT.CALENDAR_1
    },
    {
      id: 2,
      name: Default_PT.CALENDAR_2
    },
    {
      id: 3,
      name: Default_PT.CALENDAR_3
    },
    {
      id: 4,
      name: Default_PT.CALENDAR_4
    }
  ]

  constructor(params: NavParams,
    public _snackBar: MatSnackBar) {

    this.updatedCellData = {
      cellId: params.data['cellId'],
      rowIdx: params.data['rowIdx'],
      worker_name: params.data['worker_name'],
      color_hex_value: params.data['color_hex_value'],
      assoc_calendars: params.data['assoc_calendars'],
    }

    this.defaultCellData = {
      ...this.updatedCellData,
      assoc_calendars: [...this.updatedCellData.assoc_calendars]
    }

    this.agGridCom = params.data['agGridCom']
    this.wpc = params.data['wpc']

    this.componentTitle = `${Default_PT.MANAGING_WORKER} - ${this.updatedCellData.worker_name}`
    this.color_hex_value = this.updatedCellData.color_hex_value

  }

  onColorChange(newValue: string): void {
    this.updatedCellData.color_hex_value = newValue;
    console.log(this.updatedCellData);
  }

  onMouseEnter(target: EventTarget | null) {
    let hEl = (target as HTMLElement)
    switch (hEl.getAttribute('data-id')) {
      case 'CAL_1':
        this.CALENDAR_1_ICON = this.DELETE_ICON
        break
      case 'CAL_2':
        this.CALENDAR_2_ICON = this.DELETE_ICON
        break
      case 'CAL_3':
        this.CALENDAR_3_ICON = this.DELETE_ICON
        break
      case 'CAL_4':
        this.CALENDAR_4_ICON = this.DELETE_ICON
        break
    }
  }

  onMouseLeave(target: EventTarget | null) {
    let hEl = (target as HTMLElement)

    switch (hEl.getAttribute('data-id')) {
      case 'CAL_1':
        this.CALENDAR_1_ICON = 'man-outline'
        break
      case 'CAL_2':
        this.CALENDAR_2_ICON = 'woman-outline'
        break
      case 'CAL_3':
        this.CALENDAR_3_ICON = 'flash-outline'
        break
      case 'CAL_4':
        this.CALENDAR_4_ICON = 'color-fill-outline'
        break
    }
  }

  checkArrayDiff() {
    const ids = this.updatedCellData.assoc_calendars.map(calendar => calendar.id)
    return this.calendars.filter(calendar => !ids.includes(calendar.id))
  }

  checkRemovedCalendars() {
    const ids = this.updatedCellData.assoc_calendars.map(calendar => calendar.id)
    return this.defaultCellData.assoc_calendars.filter(calendar => !ids.includes(calendar.id))
  }

  removeFromListings(id: number) {
    if (this.updatedCellData.assoc_calendars.length !== 1) {
      const index = this.updatedCellData.assoc_calendars.findIndex((cal) => cal.id == id)

      if (index !== -1) {
        this.updatedCellData.assoc_calendars.splice(index, 1);
      }

      this.updatedCellData.assoc_calendars = sortBy(this.updatedCellData.assoc_calendars, 'id')
      this.agGridCom.notifyCellValueChanged(this.updatedCellData)
      this.updateWPC()

    } else {
      this.openInfoSnackBar(Default_PT.INVALID_OPERATION_AT_LEAST_1_CAL, Default_PT.INFO_BTN)
    }
  }

  addToListings(event: any) {
    if (event.detail.value !== 0) {
      const [id, name] = event.detail.value.split('-')
      this.updatedCellData.assoc_calendars.push({
        id: Number.parseInt(id),
        name: name,
      })

      this.updatedCellData.assoc_calendars = sortBy(this.updatedCellData.assoc_calendars, 'id')
      this.agGridCom.notifyCellValueChanged(this.updatedCellData)

      this.calendarOptions.value = 0
      this.updateWPC()
    }
  }

  onSelectedList(id: number): boolean {
    return this.updatedCellData.assoc_calendars.find((value) => { return value.id == id }) != undefined
  }

  updateWPC() {
    let calendars = this.checkRemovedCalendars()

    if (!isEmpty(calendars)) {
      this.wpc.addPendingChange({
        worker_id: this.defaultCellData.cellId,
        worker_name: this.defaultCellData.worker_name,
        action: 'removed',
        calendarsData: calendars.map((calendar) => {
          return {
            calendar: calendar,
          }
        })
      })
    } else {
      this.wpc.removePendingChange({
        worker_id: this.defaultCellData.cellId,
        worker_name: this.defaultCellData.worker_name,
        action: 'removed',
      })
    }
  }

  openInfoSnackBar(content: string, btnContent: string) {
    const config = new MatSnackBarConfig();
    config.data = { content: content, btnContent: btnContent, duration: 3000 };
    this._snackBar.openFromComponent(InfoSnackBarComponent, config);
  }

  ngOnDestroy(): void {
    this.agGridCom.notifyCellValueChanged(this.updatedCellData)
  }
}
