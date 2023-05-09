import { AfterViewInit, Component, ViewChild, ViewContainerRef } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import langPT from '@fullcalendar/core/locales/pt';
import { APIService } from 'src/app/services/api/api.service';
import { CalendarEventWrapper } from 'src/app/models/CalendarEventWrapper';
import { FCalendarUsable } from 'src/app/interfaces/Loadable';
import { Default_PT } from 'src/app/defaults/langs/pt-pt/Defaults';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { InfoSnackBarComponent } from 'src/app/partials/info-snack/info-snack.component';
import { ModalController, NavController } from '@ionic/angular';
import { MobileCreateEditEventModalComponent } from 'src/app/modals/mobile-create-edit-event-modal/mobile-create-edit-event-modal.component';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { CalendarEvent } from 'src/app/models/CalendarEvent';
import { MockupEvent } from 'src/app/desktop/desktop-home/desktop-home.component';
import { MobileViewEventModalComponent } from 'src/app/modals/mobile-view-event-modal/mobile-view-event-modal.component';
import { MobileManageWorkersModalComponent } from 'src/app/modals/mobile-manage-workers-modal/mobile-manage-workers-modal.component';

const moment = require('moment');

@Component({
  selector: 'app-mobile-home',
  templateUrl: './mobile-home.component.html',
  styleUrls: ['./mobile-home.component.scss'],
})
export class MobileHomeComponent implements FCalendarUsable, AfterViewInit {
  public menuSelectedBtn: 1 | 2 | 3 | 4 = 1
  public pageTitle: string = Default_PT.CALENDAR_PAGE_TITLE
  public currentSnackBarRef: any;
  public events!: CalendarEventWrapper
  public isSmallScreen = window.matchMedia("(max-width: 600px)").matches;
  public loadedEvents!: any[]
  public optionsEye = false
  public processing = false
  public xAxisOpener = 'start'
  public yAxisOpener = 'top'

  @ViewChild(CdkDrag) dragRef!: CdkDrag;


  public overlay = {
    title: Default_PT.CALENDAR_LOADING_TITLE,
    desc: Default_PT.CALENDAR_LOADING_DESC
  }

  public calendarIcons = {
    1: 'man-outline',
    2: 'woman-outline',
    3: 'color-fill-outline',
    4: 'flash-outline'
  }
  public calendarIcon = this.calendarIcons[`${this.menuSelectedBtn}`]

  public eyeStates = {
    active: { icon: 'eye-off-outline', tooltip: Default_PT.HIDE_FLOATING_MENU, status: false },
    inactive: { icon: 'eye-outline', tooltip: Default_PT.SHOW_FLOATING_MENU, status: true }
  }

  public currEyeState = this.eyeStates.inactive

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
    dateClick: async (data) => { await this.openCEModal(data) },
    eventClick: async (data) => {
      const evt: MockupEvent = { ...data.event.extendedProps } as MockupEvent
      await this.openViewModal(evt)
    }
  };

  constructor(public _dialog: MatDialog,
    public api: APIService,
    private _snackBar: MatSnackBar,
    private modalController: ModalController) {
    this.setupCalendar();
  }

  ngAfterViewInit(): void {
    window.dispatchEvent(new Event('resize'))
  }

  async setupCalendar() {

    this.processing = true

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

  calculateEventDuration(event: CalendarEvent): [number, Date] {
    let finalTime = null
    let duration: number = 0
    event.services!.forEach((service) => {
      duration += Number.parseFloat(service.duration! as unknown as string)
    })

    finalTime = new Date(event.time!)
    finalTime.setHours(finalTime.getHours() + Math.floor(duration / 60));
    finalTime.setMinutes(finalTime.getMinutes() + (duration % 60));

    return [duration, finalTime]
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


  switchMenuBtn(id: 1 | 2 | 3 | 4, force?: boolean) {
    if (id != this.menuSelectedBtn || force) {
      this.dragRef.reset()
      this.menuSelectedBtn = id
      this.calendarIcon = this.calendarIcons[`${this.menuSelectedBtn}`]
      this.setupCalendar()
    }
  }

  triggerOptionsBtn() {
    if (this.currEyeState.status) {
      this.currEyeState = this.eyeStates.active
      this.dragRef.reset()
    }
    else { this.currEyeState = this.eyeStates.inactive }
  }

  fabMoving(event: any) {
    if (event.pointerPosition.x > window.innerWidth / 2) {
      this.xAxisOpener = 'start'
    } else { this.xAxisOpener = 'end' }

    if (event.pointerPosition.y > window.innerHeight / 2) {
      this.yAxisOpener = 'top'
    } else { this.yAxisOpener = 'bottom' }
  }


  async openCEModal(eventData: any) {
    const modal = await this.modalController.create({
      component: MobileCreateEditEventModalComponent,
      componentProps: {
        calendarID: this.menuSelectedBtn,
        date: eventData.dateStr,
        title: `${Default_PT.CREATE_EVENT} - ${moment(eventData.dateStr).format('DD/MM/YYYY')}`,
      }
    });

    await modal.present();
  }

  async openViewModal(evt: MockupEvent) {

    const modal = await this.modalController.create({
      component: MobileViewEventModalComponent,
      mode: 'ios',
      backdropDismiss: true,
      showBackdrop: true,
      componentProps: {
        event: evt,
        title: `${Default_PT.VISUALIZE_EVENT} - ${moment(evt.evt_start).format('DD/MM/YYYY')} - ${evt.evt_client}`
      }
    });

    await modal.present();
  }

  async manageWorkers() {
    const modal = await this.modalController.create({
      component: MobileManageWorkersModalComponent,
      mode: 'ios',
      backdropDismiss: true,
      showBackdrop: true,
    });

    await modal.present();
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