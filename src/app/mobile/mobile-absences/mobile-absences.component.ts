import { CdkDrag } from '@angular/cdk/drag-drop';
import { Component, ViewChild } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';
import { Default_PT } from 'src/app/defaults/langs/pt-pt/Defaults';
import { AgGridUsable } from 'src/app/interfaces/Loadable';
import { InfoSnackBarComponent } from 'src/app/partials/info-snack/info-snack.component';
import { APIService } from 'src/app/services/api/api.service';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-mobile-absences',
  templateUrl: './mobile-absences.component.html',
  styleUrls: ['./mobile-absences.component.scss'],
})
export class MobileAbsencesComponent implements AgGridUsable {
  public menuSelectedBtn: 1 | 2 = 1
  public processing = false
  public optionsEye = false

  public selectedOption: any

  public AG_GRID_PT_LANG = Default_PT.AG_GRID_LOCALE_PT
  public pageTitle = Default_PT.ABSENCES_PAGE_TITLE
  public isSmallScreen = window.matchMedia("(max-width: 600px)").matches;

  public xAxisOpener = 'start'
  public yAxisOpener = 'top'

  @ViewChild(CdkDrag) dragRef!: CdkDrag;

  public absenceIcons = {
    1: 'airplane-outline',
    2: 'calendar-number-outline',
  }
  public absenceIcon = this.absenceIcons[`${this.menuSelectedBtn}`]

  public eyeStates = {
    active: { icon: 'eye-off-outline', tooltip: Default_PT.HIDE_FLOATING_MENU, status: false },
    inactive: { icon: 'eye-outline', tooltip: Default_PT.SHOW_FLOATING_MENU, status: true }
  }

  public currEyeState = this.eyeStates.inactive
  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;


  public defs = {
    1: [
      {
        field: 'title',
        cellClass: '!text-xs sm:text-md flex items-center justify-start break-words p-2',
        headerName: Default_PT.TITLE,
        floatingFilter: true
      },
      {
        field: 'init_interval',
        cellClass: '!text-xs sm:text-md flex items-center justify-start break-words p-2',
        headerName: Default_PT.INIT_INTERVAL,
        floatingFilter: true
      },
      {
        field: 'close_interval',
        cellClass: '!text-xs sm:text-md flex items-center justify-start break-words p-2',
        headerName: Default_PT.CLOSE_INTERVAL,
        floatingFilter: true
      },
      {
        field: 'worker',
        cellClass: '!text-xs sm:text-md flex items-center justify-start break-words p-2',
        headerName: Default_PT.WORKER,
        floatingFilter: true
      },
      {
        field: 'reason',
        cellClass: '!text-xs sm:text-md flex items-center justify-start break-words p-2',
        headerName: Default_PT.REASON,
        floatingFilter: true, 
        sortable: false,
        filter: false,
      },
    ],
    2: [
      {
        field: 'name',
        cellClass: '!text-xs sm:text-md flex items-center justify-start break-words p-2',
        headerName: Default_PT.TITLE,
        floatingFilter: true
      },
      {
        field: 'date',
        cellClass: '!text-xs sm:text-md flex items-center justify-start break-words p-2',
        headerName: Default_PT.DATE,
        floatingFilter: true
      },
      {
        field: 'init_interval',
        cellClass: '!text-xs sm:text-md flex items-center justify-start break-words p-2',
        headerName: Default_PT.INIT_INTERVAL,
        floatingFilter: true
      },
      {
        field: 'close_interval',
        cellClass: '!text-xs sm:text-md flex items-center justify-start break-words p-2',
        headerName: Default_PT.CLOSE_INTERVAL,
        floatingFilter: true
      },
    ]
  }
  public columnDefs: ColDef[] = cloneDeep(this.defs[`${this.menuSelectedBtn}`])

  public defaultColDef: ColDef = {
    flex: 1,
    resizable: true,
    sortable: true,
    filter: true,
    editable: false,
    onCellClicked: (cell) => { this.selectedOption = cell.data }
  }

  constructor(public api: APIService, public _snackBar: MatSnackBar) { }

  loadContent(): void {
    this.onGridReady()
  }

  async onGridReady() {
    this.menuSelectedBtn == 1 ? this.loadAbsences() : this.loadHolidays()
  }


  loadAbsences() {
    this.processing = true
    this.agGrid.api.showLoadingOverlay()

    this.columnDefs = cloneDeep(this.defs[`${this.menuSelectedBtn}`])

    // this.api.getActiveClients().subscribe((wrapper) => {
    //   const presenterData = this.formatData(wrapper)
    //   this.agGrid.api.setRowData(presenterData)
    //   this.agGrid.api.hideOverlay()
    //   this.processing = false
    // });


    this.processing = false
  }

  loadHolidays() {
    this.processing = true
    this.agGrid.api.showLoadingOverlay()

    this.columnDefs = cloneDeep(this.defs[`${this.menuSelectedBtn}`])

    // this.api.getActiveClients().subscribe((wrapper) => {
    //   const presenterData = this.formatData(wrapper)
    //   this.agGrid.api.setRowData(presenterData)
    //   this.agGrid.api.hideOverlay()
    //   this.processing = false
    // });


    this.processing = false
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


  switchMenuBtn(id: 1 | 2, force?: boolean) {
    if (id != this.menuSelectedBtn || force) {
      this.dragRef.reset()
      this.menuSelectedBtn = id
      this.absenceIcon = this.absenceIcon[`${this.menuSelectedBtn}`]
      this.selectedOption = undefined
      this.onGridReady()
    }
  }

  openInfoSnackBar(content: string, btnContent: string) {
    const config = new MatSnackBarConfig();
    config.data = { content: content, btnContent: btnContent, duration: 3000 };
    this._snackBar.openFromComponent(InfoSnackBarComponent, config);
  }
}
