import { AfterViewInit, Component, HostListener, Inject, ViewChild, ViewContainerRef } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDrawer, MatDrawerMode } from '@angular/material/sidenav';
import { AgGridAngular, ICellRendererAngularComp } from 'ag-grid-angular';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { DeleteDialogData } from 'src/app/interfaces/DeleteDialogData';
import { AgGridUsable } from 'src/app/interfaces/Loadable';
import { ClientWrapper } from 'src/app/models/ClientWrapper';
import { APIService } from 'src/app/services/api/api.service';
import { Default_PT } from 'src/app/defaults/langs/pt-pt/Defaults';
import { DesktopCreateEditClientModalComponent } from 'src/app/modals/desktop-create-edit-client-modal/desktop-create-edit-client-modal.component';
import { ClientAgGridComService } from 'src/app/services/client-coms/client-ag-grid-com.service';
import { ClientCellData } from 'src/app/data/AgGridClientCellData';
import { Client } from 'src/app/models/Client';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { InfoSnackBarComponent } from 'src/app/partials/info-snack/info-snack.component';
const moment = require('moment')

@Component({
  selector: 'app-desktop-clients',
  templateUrl: './desktop-clients.component.html',
  styleUrls: ['./desktop-clients.component.scss'],
})
export class DesktopClientsComponent implements AfterViewInit, AgGridUsable {
  public menuSelectedBtn: 1 | 2 = 1
  public processing = false
  public clientData!: ClientWrapper
  public drawerAction: MatDrawerMode = window.innerWidth >= 1024 ? 'side' : 'over'
  public toggle = { icon: 'menu', tooltip: Default_PT.OPEN_SIDE_MENU_TOOLTIP }
  public AG_GRID_PT_LANG = Default_PT.AG_GRID_LOCALE_PT

  public menuToggles = {
    1: Default_PT.CLIENT_MENU_1,
    2: Default_PT.CLIENT_MENU_2,
  }

  public defaultToggles = { ... this.menuToggles }

  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;
  @ViewChild('drawer') drawer!: MatDrawer;

  columnDefs: ColDef[] = [
    {
      field: 'name',
      cellClass: 'flex items-center justify-start',
      headerName: Default_PT.NAME,
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
      floatingFilter: true
    },
    {
      field: 'instagram',
      cellClass: 'flex items-center justify-center',
      headerName: Default_PT.INSTAGRAM,
      floatingFilter: true
    },
    {
      field: 'facebook',
      cellClass: 'flex items-center justify-center',
      headerName: Default_PT.FACEBOOK,
      floatingFilter: true
    },
    {
      field: 'actions',
      headerName: Default_PT.ACTIONS,
      maxWidth: 120,
      filter: false,
      resizable: false,
      sortable: false,
      cellRendererSelector: (params: any) => {
        if (params.data.deleted == 0) { return { component: ClientActionsHolder } }

        return { component: NoActionsHolder }
      }
    }
  ]

  defaultColDef: ColDef = {
    flex: 1,
    resizable: false,
    sortable: true,
    filter: true,
    editable: false,
  }

  constructor(public api: APIService, public _dialog: MatDialog, public agGridCom: ClientAgGridComService, public _snackBar: MatSnackBar) { this.menuToggles[1] = Default_PT.CLIENT_MENU_1_ACTIVE }

  ngAfterViewInit(): void {
    this.drawer.openedChange.subscribe((opened) => {
      if (opened) { this.toggle.icon = "exit"; this.toggle.tooltip = Default_PT.CLOSE_SIDE_MENU_TOOLTIP } else { this.toggle.icon = "menu"; this.toggle.tooltip = Default_PT.OPEN_SIDE_MENU_TOOLTIP }
    });

    this.agGridCom.CellSubject.subscribe((CellData) => {
      console.log(CellData.action)
      CellData.action == 'delete' ? this.deleteClient(CellData.client) : this.loadContent()
    })
  }

  loadContent(): void {
    this.onGridReady()
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (event.target.innerWidth >= 1024) { this.drawerAction = 'side' } else { this.drawerAction = 'over' }
  }

  onGridReady() {
    this.menuSelectedBtn == 1 ? this.loadActiveClients() : this.loadDeletedClients()
  }

  formatData(wrapper: ClientWrapper): any[] {
    let fdata: any[] = []
    wrapper.data.forEach(client => {
      fdata.push({ ...client })
    });
    return fdata
  }

