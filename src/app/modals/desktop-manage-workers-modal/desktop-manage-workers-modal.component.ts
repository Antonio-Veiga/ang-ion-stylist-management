import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { IonSelect, ModalController } from '@ionic/angular';
import { AgGridAngular, ICellRendererAngularComp } from 'ag-grid-angular';
import { ColDef, GridApi, ICellRendererParams } from 'ag-grid-community';
import { WorkerCellData } from 'src/app/data/AgGridWorkerCellData';
import { Default_PT } from 'src/app/defaults/langs/pt-pt/Defaults';
import { InfoSnackBarComponent } from 'src/app/partials/info-snack/info-snack.component';
import { APIService } from 'src/app/services/api/api.service';
import { WorkerAgGridComService } from 'src/app/services/worker-coms/worker-ag-grid-com.service';
import { isEqual, sortBy, isEmpty, cloneDeep } from 'lodash';
import { PendingChangesComponent } from './sub-components/pending-changes/pending-changes.component';
import { WorkerPendingChangesComService } from 'src/app/services/worker-coms/worker-pending-changes-com.service';
import { Label } from 'src/app/models/Label';
import { LabelRemovalPayload } from 'src/app/models/payloads/HandleLabelRemovalPayload';
import { lastValueFrom } from 'rxjs';
import { NotifyValueStoredComService } from 'src/app/services/worker-coms/notify-value-stored-com.service';
import { LabelGluePayload } from 'src/app/models/payloads/HandleMassPostLabelGluePayload';
import { ProcessingWorkerComService } from 'src/app/services/worker-coms/processing-worker-com.service';
import { WorkerMultipleChangesComService } from 'src/app/services/worker-coms/worker-multiple-changes-com.service';
import { WorkerNormalizedData } from 'src/app/data/WorkerNormalizedChanges';
import { MatDialog } from '@angular/material/dialog';
import { DesktopCreateWorkerModalComponent } from '../desktop-create-worker-modal/desktop-create-worker-modal.component';
import { ManageWorkerHelperViewComponent } from '../mobile-manage-workers-modal/small-screen-helper-components/manage-worker-helper-view/manage-worker-helper-view.component';

@Component({
  selector: 'app-desktop-manage-workers-modal',
  templateUrl: './desktop-manage-workers-modal.component.html',
  styleUrls: ['./desktop-manage-workers-modal.component.scss'],
  providers: [
    WorkerPendingChangesComService,
    NotifyValueStoredComService,
    ProcessingWorkerComService,
    WorkerMultipleChangesComService
  ]
})
export class DesktopManageWorkersModalComponent {
  public componentTitle = Default_PT.MANAGE_WORKERS
  public pedingChangesTitle = Default_PT.CALENDAR_PENDING_CHANGES
  public AG_GRID_PT_LANG = Default_PT.AG_GRID_LOCALE_PT
  PendingChangesComponent = PendingChangesComponent
  public hasCalendarChanges: boolean = false
  public isProcessing: boolean = false
  public pendingWorkerChanges: Map<number, WorkerNormalizedData> = new Map()

  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;

  defaultColDef: ColDef = {
    flex: 1,
    resizable: false,
    sortable: true,
    filter: false,
    editable: false,
    suppressMovable: true,
    suppressNavigable: false,
  }

  columnDefs: ColDef[] = [{
    field: 'name',
    headerName: Default_PT.NAME,
    floatingFilter: true,
    filter: true,
    cellRendererSelector: (params: any) => {
      return { component: WorkerNameInputSelector }
    }
  },
  {
    field: 'color_hex_value',
    headerName: Default_PT.COLOR,
    cellRendererSelector: (params: any) => {
      return { component: WorkersColorSelector }
    }
  },
  {
    field: 'assoc_calendars',
    headerName: Default_PT.CALENDARS,
    minWidth: 180,
    cellRendererSelector: (params: any) => {
      return { component: WorkersCalendarSelector }
    }
  },
  {
    field: 'actions',
    headerName: Default_PT.ACTIONS,
    maxWidth: 120,
    cellRendererSelector: (params: any) => {
      return { component: WorkerActionsHolder }
    }
  }]

