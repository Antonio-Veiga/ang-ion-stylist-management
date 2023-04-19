import { CdkDrag } from '@angular/cdk/drag-drop';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { Default_PT } from 'src/app/defaults/langs/pt-pt/Defaults';
import { ClientActionsHolder, NoActionsHolder } from 'src/app/desktop/desktop-clients/desktop-clients.component';
import { AgGridUsable } from 'src/app/interfaces/Loadable';
import { MobileCreateEditClientModalComponent } from 'src/app/modals/mobile-create-edit-client-modal/mobile-create-edit-client-modal.component';
import { Client } from 'src/app/models/Client';
import { ClientWrapper } from 'src/app/models/ClientWrapper';
import { APIService } from 'src/app/services/api/api.service';

const moment = require('moment')
@Component({
  selector: 'app-mobile-clients',
  templateUrl: './mobile-clients.component.html',
  styleUrls: ['./mobile-clients.component.scss'],
})
export class MobileClientsComponent implements OnInit, AgGridUsable {
  public menuSelectedBtn: 1 | 2 = 1
  public processing = false
  public optionsEye = false

  public AG_GRID_PT_LANG = Default_PT.AG_GRID_LOCALE_PT
  public pageTitle = Default_PT.CLIENT_PAGE_TITLE
  public isSmallScreen = window.matchMedia("(max-width: 600px)").matches;

  public selectedClient?: Client

  public xAxisOpener = 'start'
  public yAxisOpener = 'top'

  @ViewChild(CdkDrag) dragRef!: CdkDrag;

  public clientIcons = {
    1: 'checkmark-circle-outline',
    2: 'trash-bin-outline',
  }
  public clientIcon = this.clientIcons[`${this.menuSelectedBtn}`]

  public eyeStates = {
    active: { icon: 'eye-off-outline', tooltip: Default_PT.HIDE_FLOATING_MENU, status: false },
    inactive: { icon: 'eye-outline', tooltip: Default_PT.SHOW_FLOATING_MENU, status: true }
  }

  public currEyeState = this.eyeStates.inactive

  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;
  public columnDefs: ColDef[] = this.isSmallScreen ? [
    {
      field: 'name',
      cellClass: '!text-xs sm:text-md flex items-center justify-start break-words p-2',
      headerName: Default_PT.NAME,
      floatingFilter: true
    },
    {
      field: 'sex',
      cellClass: '!text-xs sm:text-md flex items-center justify-center break-words p-2',
      headerName: Default_PT.SEX,
      filter: false,
      maxWidth: 90
    },
    {
      field: 'phonenumber',
      cellClass: '!text-xs sm:text-md flex items-center justify-center break-words text- p-2',
      headerName: Default_PT.PHONE_NUMBER,
      floatingFilter: true,
      resizable: false,
    }
  ] : [
    {
      field: 'name',
      headerName: Default_PT.NAME,
      cellClass: 'flex items-center justify-start',
      floatingFilter: true
    },
    {
      field: 'sex',
      cellClass: 'flex items-center justify-center',
      headerName: Default_PT.SEX,
      filter: false,
      maxWidth: 90
    },
    {
      field: 'address',
      cellClass: 'flex items-center justify-center',
      headerName: Default_PT.ADDRESS,
      floatingFilter: true
    },
    {
      field: 'birthdate',
      cellClass: 'flex items-center justify-center',
      headerName: Default_PT.BIRTHDATE,
      floatingFilter: true,
      cellRenderer: (params: any) => {
        return params.value != ('' || undefined) ? moment(params.value).format('DD/MM/YYYY') : ''
      }
    },
    {
      field: 'phonenumber',
      cellClass: 'flex items-center justify-center',
      headerName: Default_PT.PHONE_NUMBER,
      floatingFilter: true,
      resizable: false,
    }
  ]

  public defaultColDef: ColDef = {
    flex: 1,
    resizable: true,
    sortable: true,
    filter: true,
    editable: false,
    onCellClicked: (client) => { this.selectedClient = client.data }
  }

  constructor(public api: APIService, private alertController: AlertController, private modalController: ModalController) { }

  ngOnInit() { }

  loadContent(): void {
    this.onGridReady()
  }

  async onGridReady() {
    this.menuSelectedBtn == 1 ? this.loadActiveClients() : this.loadDeletedClients()
  }

  loadActiveClients() {
    this.processing = true
    this.agGrid.api.showLoadingOverlay()

    this.api.getActiveClients().subscribe((wrapper) => {
      const presenterData = this.formatData(wrapper)
      this.agGrid.api.setRowData(presenterData)
      this.agGrid.api.hideOverlay()
      this.processing = false
    });
  }

  switchMenuBtn(id: 1 | 2, force?: boolean) {
    if (id != this.menuSelectedBtn || force) {
      this.dragRef.reset()
      this.menuSelectedBtn = id
      this.clientIcon = this.clientIcons[`${this.menuSelectedBtn}`]
      this.selectedClient = undefined
      this.onGridReady()
    }
  }

  loadDeletedClients() {
    this.processing = true
    this.agGrid.api.showLoadingOverlay()

    this.api.getDeletedClients().subscribe((wrapper) => {
      const presenterData = this.formatData(wrapper)
      this.agGrid.api.setRowData(presenterData)
      this.agGrid.api.hideOverlay()
      this.processing = false
    });
  }

  async createClient() {
    const modal = await this.modalController.create({
      component: MobileCreateEditClientModalComponent,
      componentProps: {
        title: Default_PT.CREATE_CLIENT,
        client: Client,
        action: 'add'
      }
    });

    await modal.present();
  }

  async editClient() {
    const modal = await this.modalController.create({
      component: MobileCreateEditClientModalComponent,
      componentProps: {
        title: Default_PT.EDIT_CLIENT,
        client: this.selectedClient,
        action: 'edit'
      }
    });

    await modal.present();
  }

  async visualizeClient() {

  }


  async promptDeleteClient() {
    const alert = await this.alertController.create({
      header: 'A eliminar cliente',
      message: `Deseja eliminar ${this.selectedClient!.name}?`,
      buttons: ['Cancelar', 'Confirmar'],
      mode: 'ios'
    });

    await alert.present();
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


  formatData(wrapper: ClientWrapper): any[] {
    let fdata: any[] = []
    wrapper.data.forEach(client => {
      fdata.push({ ...client })
    });
    return fdata
  }
}
