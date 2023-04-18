import { AfterViewInit, Component, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import langPT from '@fullcalendar/core/locales/pt';
import { APIService } from 'src/app/services/api/api.service';
import { CalendarEventWrapper } from 'src/app/models/CalendarEventWrapper';
import { FCalendarUsable } from 'src/app/interfaces/Loadable';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { Default_PT } from 'src/app/defaults/langs/pt-pt/Defaults';
import { MatDrawer, MatDrawerMode } from '@angular/material/sidenav';
import { MatDialog } from '@angular/material/dialog';
import { DesktopCreateEditEventModalComponent } from 'src/app/modals/desktop-create-edit-event-modal/desktop-create-edit-event-modal.component';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarRef } from '@angular/material/snack-bar';
import { InfoSnackBarComponent } from 'src/app/partials/info-snack/info-snack.component';

const moment = require('moment');

@Component({
  selector: 'app-desktop-home',
  templateUrl: './desktop-home.component.html',
  styleUrls: ['./desktop-home.component.scss'],
})
export class DesktopHomeComponent implements FCalendarUsable, AfterViewInit {
  public menuSelectedBtn: 1 | 2 | 3 | 4 = 1
  public toggle = { icon: 'menu', tooltip: Default_PT.OPEN_SIDE_MENU_TOOLTIP }
  public settings = { icon: 'settings-outline', tooltip: Default_PT.OPEN_SETTINGS_DROPDOWN }
  public currentSnackBarRef: MatSnackBarRef<InfoSnackBarComponent> | undefined

  public menuToggles = {
    1: Default_PT.CALENDAR_1,
    2: Default_PT.CALENDAR_2,
    3: Default_PT.CALENDAR_3,
    4: Default_PT.CALENDAR_4
  }

  public defaultToggles = { ... this.menuToggles }

  public processing = false
  public drawerAction: MatDrawerMode = window.innerWidth >= 1366 ? 'side' : 'over'
  public events!: CalendarEventWrapper
  public loadedEvents!: any[]

  @ViewChild('drawer') drawer!: MatDrawer;
  @ViewChild('fCalendar') public fCalendar!: FullCalendarComponent

  public overlay = {
    title: Default_PT.CALENDAR_LOADING_TITLE,
    desc: Default_PT.CALENDAR_LOADING_DESC
  }

  public calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    headerToolbar: {
      start: 'prev,next today',
      center: 'title',
      end: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    initialView: 'dayGridMonth',
    locales: [langPT],
    locale: 'pt',
    weekends: true,
    longPressDelay: 0,
    selectable: true,
    dayMaxEventRows: 2,
    eventTimeFormat: {
      hour: 'numeric',
      minute: '2-digit',
      meridiem: false
    },
    slotMinTime: '07:00:00',
    slotMaxTime: '21:00:00',
    slotLabelFormat: {
      hour: 'numeric',
      minute: '2-digit',
      omitZeroMinute: false,
      meridiem: 'short'
    },
    handleWindowResize: true,
    dateClick: (data) => { this._dialog.open(DesktopCreateEditEventModalComponent, { data: { date: data.dateStr, calendarID: this.menuSelectedBtn, title: `${Default_PT.CREATE_EVENT} - ${moment(data.dateStr).format('DD/MM/YYYY')}` } }) },
    eventClick: (data) => { }
  };


  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (event.target.innerWidth >= 1366) { this.drawerAction = 'side' } else { this.drawerAction = 'over' }
  }

  constructor(public api: APIService, public _dialog: MatDialog, private _snackBar: MatSnackBar) {
    this.setupCalendar();
  }

  ngAfterViewInit(): void {
    this.drawer.openedChange.subscribe((opened) => {
      if (opened) { this.toggle.icon = "exit"; this.toggle.tooltip = Default_PT.CLOSE_SIDE_MENU_TOOLTIP } else { this.toggle.icon = "menu"; this.toggle.tooltip = Default_PT.OPEN_SIDE_MENU_TOOLTIP }
      window.dispatchEvent(new Event('resize'))
    });
  }

  async setupCalendar() {
    this.processing = true;

    this.api.getEvents(this.menuSelectedBtn).subscribe((data) => {
      this.events = data
      this.makeCalendar()
    }, (error) => {
      this.openInfoSnackBar(error, 'recarregar', false, true)
    })
  }

  makeCalendar() {
    this.loadedEvents = []

    this.events.data.forEach((event) => {
      const finalTime = new Date(event.time!)
      finalTime.setHours(finalTime.getHours() + Math.floor(event.duration! / 60));
      finalTime.setMinutes(finalTime.getMinutes() + (event.duration! % 60));

      this.loadedEvents.push({
        id: event.id,
        title: event.name,
        start: event.time,
        end: finalTime,
        extendedProps: {
          title: event.id,
          client_id: event.client!.id,
          client: event.client!.name,
          label_id: event.label!.id,
          label: event.label!.name,
          duration: event.duration,
          service_id: event.service == null ? null : event.service.id,
          service: event.service == null ? null : event.service.name,
          predefined: false
        }
      })
    })

    window.dispatchEvent(new Event('resize'))
    this.processing = false;
  }


  switchMenuBtn(id: 1 | 2 | 3 | 4, force?: boolean) {
    if (id != this.menuSelectedBtn || force) {
      this.menuSelectedBtn = id

      this.defaultMenus()
      this.setupCalendar()

      this.menuToggles[id] = Default_PT[`CALENDAR_${id}_ACTIVE`]
    }
  }

  createPredefinedEvent() {

  }

  defaultMenus() {
    this.menuToggles = { ... this.defaultToggles }
  }

  openInfoSnackBar(content: string, btnContent: string, duration?: boolean, afterDismissedFn?: boolean) {
    const config = new MatSnackBarConfig();
    config.data = { content: content, btnContent: btnContent };

    if (duration) {
      config.data.duration = 3000
    }

    this.currentSnackBarRef = this._snackBar.openFromComponent(InfoSnackBarComponent, config)

    if (afterDismissedFn) {
      this.currentSnackBarRef.onAction().subscribe(async () => { await this.setupCalendar() });
    }
  }
}
