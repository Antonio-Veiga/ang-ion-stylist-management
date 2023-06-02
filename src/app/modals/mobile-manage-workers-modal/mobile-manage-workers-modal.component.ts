import { Component, ViewChild } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';
import { Default_PT } from 'src/app/defaults/langs/pt-pt/Defaults';
import { InfoSnackBarComponent } from 'src/app/partials/info-snack/info-snack.component';
import { APIService } from 'src/app/services/api/api.service';
import { isEmpty, cloneDeep } from 'lodash';
import { WorkerPendingChangesComService } from 'src/app/services/worker-coms/worker-pending-changes-com.service';
import { Label } from 'src/app/models/Label';
import { LabelRemovalPayload } from 'src/app/models/payloads/HandleLabelRemovalPayload';
import { lastValueFrom } from 'rxjs';
import { NotifyValueStoredComService } from 'src/app/services/worker-coms/notify-value-stored-com.service';
import { LabelGluePayload } from 'src/app/models/payloads/HandleMassPostLabelGluePayload';
import { ProcessingWorkerComService } from 'src/app/services/worker-coms/processing-worker-com.service';
import { WorkerMultipleChangesComService } from 'src/app/services/worker-coms/worker-multiple-changes-com.service';
import { WorkerNormalizedData } from 'src/app/data/WorkerNormalizedChanges';
import { DesktopCreateWorkerModalComponent } from '../desktop-create-worker-modal/desktop-create-worker-modal.component';
import { PendingChangesComponent } from '../desktop-manage-workers-modal/sub-components/pending-changes/pending-changes.component';
import { WorkerActionsHolder, WorkerNameInputSelector, WorkersCalendarSelector, WorkersColorSelector } from '../desktop-manage-workers-modal/desktop-manage-workers-modal.component';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-mobile-manage-workers-modal',
  templateUrl: './mobile-manage-workers-modal.component.html',
  styleUrls: ['./mobile-manage-workers-modal.component.scss'],
  providers: [
    WorkerPendingChangesComService,
    NotifyValueStoredComService,
    ProcessingWorkerComService,
    WorkerMultipleChangesComService
  ]
})
export class MobileManageWorkersModalComponent {
  public componentTitle = Default_PT.MANAGE_WORKERS
  public pedingChangesTitle = Default_PT.CALENDAR_PENDING_CHANGES
  public AG_GRID_PT_LANG = Default_PT.AG_GRID_LOCALE_PT
  PendingChangesComponent = PendingChangesComponent
  public hasCalendarChanges: boolean = false
  public isProcessing: boolean = false
  public pendingWorkerChanges: Map<number, WorkerNormalizedData> = new Map()

  public isSmallScreen = window.matchMedia("(max-width: 600px)").matches;

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

  columnDefs: ColDef[] = this.isSmallScreen ? [
    {
      field: 'name',
      headerName: Default_PT.NAME,
      floatingFilter: true,
      filter: true,
      cellRendererSelector: (params: any) => {
        return { component: WorkerNameInputSelector }
      }
    },
    {
      field: 'actions',
      headerName: Default_PT.ACTIONS,
      maxWidth: 150,
      cellRendererSelector: (params: any) => {
        return { component: WorkerActionsHolder }
      }
    }]
    : [{
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
    public modalController: ModalController
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

  async addWorker() {
    const modal = await this.modalController.create({
      component: DesktopCreateWorkerModalComponent,
      breakpoints: [0, 1],
      cssClass: 'mobile-create',
      initialBreakpoint: 1,
      mode: 'ios',
      backdropDismiss: true,
      showBackdrop: true,
    });

    await modal.present();
  }

  onGridReady() {
    this.ps.notifyWhenProcessing(true)
    this.agGrid.api.showLoadingOverlay()

    this.api.getLabels().subscribe((wrapper) => {
      this.agGrid.api.setRowData(wrapper.data)
      this.agGrid.api.hideOverlay()
      this.ps.notifyWhenProcessing(false)
    })


    if (this.isSmallScreen) {
      this.wpc.removeAll()
    }
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
