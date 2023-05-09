import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';
import { Default_PT } from 'src/app/defaults/langs/pt-pt/Defaults';
import { APIService } from 'src/app/services/api/api.service';

@Component({
  selector: 'app-mobile-manage-workers-modal',
  templateUrl: './mobile-manage-workers-modal.component.html',
  styleUrls: ['./mobile-manage-workers-modal.component.scss'],
})
export class MobileManageWorkersModalComponent implements OnInit {
  public componentTitle = Default_PT.MANAGE_WORKERS
  public AG_GRID_PT_LANG = Default_PT.AG_GRID_LOCALE_PT
  public processing = false

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
    filter: true
  },
  {
    field: 'hex_color_value',
    headerName: Default_PT.COLOR,
    width: 30,
    cellRenderer: (data: any) => {
      console.log(data.value)
      return `
      <div class="w-full h-full flex items-center justify-center">
        <div style="background-color: ${data.value};" class="w-[16px] h-[16px] rounded-full border border-gray-500"> </div>
      </div>
      `}
  },
  {
    field: 'assoc_calendars',
    headerName: Default_PT.CALENDARS,
    cellRenderer: (data: any) => {

      let renderCells: string[] = []

      data.value.forEach((value: any) => {
        switch (value.id) {
          case 1:
            renderCells.push(`
            <ion-icon name="man-outline" class="text-xl p-1 bg-blue-500 text-white border-gray-300 rounded-lg border shrink-0"> </ion-icon>
            `)
            break;
          case 2:
            renderCells.push(`
            <ion-icon name="woman-outline" class="text-xl p-1 bg-pink-500 text-white border-gray-300 rounded-lg border shrink-0"> </ion-icon>
            `)
            break;
          case 3:
            renderCells.push(`
            <ion-icon name="color-fill-outline" class="text-xl p-1 bg-green-500 text-white border-gray-300 rounded-lg border shrink-0"> </ion-icon>
            `)
            break;
          case 4:
            renderCells.push(`
            <ion-icon name="flash-outline" class="text-xl p-1 bg-yellow-500 text-white border-gray-300 rounded-lg border shrink-0"> </ion-icon>
            `)
            break;
        }
      })


      let renderedHTML = `
      <div class="w-full h-full flex items-center justify-center gap-1">
      ${renderCells.join('')}
      </div>
      `
      return renderedHTML
    }
  },
  {
    field: 'ações',
    headerName: Default_PT.ACTIONS,
    cellRendererSelector: (params: any) => {
      return { component: null }
    }
  }]

  constructor(public api: APIService, public modalController: ModalController) { }

  ngOnInit() { }

  onGridReady() {
    this.processing = true
    this.agGrid.api.showLoadingOverlay()

    this.api.getLabels().subscribe((wrapper) => {
      this.agGrid.api.setRowData(wrapper.data)
      this.agGrid.api.hideOverlay()
      this.processing = false
    });
  }
}