  switchMenuBtn(id: 1 | 2, force?: boolean) {
    if (id != this.menuSelectedBtn || force) {
      this.menuSelectedBtn = id

      this.defaultMenus()
      this.onGridReady()

      this.menuToggles[id] = Default_PT[`CLIENT_MENU_${id}_ACTIVE`]
    }
  }

  defaultMenus() {
    this.menuToggles = { ... this.defaultToggles }
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

  promptCreateClient() {
    const CEDiagRef = this._dialog.open(DesktopCreateEditClientModalComponent, {
      data: {
        client: Client,
        action: 'add'
      }
    });

    CEDiagRef.afterClosed().subscribe(() => {
      if (CEDiagRef.componentInstance._data.response) {
        this.loadContent()
      }
    })
  }

  deleteClient(data: Client) {
    this.processing = true
    this.agGrid.api.showLoadingOverlay()

    this.api.deleteClient(data.id).subscribe(() => {
      this.agGrid.api.hideOverlay()
      this.processing = false
      this.onGridReady()
      this.openInfoSnackBar(Default_PT.DELETE_CLIENT_SUCCESS, Default_PT.INFO_BTN)
    })
  }


  openInfoSnackBar(content: string, btnContent: string) {
    const config = new MatSnackBarConfig();
    config.data = { content: content, btnContent: btnContent, duration: 3000 };
    this._snackBar.openFromComponent(InfoSnackBarComponent, config);
  }
}

@Component({
  selector: 'client-actions-holder',
  template: `
  <div class="w-full h-full flex items-center justify-center">
    <ion-icon name="close-outline" color="danger"
        class="!text-lg cursor-not-allowed duration-150 hover:scale-105 p-1.5 hover:border hover:border-gray-300 bg-white rounded-full mr-1"
        mat-raised-button #pencilIcon="matTooltip" [matTooltip]="'Sem ações possíveis'"
        matTooltipPosition="below"></ion-icon>
  </div>
`
})
export class NoActionsHolder implements ICellRendererAngularComp {
  agInit(params: ICellRendererParams<any, any>): void { }
  refresh(params: ICellRendererParams<any, any>): boolean {
    return false;
  }
}

@Component({
  selector: 'client-actions-holder',
  templateUrl: './micro-components-views/client-action-holder.component.html',
  styleUrls: ['./desktop-clients.component.scss'],
})
export class ClientActionsHolder implements ICellRendererAngularComp {
  cellData: ClientCellData = { client: {}, action: 'none' }

  constructor(public _dialog: MatDialog, public agGridCom: ClientAgGridComService) { }

  agInit(params: ICellRendererParams<any, any>): void { this.cellData.client = { ...params.data } }

  refresh(params: ICellRendererParams<any, any>): boolean {
    return false
  }

  promptEditClient() {
    const CEDiagRef = this._dialog.open(DesktopCreateEditClientModalComponent, {
      data: {
        client: this.cellData.client,
        action: 'edit',
        response: false
      }
    });

    CEDiagRef.afterClosed().subscribe(() => {
      if (CEDiagRef.componentInstance._data.response) {
        this.cellData.action = 'edit'
        this.cellData.client = { ...CEDiagRef.componentInstance._data.client }
        this.agGridCom.notifyCellValueChanged({ ...this.cellData });
      }
    })
  }

  promptDeleteClient() {
    const deleteDiagRef = this._dialog.open(DeleteDialog, {
      data: {
        prompt: Default_PT.DELETE_CLIENT_PROMPT,
        name: this.cellData.client.name
      }
    });

    deleteDiagRef.afterClosed().subscribe(() => {
      if (deleteDiagRef.componentInstance.diagData.response) {
        this.cellData.action = 'delete'
        this.agGridCom.notifyCellValueChanged({ ...this.cellData });
      }
    })
  }
}


@Component({
  selector: 'delete-client-dialog',
  templateUrl: 'micro-components-views/delete-client.dialog.html',
  styleUrls: ['./desktop-clients.component.scss']
})
export class DeleteDialog {
  constructor(public dialogRef: MatDialogRef<DeleteDialog>, @Inject(MAT_DIALOG_DATA) public diagData: DeleteDialogData) { }

  onCancelClick() {
    this.diagData.response = false
    this.dialogRef.close()
  }

  onConfirmClick() {
    this.diagData.response = true
    this.dialogRef.close()
  }
}
