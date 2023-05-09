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
import { CalendarEvent } from 'src/app/models/CalendarEvent';
import { DesktopViewEventModalComponent } from 'src/app/modals/desktop-view-event-modal/desktop-view-event-modal.component';
import { Client } from 'src/app/models/Client';
import { Label } from 'src/app/models/Label';
import { Service } from 'src/app/models/Service';
import * as jQuery from 'jquery';
import { DesktopManageWorkersModalComponent } from 'src/app/modals/desktop-manage-workers-modal/desktop-manage-workers-modal.component';
const moment = require('moment');

export type MockupEvent = {
  evt_id: number
  evt_client_id: number
  evt_title: string,
  evt_start: Date,
  evt_end: Date,
  evt_client: Client,
  evt_label_id: number,
  evt_label: Label,
  evt_duration: number,
  evt_services: Service[],
  evt_commment: string | null,
  evt_created_at: Date | null,
  evt_updated_at: Date | null,
  evt_is_predefined: boolean
}

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
    eventClick: (data) => { this._dialog.open(DesktopViewEventModalComponent, { data: { event: { ...data.event.extendedProps }, title: `${Default_PT.VISUALIZE_EVENT} - ${moment(data.event.extendedProps['evt_start']).format('DD/MM/YYYY')} - ${data.event.extendedProps['evt_client']}` } }) }
  }


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

      let evtDuration = this.calculateEventDuration(event)

      this.loadedEvents.push({
        id: event.id,
        title: event.name,
        start: event.time,
        color: event.label!.color_hex_value,
        end: evtDuration[1],
        extendedProps: {
          evt_id: event.id,
          evt_client_id: event.client!.id,
          evt_title: event.name,
          evt_start: event.time,
          evt_end: evtDuration[1],
          evt_client: event.client!.name,
          evt_label_id: event.label!.id,
          evt_label: event.label!.name,
          evt_duration: evtDuration[0],
          evt_services: event.services!,
          evt_commment: event.comment,
          evt_created_at: moment(event.created_at).format('DD-MM-YYYY HH:mm:ss'),
          evt_updated_at: moment(event.updated_at).format('DD-MM-YYYY HH:mm:ss'),
          evt_is_predefined: false
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

  calculateEventDuration(event: CalendarEvent): [number, Date] {
    let finalTime = null
    let duration: number = 0
    event.services!.forEach((service) => {
      duration += service.duration!
    })

    finalTime = new Date(event.time!)
    finalTime.setHours(finalTime.getHours() + Math.floor(duration / 60));
    finalTime.setMinutes(finalTime.getMinutes() + (duration % 60));

    return [duration, moment(finalTime).format('YYYY-MM-DD HH:mm:ss')]
  }

  makeProperEvent(event: MockupEvent): CalendarEvent {
    return {
      id: event.evt_id,
      name: event.evt_title,
      time: event.evt_start.toString(),
      label: event.evt_label,
      client: event.evt_client,
      comment: jQuery.isEmptyObject(event.evt_commment) ? '' : event.evt_commment!,
      services: event.evt_services,
      created_at: jQuery.isEmptyObject(event.evt_created_at) ? '' : event.evt_created_at?.toString(),
      updated_at: jQuery.isEmptyObject(event.evt_updated_at) ? '' : event.evt_updated_at?.toString(),
    }
  }

  defaultMenus() {
    this.menuToggles = { ... this.defaultToggles }
  }


  manageWorkers() {
    this._dialog.open(DesktopManageWorkersModalComponent)
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
