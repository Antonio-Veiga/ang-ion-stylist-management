import { CdkDrag } from '@angular/cdk/drag-drop';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { AlertController, ModalController } from '@ionic/angular';
import { AgGridAngular, ICellRendererAngularComp } from 'ag-grid-angular';
import { ColDef, GridApi, ICellRendererParams } from 'ag-grid-community';
import { ServiceCellData } from 'src/app/data/AgGridServiceCellData';
import { Default_PT } from 'src/app/defaults/langs/pt-pt/Defaults';
import { DurationInputHolder, PriceInputHolder, SegementHolder, ServiceActionsHolder } from 'src/app/desktop/desktop-services/desktop-services.component';
import { AgGridUsable } from 'src/app/interfaces/Loadable';
import { Service } from 'src/app/models/Service';
import { ServiceWrapper } from 'src/app/models/ServiceWrapper';
import { InfoSnackBarComponent } from 'src/app/partials/info-snack/info-snack.component';
import { APIService } from 'src/app/services/api/api.service';
import { ProcessableService } from 'src/app/services/app-coms/processable.service';
import { MultipleChangesComService } from 'src/app/services/service-coms/multiple-changes-com.service';
import * as _ from 'lodash';
import { MobileViewServiceModalComponent } from 'src/app/modals/mobile-view-service-modal/mobile-view-service-modal.component';
import { MobileChangeServiceModalComponent } from 'src/app/modals/mobile-change-service-modal/mobile-change-service-modal.component';
import { AgGridComService } from 'src/app/services/service-coms/ag-grid-com.service';
@Component({
  selector: 'app-mobile-services',
  templateUrl: './mobile-services.component.html',
  styleUrls: ['./mobile-services.component.scss'],
})
export class MobileServicesComponent implements OnInit, AgGridUsable {
  public menuSelectedBtn: 1 | 2 | 3 | 4 = 1
  public processing = false
  public optionsEye = false

  public AG_GRID_PT_LANG = Default_PT.AG_GRID_LOCALE_PT
  public pageTitle = Default_PT.SERVICE_PAGE_TITLE
  public pendingChanges?: Map<number, ServiceCellData>
  public isSmallScreen = window.matchMedia("(max-width: 600px)").matches;

  public selectedService?: ServiceCellData

  public xAxisOpener = 'start'
  public yAxisOpener = 'top'

  @ViewChild(CdkDrag) dragRef!: CdkDrag;

  public serviceIcons = {
    1: 'man-outline',
    2: 'woman-outline',
    3: 'color-fill-outline',
    4: 'flash-outline'
  }
  public serviceIcon = this.serviceIcons[`${this.menuSelectedBtn}`]

  public eyeStates = {
    active: { icon: 'eye-off-outline', tooltip: Default_PT.HIDE_FLOATING_MENU, status: false },
    inactive: { icon: 'eye-outline', tooltip: Default_PT.SHOW_FLOATING_MENU, status: true }
  }

  public currEyeState = this.eyeStates.inactive

  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;

  defaultColDef: ColDef = {
    flex: 1,
    resizable: true,
    sortable: false,
    filter: false,
    editable: false,
    suppressMovable: true,
    suppressNavigable: false,
    onCellClicked: (service) => {
      this.selectedService = {
        rowIdx: service.rowIndex,
        cellId: service.data.id,
        name: service.data.name,
        duration: service.data.duration,
        price: service.data.price,
        active: service.data.active
      }
    }
  }

  columnDefs: ColDef[] = this.isSmallScreen ?
    [
      {
        field: 'name',
        headerName: Default_PT.NAME,
        cellRendererSelector: (params: any) => {
          return { component: ServiceNameHolder }
        }
      },
      {
        field: 'active',
        headerName: Default_PT.ACTIVE,
        minWidth: 160,
        cellRendererSelector: (params: any) => {
          return { component: SegementHolder }
        }
      }
    ] : [
      {
        field: 'name',
        headerName: Default_PT.NAME
      },
      {
        field: 'duration',
        headerName: Default_PT.DURATION,
        cellRendererSelector: (params: any) => {
          return { component: DurationInputHolder }
        }
      },
      {
        field: 'price',
        headerName: Default_PT.PRICE,
        cellRendererSelector: (params: any) => {
          return { component: PriceInputHolder }
        }
      },
      {
        field: 'active',
        headerName: Default_PT.ACTIVE,
        minWidth: 160,
        cellRendererSelector: (params: any) => {
          return { component: SegementHolder }
        }
      },
      {
        field: 'actions',
        headerName: Default_PT.ACTIONS,
        maxWidth: 120,
        resizable: false,
        sortable: false,
        cellRendererSelector: (params: any) => {
          return { component: ServiceActionsHolder }
        }
      }
    ]

  constructor(public api: APIService, public _snackBar: MatSnackBar, public processable: ProcessableService, public mccs: MultipleChangesComService, public modalController: ModalController) {

    this.mccs.PendingMapSubject.subscribe((PendingMap) => {
      this.pendingChanges = _.clone(PendingMap)
    })

    this.processable._Processing.subscribe((shouldProcess) => {
      this.processing = shouldProcess
    })
  }

  ngOnInit() { }

  loadContent(): void {
    this.onGridReady()
  }