  constructor(
    public api: APIService,
    public wpc: WorkerPendingChangesComService,
    public wmc: WorkerMultipleChangesComService,
    public ps: ProcessingWorkerComService,
    public _snackBar: MatSnackBar,
    public _dialog: MatDialog
  ) {

    this.ps.processing.subscribe((isProcessing) => {
      this.isProcessing = isProcessing
    })

    this.wpc.PCSubject.subscribe((changes) => {
      this.hasCalendarChanges = !isEmpty(changes)
    })

    this.wmc.PendingMapSubject.subscribe((PendingMap) => {
      this.pendingWorkerChanges = cloneDeep(PendingMap)
    })
  }

  addWorker() {
    const CWDiagRef = this._dialog.open(DesktopCreateWorkerModalComponent)
    CWDiagRef.afterClosed().subscribe(async () => {
      if (CWDiagRef.componentInstance.createdWorker) {
        this.onGridReady()
      }
    })
  }

  onGridReady() {
    this.ps.notifyWhenProcessing(true)
    this.agGrid.api.showLoadingOverlay()

    this.api.getLabels().subscribe((wrapper) => {
      this.agGrid.api.setRowData(wrapper.data)
      this.agGrid.api.hideOverlay()
      this.ps.notifyWhenProcessing(false)
    })
  }

  async storeAllChanges() {
    if (this.validateAllPendingChanges()) {
      this.agGrid.api.showLoadingOverlay()
      this.ps.notifyWhenProcessing(true)

      // handle name and color changes and calendar association
      this.pendingWorkerChanges.forEach(async (normData: WorkerNormalizedData) => {
        if (!isEmpty(normData.new_worker_name) || !isEmpty(normData.new_worker_hex_color)) {
          let payloadLabel: Label = { id: normData.worker_id }

          if (!isEmpty(normData.new_worker_name)) { payloadLabel.name = normData.new_worker_name }
          if (!isEmpty(normData.new_worker_hex_color)) { payloadLabel.color_hex_value = normData.new_worker_hex_color }

          const patchReq$ = this.api.patchLabel(payloadLabel, payloadLabel.id)
          await lastValueFrom(patchReq$)
        }

        if (!isEmpty(normData.added_calendar_ids)) {
          let payload: LabelGluePayload[] = []

          normData.added_calendar_ids!.forEach((id) => {
            payload.push({
              label_id: normData.worker_id,
              added_calendar_id: id
            })
          })

          const patchGlueReq$ = this.api.massPostLabelGlue(payload)
          await lastValueFrom(patchGlueReq$)
        }
      })

      // handle removal/deletion changes
      let pendingChanges = this.wpc.getPedingChanges()

      if (!isEmpty(pendingChanges)) {
        let payload: LabelRemovalPayload[] = []

        pendingChanges.forEach((pd) => {
          pd.calendarsData?.forEach((cd) => {
            payload.push({
              label_id: pd.worker_id,
              calendar_id: cd.calendar.id!,
              remove_past_events: cd.selected_actions?.remove_past_events ? true : false,
              remove_ongoing_events: cd.selected_actions?.remove_ongoing_events ? true : false,
              replacement_label_id: cd.selected_actions?.replacement_worker ? cd.selected_actions.replacement_worker.id : -1
            })
          })
        })

        // make new request
        const patchRemovalReq$ = this.api.patchLabelRemoval(payload)
        await lastValueFrom(patchRemovalReq$)
      }

      this.agGrid.api.hideOverlay()
      this.onGridReady()
      this.wmc.clearPendingChanges()
      this.ps.notifyWhenProcessing(false)
    } else {
      this.openInfoSnackBar(Default_PT.ACTIONS_NOT_SET_FOR_REMOVE_OR_DELETE, Default_PT.INFO_BTN)
    }
  }

  validateAllPendingChanges() {
    let valid = true
    let pendingChanges = this.wpc.getPedingChanges()

    pendingChanges.forEach((pc) => {
      pc.calendarsData?.forEach((cd) => {
        if (cd.selected_actions?.remove_ongoing_events == false
          && cd.selected_actions.replacement_worker == undefined) {
          valid = false
        }
      })
    })

    return valid
  }

