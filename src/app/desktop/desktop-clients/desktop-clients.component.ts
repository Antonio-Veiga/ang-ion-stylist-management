import { AfterViewInit, Component, Inject, ViewChild, ViewContainerRef } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IonSlides } from '@ionic/angular';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridReadyEvent, RowClickedEvent } from 'ag-grid-community';
import { AgGridUsable } from 'src/app/interfaces/Loadable';
import { DesktopCreateEditClientModalComponent } from 'src/app/modals/desktop-create-edit-client-modal/desktop-create-edit-client-modal.component';
import { ClientWrapper } from 'src/app/models/ClientWrapper';
import { APIService } from 'src/app/services/api.service';

const moment = require('moment');

@Component({
  selector: 'app-desktop-clients',
  templateUrl: './desktop-clients.component.html',
  styleUrls: ['./desktop-clients.component.scss'],
})
export class DesktopClientsComponent implements AfterViewInit, AgGridUsable {
  public selectedRow?: any = { nome: '<vazio>' }
  public clientData!: ClientWrapper
  public rowData$: any
  public fabIcon = "menu-outline"
  public component!: any
  public formTitle?: string
  public btnDisabled: boolean = false
  public selectedChip = 0

  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;
  @ViewChild(IonSlides) slider!: IonSlides;
  @ViewChild('FormComponentRef', { read: ViewContainerRef, static: true }) public formRef!: ViewContainerRef


  columnDefs: ColDef[] = [
    {
      field: 'nome',
      floatingFilter: true
    },
    {
      field: 'sexo',
      filter: false,
      maxWidth: 90
    },
    {
      field: 'morada',
      floatingFilter: true
    },
    {
      field: 'nascimento',
      floatingFilter: true,
      cellRenderer: (params: any) => {
        return params.value != ('' || undefined) ? moment(params.value).format('DD/MM/YYYY') : ''
      }
    },
    {
      field: 'telemóvel',
      floatingFilter: true
    },
    {
      field: 'instagram',
      floatingFilter: true
    },
    {
      field: 'facebook',
      floatingFilter: true
    },
  ]

  defaultColDef: ColDef = {
    flex: 1,
    resizable: true,
    sortable: true,
    filter: true,
    editable: false,
    cellClass: 'not-selectable'
  }

  constructor(public api: APIService, public _dialog: MatDialog) { }

  ngAfterViewInit(): void {
    this.slider.lockSwipes(true)
  }

  async loadContent() {
    this.slider.lockSwipes(true)
    this.selectedRow = { nome: '<vazio>' }
    this.agGrid.api.showLoadingOverlay()

    if (this.selectedChip == 0) {
      this.api.getActiveClients().subscribe((wrapper) => {
        this.clientData = wrapper
        const presenterData = this.formatData(wrapper)
        this.agGrid.api.setRowData(presenterData)
        this.agGrid.api.hideOverlay()
      });
    } else {
      this.api.getDeletedClients().subscribe((wrapper) => {
        this.clientData = wrapper
        const presenterData = this.formatData(wrapper)
        this.agGrid.api.setRowData(presenterData)
        this.agGrid.api.hideOverlay()
      });
    }
  }

  onGridReady(params: GridReadyEvent) {
    if (this.selectedChip == 0) {
      this.api.getActiveClients().subscribe((wrapper) => {
        this.clientData = wrapper
        const presenterData = this.formatData(wrapper)
        this.agGrid.api.setRowData(presenterData)
      });
    } else {
      this.api.getDeletedClients().subscribe((wrapper) => {
        this.clientData = wrapper
        const presenterData = this.formatData(wrapper)
        this.agGrid.api.setRowData(presenterData)
      });
    }
  }

  onRowClicked(event: RowClickedEvent) {
    if (this.selectedChip == 0) { this.selectedRow = event.data }
  }

