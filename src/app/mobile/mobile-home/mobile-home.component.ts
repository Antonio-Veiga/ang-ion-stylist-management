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
import { MatSnackBar, MatSnackBarConfig, MatSnackBarRef } from '@angular/material/snack-bar';
import { InfoSnackBarComponent } from 'src/app/partials/info-snack/info-snack.component';
import { IonFab, IonModal, LoadingController, ModalController } from '@ionic/angular';
import { MobileCreateEditEventModalComponent } from 'src/app/modals/mobile-create-edit-event-modal/mobile-create-edit-event-modal.component';
import { CdkDrag } from '@angular/cdk/drag-drop';

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
    eventClick: (data) => { }
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