  openInfoSnackBar(content: string, btnContent: string) {
    const config = new MatSnackBarConfig();
    config.data = { content: content, btnContent: btnContent, duration: 3000 };
    this._snackBar.openFromComponent(InfoSnackBarComponent, config);
  }
}

@Component({
  selector: 'workers-name-selector',
  templateUrl: './micro-components-views/name-input-selector.component.html',
})
export class WorkerNameInputSelector implements ICellRendererAngularComp {
  validator!: FormGroup
  private updatedCellData!: WorkerCellData

  constructor(public formBuilder: FormBuilder, private agGridCom: WorkerAgGridComService) { }

  agInit(params: ICellRendererParams<any, any>): void {
    this.validator = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(128), Validators.pattern(/^\S(.*\S)?$/)]],
    })

    this.validator.setValue({ name: params.value })

    this.updatedCellData = {
      cellId: params.data.id,
      rowIdx: params.rowIndex,
      worker_name: params.value,
      color_hex_value: params.data.color_hex_value,
      assoc_calendars: params.data.assoc_calendars,
    }

    this.validator.markAllAsTouched()

    this.validator.get('name')?.valueChanges.subscribe((value) => {
      this.updatedCellData.worker_name = value
      this.agGridCom.notifyCellValueChanged(this.updatedCellData)
    })

    this.agGridCom.CellSubject.subscribe((CellData) => {
      if (this.updatedCellData.rowIdx == CellData.rowIdx) {
        let wName = this.updatedCellData.worker_name

        this.updatedCellData = {
          ...CellData,
          assoc_calendars: [...CellData.assoc_calendars]
        }

        if (CellData.worker_name != wName) { this.validator.patchValue({ name: CellData.worker_name }) }
      }
    })
  }

  refresh(params: ICellRendererParams<any, any>): boolean {
    return false
  }
}

@Component({
  selector: 'workers-color-selector',
  templateUrl: './micro-components-views/color-selector.component.html',
})
export class WorkersColorSelector implements ICellRendererAngularComp {
  validator!: FormGroup
  public inputId?: string
  private updatedCellData!: WorkerCellData

  constructor(public formBuilder: FormBuilder, private agGridCom: WorkerAgGridComService) { }

  agInit(params: ICellRendererParams<any, any>): void {
    this.inputId = `color-picker-${params.data.id}`

    this.validator = this.formBuilder.group({
      color: ['', [Validators.required]],
    })

    this.validator.setValue({ color: params.value })

    this.updatedCellData = {
      cellId: params.data.id,
      rowIdx: params.rowIndex,
      worker_name: params.data.name,
      color_hex_value: params.value,
      assoc_calendars: params.data.assoc_calendars,
    }

    this.validator.markAllAsTouched()

    this.validator.get('color')?.valueChanges.subscribe((value) => {
      this.updatedCellData.color_hex_value = value
      this.agGridCom.notifyCellValueChanged(this.updatedCellData)
    })

    this.agGridCom.CellSubject.subscribe((CellData) => {
      if (this.updatedCellData.rowIdx == CellData.rowIdx) {
        let hexColor = this.updatedCellData.color_hex_value

        this.updatedCellData = {
          ...CellData,
          assoc_calendars: [...CellData.assoc_calendars]
        }


        if (CellData.color_hex_value != hexColor) { this.validator.setValue({ color: CellData.color_hex_value }) }
      }
    })
  }

  refresh(params: ICellRendererParams<any, any>): boolean {
    return false
  }
}

@Component({
  selector: 'workers-calendar-selector',
  templateUrl: './micro-components-views/calendar-selector.component.html',
})
export class WorkersCalendarSelector implements ICellRendererAngularComp {
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

  public updatedCellData!: WorkerCellData
  public defaultCellData!: WorkerCellData

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

  constructor(
    private agGridCom: WorkerAgGridComService,
    private storedCom: NotifyValueStoredComService,
    private wpc: WorkerPendingChangesComService,
    public _snackBar: MatSnackBar) { }