  slideToCreate() {
    if (this.component != undefined) { this.formRef.remove() }
    this.formTitle = 'Criar Cliente'

    this.component = this.formRef.createComponent(DesktopCreateEditClientModalComponent).instance
    this.component.type = "create"

    this.slider.lockSwipes(false)
    this.slider.slideNext()
    this.slider.lockSwipes(true)
  }

  chip(chipnr: number) {
    if (chipnr != this.selectedChip) { this.switchChip(chipnr) }
  }

  switchChip(chip: number) {
    this.selectedChip = chip
    this.selectedRow = { nome: '<vazio>' }
    this.btnDisabled = true
    this.agGrid.api.showLoadingOverlay()

    if (this.selectedChip == 0) {
      this.api.getActiveClients().subscribe((wrapper) => {
        this.clientData = wrapper
        const presenterData = this.formatData(wrapper)
        this.agGrid.api.setRowData(presenterData)
        this.agGrid.api.hideOverlay()
        this.btnDisabled = false
      });
    } else {
      this.api.getDeletedClients().subscribe((wrapper) => {
        this.clientData = wrapper
        const presenterData = this.formatData(wrapper)
        this.agGrid.api.setRowData(presenterData)
        this.agGrid.api.hideOverlay()
        this.btnDisabled = false
      });
    }
  }

  promptDeleteClient() {
    const deleteDiagRef = this._dialog.open(DeleteDialog, {
      data: {
        header: 'A eliminar cliente',
        prompt: 'Deseja eliminar este cliente?',
        name: this.selectedRow.nome
      }
    });

    deleteDiagRef.afterClosed().subscribe(() => {
      if (deleteDiagRef.componentInstance.diagData.response) {
        this.deleteClient()
      }
    })
  }


  deleteClient() {
    this.btnDisabled = true
    this.agGrid.api.showLoadingOverlay()

    this.api.deleteClient(this.selectedRow.id).subscribe((wrapper) => { this.btnDisabled = false; this.agGrid.api.hideOverlay(); this.loadContent() })
  }

  slideToEdit() {
    if (this.component != undefined) { this.formRef.remove() }
    this.formTitle = 'Editar Cliente'

    this.component = this.formRef.createComponent(DesktopCreateEditClientModalComponent).instance


    this.component.model = {
      id: this.selectedRow.id,
      name: this.selectedRow.nome,
      phonenumber: this.selectedRow.telemóvel,
      sex: this.selectedRow.sexo,
      address: this.selectedRow.morada,
      birthdate: this.selectedRow.nascimento,
      facebook: this.selectedRow.facebook,
      instagram: this.selectedRow.instagram
    }

    this.component.type = "edit"

    this.slider.lockSwipes(false)
    this.slider.slideNext()
    this.slider.lockSwipes(true)
  }

  async return() {
    this.slider.lockSwipes(false)
    this.slider.slidePrev()
    this.slider.lockSwipes(true)
    await this.loadContent()
  }

  formatData(wrapper: ClientWrapper): any[] {
    let data: any[] = []

    wrapper.data.forEach(client => {
      data.push(
        {
          id: client.id,
          nome: client.name,
          sexo: client.sex,
          morada: client.address /*!= (null || '' || undefined) ? client.address : '<não específicado>'*/,
          nascimento: client.birthdate /*!= (null || '') ? moment(client.birthdate).format('DD/MM/YYYY') : ''*/,
          telemóvel: client.phonenumber /*!= (null || '') ? client.phonenumber : '<não específicado>'*/,
          instagram: client.instagram /*!= (null || '') ? client.instagram : '<não específicado>'*/,
          facebook: client.facebook /*!= (null || '') ? client.facebook : '<não específicado>'*/
        }
      )
    });

    return data
  }
}

interface DeleteDialogData {
  header: string
  prompt: string
  name: string
  response: boolean
}

@Component({
  selector: 'delete-client-dialog',
  templateUrl: 'delete-client.dialog.html',
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