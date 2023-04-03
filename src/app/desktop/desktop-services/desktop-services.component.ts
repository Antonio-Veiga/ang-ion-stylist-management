import { Component, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { APIService } from 'src/app/services/api.service';
import { AgGridAngular, ICellRendererAngularComp } from 'ag-grid-angular';
import { ColDef, GridApi, ICellRendererParams } from 'ag-grid-community';
import 'moment/locale/pt-br';
import { ServiceWrapper } from '../../models/ServiceWrapper';
import { AgGridComService } from 'src/app/services/ag-grid-com.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { InfoSnackBarComponent } from 'src/app/pieces/info-snack/info-snack.component';
import { Service } from 'src/app/models/Service';

const moment = require('moment');
moment.locale('pt-br')

@Component({
  selector: 'app-desktop-services',
  templateUrl: './desktop-services.component.html',
  styleUrls: ['./desktop-services.component.scss'],
})
export class DesktopServicesComponent {
  public menuSelectedBtn: 1 | 2 | 3 | 4 | number = 1

  public m = 'masculino'
  public f = 'feminino'
  public e = 'estética'
  public l = 'laser'

  public menuMappings = {
    1: {
      value: 'masculino',
      active: '♂ masculino',
    },
    2: {
      value: 'feminino',
      active: '♀ feminino',
    },
    3: {
      value: 'laser',
      active: '♨ laser',
    },
    4:
    {
      value: 'estética',
      active: '✧ estética',
    },
  }

  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;

  columnDefs: ColDef[] = [
    {
      field: 'nome'
    },
    {
      field: 'duração',
      cellRendererSelector: (params: any) => {
        return { component: DurationInputHolder }
      }
    },
    {
      field: 'preço',
      cellRendererSelector: (params: any) => {
        return { component: PriceInputHolder }
      }
    },
    {
      field: 'ativo',
      cellRendererSelector: (params: any) => {
        return { component: SegementHolder }
      }
    },
    {
      field: 'Ações',
      maxWidth: 120,
      resizable: false,
      sortable: false,
      cellRendererSelector: (params: any) => {
        return { component: ActionsHolder }
      }
    }
  ]

  defaultColDef: ColDef = {
    flex: 1,
    resizable: true,
    sortable: true,
    filter: false,
    editable: false,
    suppressMovable: true,
    suppressNavigable: false,
    cellClass: 'no-border'
  }

  constructor(public api: APIService) { this.m = this.menuMappings[1].active }

  onGridReady() {
    this.api.getServices(this.menuSelectedBtn).subscribe((wrapper) => {
      const presenterData = this.formatData(wrapper)
      this.agGrid.api.setRowData(presenterData)
    });
  }


  formatData(wrapper: ServiceWrapper): any[] {
    let services = wrapper.data
    let fdata: any[] = []
    services.forEach((service) => {
      fdata.push({
        id: service.id,
        nome: service.name,
        'duração': service.duration,
        'preço': service.price,
        ativo: service.active,
      })
    })
    return fdata
  }

  switchMenuBtn(id: number, force?: boolean) {
    if (id != this.menuSelectedBtn || force) {
      this.defaultMenus()

      this.loadGrid(id)

      if (id == 1) { this.m = this.menuMappings[1].active }
      if (id == 2) { this.f = this.menuMappings[2].active }
      if (id == 3) { this.l = this.menuMappings[3].active }
      if (id == 4) { this.e = this.menuMappings[4].active }

      this.menuSelectedBtn = id
    }
  }

  loadGrid(id: number) {
    this.agGrid.api.showLoadingOverlay()

    this.api.getServices(id).subscribe((wrapper) => {
      const presenterData = this.formatData(wrapper)
      this.agGrid.api.setRowData(presenterData)
      this.agGrid.api.hideOverlay()
    });
  }

  defaultMenus() {
    this.m = this.menuMappings[1].value
    this.f = this.menuMappings[2].value
    this.l = this.menuMappings[3].value
    this.e = this.menuMappings[4].value
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

  constructor(private agGridCom: AgGridComService) { }

  agInit(params: ICellRendererParams<any, any>): void {
    this.state = params.value
    this.stateBehaviourSub.next(this.state)

    this.stateBehaviourSub.subscribe(value => this.agGridCom.notifyActiveChanged(value));
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

  constructor(private formBuilder: FormBuilder, private agGridCom: AgGridComService) { }

  agInit(params: ICellRendererParams<any, any>): void {
    this.validator = this.formBuilder.group({
      price: ['', [Validators.required, Validators.pattern(/^(?!\s)(?!.*\s{2,})(.*\S)?(?<!\s)$/)]],
    })

    this.validator.setValue({ price: params.value })
    this.validator.markAllAsTouched()

    this.validator.get('price')?.valueChanges.subscribe((value) => {
      this.agGridCom.notifyPriceChanged(value);

      if (!this.validator.valid) { this.agGridCom.notifyValidChanged(false); }
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

  constructor(private formBuilder: FormBuilder, private agGridCom: AgGridComService) { }

  agInit(params: ICellRendererParams<any, any>): void {
    this.validator = this.formBuilder.group({
      duration: ['', [Validators.required, Validators.pattern(/^(?:0|[1-9]\d{0,2}|1[0-3]\d{2}|14[0-3]\d|1440)$/)]],
    })

    this.validator.setValue({ duration: params.value })
    this.validator.markAllAsTouched()

    this.validator.get('duration')?.valueChanges.subscribe((value) => {
      this.agGridCom.notifyDurationChanged(value);

      if (!this.validator.valid) { this.agGridCom.notifyValidChanged(false); }
    })
  }

  refresh(params: ICellRendererParams<any, any>): boolean {
    return false;
  }
}

@Component({
  selector: 'duration-input-holder',
  templateUrl: './micro-components-views/action-holder.component.html',
  styleUrls: ['./desktop-services.component.scss'],
})
export class ActionsHolder implements ICellRendererAngularComp, OnDestroy {
  defaultData: any
  rowIdx: any
  gridApi: GridApi<any> | undefined

  durationSub!: Subscription
  priceSub!: Subscription
  activeSub!: Subscription

  validFormSub!: Subscription

  price?: number
  duration?: number
  active!: 0 | 1
  valid: boolean = true

  constructor(private agGridCom: AgGridComService, private _snackBar: MatSnackBar, public api: APIService) { }

  ngOnDestroy(): void {
    this.durationSub.unsubscribe();
  }

  agInit(params: ICellRendererParams<any, any>): void {
    this.defaultData = params.data; this.gridApi = params.api; this.rowIdx = params.rowIndex;

    this.durationSub = this.agGridCom.durationValueChanged.subscribe(value => {
      this.duration = value
    })

    this.priceSub = this.agGridCom.priceValueChanged.subscribe(value => {
      this.price = value
    })

    this.activeSub = this.agGridCom.activeValueChanged.subscribe(value => {
      this.active = value
    })

    this.validFormSub = this.agGridCom.validValueChanged.subscribe(value => {
      this.valid = value
    })
  }

  refresh(params: ICellRendererParams<any, any>): boolean {
    return false;
  }

  reload() {
    let node = this.gridApi?.getRowNode(this.rowIdx)
    node?.setData(this.defaultData)
    this.agGridCom.notifyDurationChanged(node?.data['duração']);
    this.agGridCom.notifyPriceChanged(node?.data['preço']);
    this.agGridCom.notifyActiveChanged(node?.data['ativo']);
  }

  store() {
    // validate changes on data
    let durChanged = !this.duration || this.duration == this.defaultData['duração'] ? false : true
    let priceChanged = !this.price || this.price == this.defaultData['preço'] ? false : true
    let activeChanged = this.active == this.defaultData['ativo'] ? false : true

    if (!durChanged && !priceChanged && !activeChanged) {
      this.openInfoSnackBar('Nenhuma valor a alterar', 'Entendido');
    } else {
      this.gridApi?.showLoadingOverlay();
      let service: Service = {}

      if (durChanged) { service.duration = this.duration }
      if (priceChanged) { service.price = this.price }
      if (activeChanged) { service.active = this.active }

      this.api.patchService(service, this.defaultData.id).subscribe((client) => {

        this.defaultData['duração'] = client.data.duration
        this.defaultData['preço'] = client.data.price
        this.defaultData['ativo'] = client.data.active

        this.openInfoSnackBar('Os valores do serviço foram alterados', 'Entendido');
        this.gridApi?.hideOverlay();
      })
    }
  }

  openInfoSnackBar(content: string, btnContent: string) {
    const config = new MatSnackBarConfig();
    config.data = { content: content, btnContent: btnContent, duration: 3000 };
    this._snackBar.openFromComponent(InfoSnackBarComponent, config);
  }
}