  agInit(params: ICellRendererParams<any, any>): void {

    this.updatedCellData = {
      cellId: params.data.id,
      rowIdx: params.rowIndex,
      worker_name: params.data.name,
      color_hex_value: params.data.color_hex_value,
      assoc_calendars: params.value,
    }

    this.defaultCellData = {
      ...this.updatedCellData,
      assoc_calendars: [...this.updatedCellData.assoc_calendars]
    }

    this.storedCom.CellSubject.subscribe((CellData) => {
      if (this.updatedCellData.rowIdx == CellData.rowIdx) {
        this.defaultCellData = {
          ...CellData,
          assoc_calendars: [...CellData.assoc_calendars]
        }

        this.updateWPC()
      }
    })

    this.agGridCom.CellSubject.subscribe((CellData) => {
      if (this.updatedCellData.rowIdx == CellData.rowIdx) {
        this.updatedCellData = {
          ...CellData,
          assoc_calendars: [...CellData.assoc_calendars]
        }

        this.updateWPC()
      }
    })

    this.addNewCalendarOptions.subHeader = this.updatedCellData.worker_name
    this.updateWPC()
  }

  refresh(params: ICellRendererParams<any, any>): boolean {
    return false
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
}

@Component({
  selector: 'workers-actions-holder',
  templateUrl: './micro-components-views/workers-action-holder.component.html',
})
export class WorkerActionsHolder implements ICellRendererAngularComp {
  public updatedCellData!: WorkerCellData
  public defaultCellData!: WorkerCellData
  private gridApi_?: GridApi

  public isSmallScreen = window.matchMedia("(max-width: 600px)").matches;

  constructor(private agGridCom: WorkerAgGridComService,
    private storedCom: NotifyValueStoredComService,
    public wpc: WorkerPendingChangesComService,
    public _snackBar: MatSnackBar,
    public api: APIService,
    public ps: ProcessingWorkerComService,
    public wmc: WorkerMultipleChangesComService,
    public modalController: ModalController) { }

  agInit(params: ICellRendererParams<any, any>): void {
    this.gridApi_ = params.api

    this.updatedCellData = {
      cellId: params.data.id,
      rowIdx: params.rowIndex,
      worker_name: params.data.name,
      color_hex_value: params.data.color_hex_value,
      assoc_calendars: params.data.assoc_calendars,
    }

    this.defaultCellData = {
      ...this.updatedCellData,
      assoc_calendars: [...this.updatedCellData.assoc_calendars]
    }

    this.agGridCom.CellSubject.subscribe((CellData) => {
      if (this.updatedCellData.rowIdx == CellData.rowIdx) {
        this.updatedCellData = {
          ...CellData,
          assoc_calendars: [...CellData.assoc_calendars]
        }

        if (this.changed()) {
          let changeData: WorkerNormalizedData = { worker_id: this.defaultCellData.cellId }

          if (this.defaultCellData.worker_name != this.updatedCellData.worker_name) { changeData.new_worker_name = this.updatedCellData.worker_name }
          if (this.defaultCellData.color_hex_value != this.updatedCellData.color_hex_value) { changeData.new_worker_hex_color = this.updatedCellData.color_hex_value }

          let addedCalendars = this.calculateAddedCalendarsDiff()

          if (addedCalendars) {
            changeData.added_calendar_ids = addedCalendars.map((calendar) => { return calendar.id! })
          }

          this.wmc.addPendingChange(this.defaultCellData.cellId, changeData)
        } else {
          this.wmc.removePedingChange(this.defaultCellData.cellId)
        }
      }
    })
  }

  async manage() {
    const modal = await this.modalController.create({
      component: ManageWorkerHelperViewComponent,
      breakpoints: [0, 1],
      cssClass: 'mobile-create',
      initialBreakpoint: 1,
      mode: 'ios',
      backdropDismiss: true,
      showBackdrop: true,
      componentProps: {
        ...this.updatedCellData,
        assoc_calendars: [...this.updatedCellData.assoc_calendars],
        wpc: this.wpc,
        agGridCom: this.agGridCom,
      }
    });

    await modal.present();
  }

