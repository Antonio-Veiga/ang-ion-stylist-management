import { AfterViewInit, Component, HostListener, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { APIService } from 'src/app/services/api/api.service';
import { AgGridAngular, ICellRendererAngularComp } from 'ag-grid-angular';
import { ColDef, GridApi, ICellRendererParams } from 'ag-grid-community';
import { ServiceWrapper } from '../../models/ServiceWrapper';
import { AgGridComService } from 'src/app/services/service-coms/ag-grid-com.service';
import { BehaviorSubject } from 'rxjs';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { InfoSnackBarComponent } from 'src/app/partials/info-snack/info-snack.component';
import { ServiceCellData } from 'src/app/data/AgGridServiceCellData';
import { Service } from 'src/app/models/Service';
import { ProcessableService } from 'src/app/services/app-coms/processable.service';
import { MultipleChangesComService } from 'src/app/services/service-coms/multiple-changes-com.service';
import { MatDrawer, MatDrawerMode } from '@angular/material/sidenav';
import { Default_PT } from 'src/app/defaults/langs/pt-pt/Defaults';
import { AgGridUsable } from 'src/app/interfaces/Loadable';
import * as _ from 'lodash';

@Component({
  selector: 'app-desktop-services',
  templateUrl: './desktop-services.component.html',
  styleUrls: ['./desktop-services.component.scss'],
})
export class DesktopServicesComponent implements AfterViewInit, AgGridUsable {
  public menuSelectedBtn: 1 | 2 | 3 | 4 = 1
  public processing = false
  public pendingChanges?: Map<number, ServiceCellData>
  public toggle = { icon: 'menu', tooltip: Default_PT.OPEN_SIDE_MENU_TOOLTIP }
  public drawerAction: MatDrawerMode = window.innerWidth >= 1024 ? 'side' : 'over'
  public AG_GRID_PT_LANG = Default_PT.AG_GRID_LOCALE_PT

  public menuToggles = {
    1: Default_PT.CALENDAR_1,
    2: Default_PT.CALENDAR_2,
    3: Default_PT.CALENDAR_3,
    4: Default_PT.CALENDAR_4
  }

  public defaultToggles = { ... this.menuToggles }

  @ViewChild('drawer') drawer!: MatDrawer;
  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (event.target.innerWidth >= 1024) { this.drawerAction = 'side' } else { this.drawerAction = 'over' }
  }

  defaultColDef: ColDef = {
    flex: 1,
    resizable: false,
    sortable: false,
    filter: false,
    editable: false,
    suppressMovable: true,
    suppressNavigable: false,
  }

  columnDefs: ColDef[] = [
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

  constructor(public api: APIService, public processable: ProcessableService, public mccs: MultipleChangesComService) { this.menuToggles[1] = Default_PT.CALENDAR_1_ACTIVE }

  loadContent(): void {
    this.onGridReady()
  }

  ngAfterViewInit(): void {
    this.drawer.openedChange.subscribe((opened) => {
      if (opened) { this.toggle.icon = "exit"; this.toggle.tooltip = Default_PT.CLOSE_SIDE_MENU_TOOLTIP } else { this.toggle.icon = "menu"; this.toggle.tooltip = Default_PT.OPEN_SIDE_MENU_TOOLTIP }
    });

    this.mccs.PendingMapSubject.subscribe((PendingMap) => {
      this.pendingChanges = _.clone(PendingMap)
    })

    this.processable._Processing.subscribe((shouldProcess) => {
      this.processing = shouldProcess
    })
  }

  onGridReady() {
    this.loadGrid(this.menuSelectedBtn)
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

  formatData(wrapper: ServiceWrapper): any[] {
    let fdata: any[] = []
    wrapper.data.forEach((service) => {
      fdata.push({ ...service })
    })
    return fdata
  }

  switchMenuBtn(id: 1 | 2 | 3 | 4, force?: boolean) {
    if (id != this.menuSelectedBtn || force) {
      this.menuSelectedBtn = id

      this.mccs.clearPendingChanges()
      this.defaultMenus()
      this.loadGrid(id)

      this.menuToggles[id] = Default_PT[`CALENDAR_${id}_ACTIVE`]
    }
  }

  defaultMenus() {
    this.menuToggles = { ... this.defaultToggles }
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
}

@Component({
  selector: 'segment-holder',
  templateUrl: './micro-components-views/segment.component.html',
  styleUrls: ['./desktop-services.component.scss'],
})
export class SegementHolder implements ICellRendererAngularComp {
  public state!: 0 | 1
  public stateBehaviourSub = new BehaviorSubject<0 | 1>(this.state);
  private updatedCellData!: ServiceCellData

  constructor(private agGridCom: AgGridComService) { }

  agInit(params: ICellRendererParams<any, any>): void {
    this.state = params.value
    this.stateBehaviourSub.next(this.state)

    this.updatedCellData = {
      cellId: params.data.id,
      rowIdx: params.rowIndex,
      duration: params.data.duration,
      price: params.data.price,
      active: params.value
    }

    this.stateBehaviourSub.subscribe((value) => {
      this.updatedCellData.active = value
      this.agGridCom.notifyCellValueChanged(this.updatedCellData)
    });

    this.agGridCom.CellSubject.subscribe((CellData) => {
      if (this.updatedCellData.rowIdx == CellData.rowIdx) {
        if (CellData.active != this.updatedCellData.active) { this.state = CellData.active }
        this.updatedCellData = { ...CellData }
      }
    })
  }

  refresh(params: ICellRendererParams<any, any>): boolean {
    return false
  }
}

@Component({
  selector: 'price-input-holder',
  templateUrl: './micro-components-views/input-price.component.html',
  styleUrls: ['./desktop-services.component.scss'],
})
export class PriceInputHolder implements ICellRendererAngularComp {
  validator!: FormGroup
  private updatedCellData!: ServiceCellData

  constructor(private formBuilder: FormBuilder, private agGridCom: AgGridComService) { }

  agInit(params: ICellRendererParams<any, any>): void {
    this.validator = this.formBuilder.group({
      price: ['', [Validators.required, Validators.pattern(/^(0|[1-9]\d?)(\.\d{1,2})?$/)]],
    })

    this.validator.setValue({ price: params.value })
    this.validator.markAllAsTouched()

    this.updatedCellData = {
      cellId: params.data.id,
      rowIdx: params.rowIndex,
      duration: params.data.duration,
      price: params.value,
      active: params.data.active,
    }

    this.validator.get('price')?.valueChanges.subscribe((value) => {
      this.updatedCellData.price = value
      this.agGridCom.notifyCellValueChanged(this.updatedCellData)
    })

    this.agGridCom.CellSubject.subscribe((CellData) => {
      if (this.updatedCellData.rowIdx == CellData.rowIdx) {
        if (CellData.price != this.updatedCellData.price) { this.validator.setValue({ price: CellData.price }) }
        this.updatedCellData = { ...CellData }
      }
    })
  }

  refresh(params: ICellRendererParams<any, any>): boolean {
    return false;
  }
}

@Component({
  selector: 'duration-input-holder',
  templateUrl: './micro-components-views/input-duration.component.html',
  styleUrls: ['./desktop-services.component.scss'],
})
export class DurationInputHolder implements ICellRendererAngularComp {
  validator!: FormGroup
  private updatedCellData!: ServiceCellData

  constructor(private formBuilder: FormBuilder, private agGridCom: AgGridComService) { }

  agInit(params: ICellRendererParams<any, any>): void {
    this.validator = this.formBuilder.group({
      duration: ['', [Validators.required, Validators.pattern(/^(?:0|[1-9]\d{0,2}|1[0-3]\d{2}|14[0-3]\d|1440)$/)]],
    })

    this.validator.setValue({ duration: params.value })
    this.validator.markAllAsTouched()

    this.updatedCellData = {
      cellId: params.data.id,
      rowIdx: params.rowIndex,
      duration: params.value,
      price: params.data.price,
      active: params.data.active,
    }

    this.validator.get('duration')?.valueChanges.subscribe((value) => {
      this.updatedCellData.duration = value
      this.agGridCom.notifyCellValueChanged(this.updatedCellData)
    })

    this.agGridCom.CellSubject.subscribe((CellData) => {
      if (this.updatedCellData.rowIdx == CellData.rowIdx) {
        if (CellData.duration != this.updatedCellData.duration) { this.validator.setValue({ duration: CellData.duration }) }
        this.updatedCellData = { ...CellData }
      }
    })
  }

  refresh(params: ICellRendererParams<any, any>): boolean {
    return false;
  }
}

@Component({
  selector: 'service-actions-holder',
  templateUrl: './micro-components-views/service-action-holder.component.html',
  styleUrls: ['./desktop-services.component.scss'],
})
export class ServiceActionsHolder implements ICellRendererAngularComp {
  private defaultCellData!: ServiceCellData
  private updatedCellData!: ServiceCellData
  private cellId!: number
  public noChanges = true

  private gridApi_?: GridApi

  constructor(private agGridCom: AgGridComService, private _snackBar: MatSnackBar, public api: APIService, public processable: ProcessableService, public mccs: MultipleChangesComService) { }

  agInit(params: ICellRendererParams<any, any>): void {
    this.cellId = params.data.id
    this.gridApi_ = params.api

    this.defaultCellData = {
      cellId: this.cellId,
      rowIdx: params.rowIndex,
      duration: params.data.duration,
      price: params.data.price,
      active: params.data.active,
    }

    this.updatedCellData = { ...this.defaultCellData }

    this.agGridCom.CellSubject.subscribe((CellData) => {
      if (this.defaultCellData.cellId == CellData.cellId) {
        this.updatedCellData = { ...CellData }
        this.noChanges = !this.changed()

        if (this.noChanges) { this.mccs.removePedingChange(this.cellId) } else { this.mccs.addPendingChange(this.cellId, { ...this.updatedCellData }) }
      }
    })

    this.mccs.clearPendingChanges()
  }

  refresh(params: ICellRendererParams<any, any>): boolean {
    return false;
  }

  reload() {
    this.agGridCom.notifyCellValueChanged(this.defaultCellData)
  }

  store() {
    if (this.changed()) {
      if (this.validateCellData(this.updatedCellData)) {
        this.gridApi_?.showLoadingOverlay();
        let _Service: Service = {}

        if (this.defaultCellData.active != this.updatedCellData.active) { _Service.active = this.updatedCellData.active }
        if (this.defaultCellData.duration != this.updatedCellData.duration) { _Service.duration = this.updatedCellData.duration }
        if (this.defaultCellData.price != this.updatedCellData.price) { _Service.price = this.updatedCellData.price }

        this.processable.notifyWhenProcessing(true)
        this.api.patchService(_Service, this.cellId).subscribe(() => {
          this.defaultCellData = { ... this.updatedCellData }
          this.noChanges = true
          this.mccs.removePedingChange(this.cellId)
          this.openInfoSnackBar(Default_PT.SERVICE_VALUES_CHANGED, Default_PT.INFO_BTN);
          this.gridApi_?.hideOverlay();
          this.processable.notifyWhenProcessing(false)
        })
      } else {
        this.openInfoSnackBar(Default_PT.INVALID_INPUT, Default_PT.INFO_BTN);
      }
    } else {
      this.openInfoSnackBar(Default_PT.NO_CHANGES, Default_PT.INFO_BTN);
    }
  }

  changed(): boolean {
    return !(_.isEqual(this.defaultCellData, this.updatedCellData))
  }

  validateCellData(data: ServiceCellData): boolean {
    if (/^(0|[1-9]\d?)(\.\d{1,2})?$/.test(data.price.toString())
      && /^(?:0|[1-9]\d{0,2}|1[0-3]\d{2}|14[0-3]\d|1440)$/.test(data.duration.toString())) {
      return true
    }
    return false
  }

  openInfoSnackBar(content: string, btnContent: string) {
    const config = new MatSnackBarConfig();
    config.data = { content: content, btnContent: btnContent, duration: 3000 };
    this._snackBar.openFromComponent(InfoSnackBarComponent, config);
  }
}