  onGridReady() {
    this.loadGrid(this.menuSelectedBtn)
  }

  loadGrid(id: number) {
    this.processing = true
    this.agGrid.api.showLoadingOverlay()

    this.api.getServices(id).subscribe((wrapper) => {
      const presenterData = this.formatData(wrapper)
      this.agGrid.api.setRowData(presenterData)
      this.agGrid.api.hideOverlay()
      this.processing = false
    });
  }

  async editService() {

    let tmpService = this.mccs.getPendingValue(this.selectedService!.cellId)

    const modal = await this.modalController.create({
      component: MobileChangeServiceModalComponent,
      mode: 'ios',
      breakpoints: [0, +(290 / window.innerHeight).toFixed(2)],
      initialBreakpoint: +(290 / window.innerHeight).toFixed(2),
      backdropDismiss: true,
      showBackdrop: true,
      componentProps: {
        service: tmpService ? { ...tmpService } : this.selectedService,
      }
    });

    await modal.present();
  }

  async visualizeService() {

    let tmpService = this.mccs.getPendingValue(this.selectedService!.cellId)

    const modal = await this.modalController.create({
      component: MobileViewServiceModalComponent,
      mode: 'ios',
      breakpoints: [0, +(318 / window.innerHeight).toFixed(2)],
      initialBreakpoint: +(318 / window.innerHeight).toFixed(2),
      backdropDismiss: true,
      showBackdrop: true,
      componentProps: {
        service: tmpService ? { ...tmpService } : this.selectedService,
      }
    });

    await modal.present();
  }


  switchMenuBtn(id: 1 | 2 | 3 | 4, force?: boolean) {
    if (id != this.menuSelectedBtn || force) {
      this.dragRef.reset()
      this.menuSelectedBtn = id
      this.selectedService = undefined
      this.serviceIcon = this.serviceIcons[`${this.menuSelectedBtn}`]
      this.onGridReady()
    }
  }

  loadNextPage() {
    this.processing = true;
    this.agGrid.api.paginationGoToNextPage();
    this.processing = false;
  }

  loadPreviousPage() {
    this.processing = true;
    this.agGrid.api.paginationGoToPreviousPage();
    this.processing = false;
  }

  saveAll() {
    if (this.pendingChanges && this.pendingChanges.size != 0) {
      let wrapper = new ServiceWrapper
      wrapper.data = []

      this.processing = true
      this.agGrid.api.showLoadingOverlay()

      this.pendingChanges.forEach((value) => {
        let tmpService: Service = {
          id: value.cellId,
          price: value.price,
          duration: value.duration,
          active: value.active
        }
        wrapper.data.push(tmpService)
      })

      this.api.massAssignServices(wrapper).subscribe(() => {
        this.agGrid.api.hideOverlay()
        this.loadGrid(this.menuSelectedBtn)
      })
    }
  }

  fabMoving(event: any) {
    if (event.pointerPosition.x > window.innerWidth / 2) {
      this.xAxisOpener = 'start'
    } else { this.xAxisOpener = 'end' }

    if (event.pointerPosition.y > window.innerHeight / 2) {
      this.yAxisOpener = 'top'
    } else { this.yAxisOpener = 'bottom' }
  }

  triggerOptionsBtn() {
    if (this.currEyeState.status) {
      this.currEyeState = this.eyeStates.active
      this.dragRef.reset()
    }
    else { this.currEyeState = this.eyeStates.inactive }
  }

  openInfoSnackBar(content: string, btnContent: string) {
    const config = new MatSnackBarConfig();
    config.data = { content: content, btnContent: btnContent, duration: 3000 };
    this._snackBar.openFromComponent(InfoSnackBarComponent, config);
  }

  formatData(wrapper: ServiceWrapper): any[] {
    let fdata: any[] = []
    wrapper.data.forEach((service) => {
      fdata.push({ ...service })
    })
    return fdata
  }
}


@Component({
  selector: 'client-actions-holder',
  templateUrl: './micro-components-views/service-name-holder.component.html',
})
export class ServiceNameHolder implements ICellRendererAngularComp {
  private defaultCellData!: ServiceCellData
  private updatedCellData!: ServiceCellData
  private cellId!: number
  public noChanges = true
  public serviceName?: String

  constructor(private agGridCom: AgGridComService, public mccs: MultipleChangesComService) { }

  agInit(params: ICellRendererParams<any, any>): void {
    this.cellId = params.data.id
    this.serviceName = params.data.name

    this.defaultCellData = {
      cellId: this.cellId,
      rowIdx: params.rowIndex,
      duration: params.data.duration,
      price: params.data.price,
      active: params.data.active,
    }

    this.agGridCom.CellSubject.subscribe((CellData) => {
      if (this.defaultCellData.cellId == CellData.cellId) {
        this.updatedCellData = { ...CellData }
        this.noChanges = !this.changed()

        if (this.noChanges) { this.mccs.removePedingChange(this.cellId) } else { this.mccs.addPendingChange(this.cellId, { ...this.updatedCellData }) }
      }
    })
  }

  changed(): boolean {
    console.log(this.defaultCellData)
    console.log(this.updatedCellData)
    return !(_.isEqual(this.defaultCellData, this.updatedCellData))
  }

  refresh(params: ICellRendererParams<any, any>): boolean {
    return false;
  }
}