  async save() {
    if (this.changed()) {
      if (this.validateWorkerChanges()) {
        this.gridApi_?.showLoadingOverlay()
        this.ps.notifyWhenProcessing(true)

        // handle name and color changes
        if (this.defaultCellData.worker_name != this.updatedCellData.worker_name
          || this.defaultCellData.color_hex_value != this.updatedCellData.color_hex_value) {
          let patchLabel: Label = {
            id: this.updatedCellData.cellId,
            name: this.updatedCellData.worker_name,
            color_hex_value: this.updatedCellData.color_hex_value,
          }

          const patchReq$ = this.api.patchLabel(patchLabel, patchLabel.id)
          await lastValueFrom(patchReq$)
        }

        // handle added calendar changes
        let addedCalendars = this.calculateAddedCalendarsDiff()

        if (!isEmpty(addedCalendars)) {
          let payload: LabelGluePayload[] = []

          addedCalendars.forEach((calendar) => {
            payload.push({
              label_id: this.updatedCellData.cellId,
              added_calendar_id: calendar.id!
            })
          })

          const patchGlueReq$ = this.api.massPostLabelGlue(payload)
          await lastValueFrom(patchGlueReq$)
        }

        // handle removal/deletion changes
        let pendingChanges = this.wpc.getPedingChanges()

        if (!isEmpty(pendingChanges)) {
          let cellPedingChanges = pendingChanges.find((pc) => { return pc.worker_id == this.updatedCellData.cellId })

          if (cellPedingChanges) {
            let payload: LabelRemovalPayload[] = []

            cellPedingChanges.calendarsData?.forEach((cd) => {
              payload.push({
                label_id: cellPedingChanges!.worker_id,
                calendar_id: cd.calendar.id!,
                remove_past_events: cd.selected_actions?.remove_past_events ? true : false,
                remove_ongoing_events: cd.selected_actions?.remove_ongoing_events ? true : false,
                replacement_label_id: cd.selected_actions?.replacement_worker ? cd.selected_actions.replacement_worker.id : -1
              })
            })

            // make new request
            const patchRemovalReq$ = this.api.patchLabelRemoval(payload)
            await lastValueFrom(patchRemovalReq$)
          }
        }

        // handle state changes to the ui
        this.defaultCellData = { ... this.updatedCellData }
        this.storedCom.notifyCellValueChanged(this.defaultCellData)
        this.ps.notifyWhenProcessing(false)
        this.wmc.removePedingChange(this.defaultCellData.cellId)
        this.openInfoSnackBar(Default_PT.SERVICE_VALUES_CHANGED, Default_PT.INFO_BTN)
        this.gridApi_?.hideOverlay()

        if (this.isSmallScreen) {
          this.wpc.removePendingChange({
            worker_id: this.defaultCellData.cellId,
            worker_name: this.defaultCellData.worker_name,
            action: 'removed',
          })
        }
      } else {
        this.openInfoSnackBar(Default_PT.ACTIONS_NOT_SET_FOR_REMOVE_OR_DELETE, Default_PT.INFO_BTN)
      }
    }
  }

  validateWorkerChanges() {
    let valid = true
    let pendingChanges = this.wpc.getPedingChanges()

    pendingChanges.forEach((pc) => {
      if (pc.worker_id === this.defaultCellData.cellId) {
        pc.calendarsData?.forEach((cd) => {
          if (cd.selected_actions?.remove_ongoing_events == false
            && cd.selected_actions.replacement_worker == undefined) {
            valid = false
          }
        })
      }
    })

    return valid
  }

  calculateAddedCalendarsDiff() {
    const ids = this.defaultCellData.assoc_calendars.map(calendar => calendar.id)
    return this.updatedCellData.assoc_calendars.filter(calendar => !ids.includes(calendar.id))
  }

  reload() {
    this.wmc.removePedingChange(this.defaultCellData.cellId)
    this.agGridCom.notifyCellValueChanged(this.defaultCellData)

    if (this.isSmallScreen) {
      this.wpc.removePendingChange({
        worker_id: this.defaultCellData.cellId,
        worker_name: this.defaultCellData.worker_name,
        action: 'removed',
      })
    }
  }

  changed(): boolean {
    return !(isEqual(this.defaultCellData, this.updatedCellData))
  }

  openInfoSnackBar(content: string, btnContent: string) {
    const config = new MatSnackBarConfig();
    config.data = { content: content, btnContent: btnContent, duration: 3000 };
    this._snackBar.openFromComponent(InfoSnackBarComponent, config);
  }

  refresh(params: ICellRendererParams<any, any>): boolean {
    return false
  }
}