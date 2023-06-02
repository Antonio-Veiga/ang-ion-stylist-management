import { Component, ViewChild } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import langPT from '@fullcalendar/core/locales/pt';
import { APIService } from 'src/app/services/api/api.service';
import { FCalendarUsable } from 'src/app/interfaces/Loadable';
import { Default_PT } from 'src/app/defaults/langs/pt-pt/Defaults';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { InfoSnackBarComponent } from 'src/app/partials/info-snack/info-snack.component';
import { AlertController, ModalController } from '@ionic/angular';
import { MobileCreateEditEventModalComponent } from 'src/app/modals/mobile-create-edit-event-modal/mobile-create-edit-event-modal.component';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { MockupEvent } from 'src/app/desktop/desktop-home/desktop-home.component';
import { MobileViewEventModalComponent } from 'src/app/modals/mobile-view-event-modal/mobile-view-event-modal.component';
import { MobileManageWorkersModalComponent } from 'src/app/modals/mobile-manage-workers-modal/mobile-manage-workers-modal.component';
import { MobileCreateEditPredefinedEventModalComponent } from 'src/app/modals/mobile-create-edit-predefined-event-modal/mobile-create-edit-predefined-event-modal.component';
import { GenericCalendarEventWrapper } from 'src/app/models/GenericCalendarEventWrapper';
import { GenericCalendarEvent } from 'src/app/models/GenericCalendarEvent';
import { cloneDeep, isEmpty } from 'lodash';
import { HolidayWrapper } from 'src/app/models/HolidayWrapper';
import { MobileManageFormTreatmentManipulationComponent } from 'src/app/modals/mobile-manage-form-treatment-manipulation/mobile-manage-form-treatment-manipulation.component';
import { Client } from 'src/app/models/Client';
import { Form } from 'src/app/models/Form';
import { MobileFillFormComponent } from 'src/app/modals/mobile-fill-form/mobile-fill-form.component';

const moment = require('moment');

@Component({
  selector: 'app-mobile-home',
  templateUrl: './mobile-home.component.html',
  styleUrls: ['./mobile-home.component.scss'],
})
export class MobileHomeComponent implements FCalendarUsable {
  public menuSelectedBtn: 1 | 2 | 3 | 4 = 1
  public pageTitle: string = Default_PT.CALENDAR_PAGE_TITLE
  public currentSnackBarRef: any;
  public events!: GenericCalendarEventWrapper
  public holidays?: HolidayWrapper
  public isSmallScreen = window.matchMedia("(max-width: 600px)").matches;
  public loadedEvents!: any[]
  public eventsWithForms: any[] = []
  public optionsEye = false
  public processing = false
  public xAxisOpener = 'start'
  public yAxisOpener = 'top'

  public emptyForms: any[] = []

  public futureDates: { [key: string]: string[] } = {
    '0': [],
    '1': [],
    '2': [],
    '3': [],
    '4': [],
    '5': [],
    '6': []
  }

  public currEventId = 1;

  @ViewChild(CdkDrag) dragRef!: CdkDrag;

  public overlay = {
    title: Default_PT.CALENDAR_LOADING_TITLE,
    desc: Default_PT.CALENDAR_LOADING_DESC
  }

  public calendarIcons = {
    1: 'man-outline',
    2: 'woman-outline',
    3: 'flash-outline',
    4: 'color-fill-outline'
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
    allDayText: '',
    selectable: true,
    dayMaxEventRows: 2,
    eventTimeFormat: {
      hour: 'numeric',
      minute: '2-digit',
      meridiem: false
    },
    slotMinTime: '07:00:00',
    slotMaxTime: '21:00:00',
    slotDuration: '00:15:00',
    slotLabelFormat: {
      hour: 'numeric',
      minute: '2-digit',
      omitZeroMinute: false,
      meridiem: 'short'
    },
    handleWindowResize: true,
    dateClick: async (data) => { await this.openCEModal(data) },
    eventClick: async (data) => {
      if (data.event.extendedProps['isEvent']) {
        const evt: MockupEvent = { ...data.event.extendedProps } as MockupEvent
        await this.openViewModal(evt)
      } else {
        this.showRestriction(data)
      }
    }
  };

  constructor(public _dialog: MatDialog,
    public api: APIService,
    private _snackBar: MatSnackBar,
    private modalController: ModalController,
    private alertController: AlertController) {
    this.setupCalendar();
  }

  addHolidayDisplay() {
    return new Promise((resolve, reject) => {
      const currentDate = new Date();

      const twoMonthsAgo = new Date(currentDate);
      twoMonthsAgo.setMonth(currentDate.getMonth() - 2);
      const twoMonthsAgoMillis = twoMonthsAgo.getTime();

      const twoMonthsFromNow = new Date(currentDate);
      twoMonthsFromNow.setMonth(currentDate.getMonth() + 2);
      const twoMonthsFromNowMillis = twoMonthsFromNow.getTime();

      this.api.getHolidays(twoMonthsAgoMillis, twoMonthsFromNowMillis).subscribe((holidays) => {
        this.holidays = holidays
        resolve(true)
      })
    })
  }


  async showRestriction(data: any) {
    const alert = await this.alertController.create({
      header: `${data.event.title}`,
      message: `Deseja adicionar restrições para o dia do feriado?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Criar',
          handler: () => {
            // Lógica para criar a restrição do feriado
            console.log('Restrição criada para o feriado:', data.event.title);
          }
        }
      ]
    });

    await alert.present();
  }

  async setupCalendar() {
    this.processing = true

    // await this.addHolidayDisplay()

    this.api.getAllEvents(this.menuSelectedBtn).subscribe((data) => {
      this.events = data
      this.makeCalendar()
    }, (error) => {
      this.openInfoSnackBar(error, 'recarregar', false, true)
    })
  }

  async makeCalendar() {
    this.eventsWithForms = []
    this.loadedEvents = []

    if (!isEmpty(this.holidays)) {
      this.holidays.data.forEach((holiday) => {
        let holidayEvent = {
          id: this.currEventId,
          title: holiday.name,
          start: holiday.date,
          allDay: true,
          color: "#000000",
          extendedProps: {
            isEvent: false
          }
        }

        this.loadedEvents.push(holidayEvent)
        this.currEventId++
      })
    }

    this.events.data.forEach((event) => {
      if (event.isPredefined) {
        let loadEvents = this.makeEvents(event)

        loadEvents.forEach((fullCalendarEvent) => {
          this.loadedEvents.push(fullCalendarEvent)
          this.currEventId++;
        })
      } else {
        let evtDuration = this.calculateEventDuration(event)

        let fullCalendarEvent = {
          id: this.currEventId,
          title: event.title,
          start: event.time,
          color: event.label!.color_hex_value,
          end: evtDuration[1],
          extendedProps: {
            evt_id: event.id,
            evt_client_id: event.client!.id,
            evt_title: event.title,
            evt_start: event.time,
            evt_end: evtDuration[1],
            evt_client: event.client!.name,
            evt_label_id: event.label!.id,
            evt_label: event.label!.name,
            evt_duration: evtDuration[0],
            evt_comment: event.comment,
            evt_services: event.services!,
            evt_forms: event.forms,
            evt_created_at: moment(event.created_at).format('DD-MM-YYYY HH:mm:ss'),
            evt_updated_at: moment(event.updated_at).format('DD-MM-YYYY HH:mm:ss'),
            evt_is_predefined: false,
            isEvent: true
          }
        }

        if (!isEmpty(event.forms)) {
          this.eventsWithForms.push(cloneDeep(fullCalendarEvent.extendedProps))
        }

        this.loadedEvents.push(fullCalendarEvent)
        this.currEventId++;
      }
    })

    this.checkOpenForms()
    setInterval(() => { this.checkOpenForms() }, 60000)

    window.dispatchEvent(new Event('resize'))
    this.processing = false;
  }

  calculateEventDuration(event: GenericCalendarEvent, date?: string): [number, Date] {
    let finalTime = null
    let duration: number = 0

    event.services!.forEach((service) => {
      duration += Number.parseFloat(service.duration! as unknown as string)
    })

    if (date) { finalTime = new Date(date) } else { finalTime = new Date(event.time!) }
    finalTime.setHours(finalTime.getHours() + Math.floor(duration / 60))
    finalTime.setMinutes(finalTime.getMinutes() + (duration % 60))

    return [duration, moment(finalTime).format('YYYY-MM-DD HH:mm:ss')]
  }

  makeEvents(event: GenericCalendarEvent): any[] {
    let events: any[] = []

    // always has day_id because it's a predefined event
    let dow = event.day_id!

    if (isEmpty(this.futureDates[`${dow}`])) {
      this.futureDates[`${dow}`] = this.getFutureDates(event.day_id!)
    }

    let dates = this.futureDates[`${dow}`]

    dates.forEach((date) => {

      if (this.validateRestricitons(event, date)) {

        let evtDuration = this.calculateEventDuration(event, `${date} ${event.time}`)

        events.push({
          id: this.currEventId,
          title: event.title,
          start: `${date} ${event.time}`,
          color: event.label!.color_hex_value,
          end: evtDuration[1],
          extendedProps: {
            evt_id: event.id,
            evt_client_id: event.client!.id,
            evt_title: event.title,
            evt_start: `${date} ${event.time}`,
            evt_end: evtDuration[1],
            evt_day_id: event.day_id,
            evt_client: event.client!.name,
            evt_label_id: event.label!.id,
            evt_label: event.label!.name,
            evt_duration: evtDuration[0],
            evt_services: event.services!,
            evt_created_at: moment(event.created_at).format('DD-MM-YYYY HH:mm:ss'),
            evt_updated_at: moment(event.updated_at).format('DD-MM-YYYY HH:mm:ss'),
            evt_is_predefined: true,
            isEvent: true
          }
        })
      }
    })

    return events
  }

  validateRestricitons(event: GenericCalendarEvent, date: string): boolean {
    return event.restrictions?.find((restriction) => { return restriction.restriction_date == date }) == undefined
  }

  getFutureDates(targetDOW: number): string[] {
    let dates: string[] = []
    let todayDate = new Date()

    // 62 days in the future
    let finalDate = new Date()
    finalDate.setDate(todayDate.getDate() + 62)

    let currItDate = new Date()

    if (todayDate.getDay() != targetDOW) {
      // find the next occurrence
      let offset = this.calculateModularDistance(todayDate.getDay(), targetDOW)
      currItDate.setDate(todayDate.getDate() + offset)
    }

    while (currItDate < finalDate) {
      dates.push(moment(currItDate).format('YYYY-MM-DD'))
      currItDate.setDate(currItDate.getDate() + 7)
    }

    return dates
  }


  calculateModularDistance(value1: number, value2: number): number {
    const dow = [0, 1, 2, 3, 4, 5, 6]
    const idx1 = dow.indexOf(+value1)
    const idx2 = dow.indexOf(+value2)

    if (idx1 <= idx2) {
      return idx2 - idx1
    } else {
      return (7 - idx1) + idx2
    }
  }


  async openCEPredefinedEventModal() {
    const modal = await this.modalController.create({
      component: MobileCreateEditPredefinedEventModalComponent,
      mode: 'ios',
      backdropDismiss: true,
      showBackdrop: true,
      componentProps: {
        calendarID: this.menuSelectedBtn,
      }
    });

    await modal.present();

    const { data, role } = await modal.onDidDismiss();

    if (role !== 'backdrop' &&
      data != undefined &&
      data.created) {
      this.setupCalendar()
    }
  }


  async promptRequestForm(client: Client, services: any[], event_id: number) {
    let buttonClicked: string = '';

    const alert = await this.alertController.create({
      header: Default_PT.CREATE_FORM_TREATMENT,
      message: Default_PT.PROMPT_CREATE_FORM_TREATMENT,
      buttons: [
        {
          text: Default_PT.DENY_CREATE_FORM,
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            buttonClicked = 'cancel'
          }
        }, {
          text: Default_PT.CREATE_FORM,
          handler: () => {
            buttonClicked = 'continue'
          }
        }
      ]
    });

    await alert.present();
    await alert.onDidDismiss();

    if (buttonClicked == 'continue') {
      await this.manipulateFormAndTreatments(client, services, event_id);
    }
  }

  async manipulateFormAndTreatments(client: Client, services: any, event_id: number) {
    const modal = await this.modalController.create({
      component: MobileManageFormTreatmentManipulationComponent,
      componentProps: {
        client: client,
        services: services,
        event_id: event_id
      }
    });

    await modal.present();
    await modal.onDidDismiss();
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
        action: 'create-new'
      }
    });

    await modal.present();

    const { data, role } = await modal.onDidDismiss();

    if (role !== 'backdrop' &&
      data != undefined &&
      data.created) {
      //await this.promptRequestForm(data.client, data.services, data.event_id)
      this.setupCalendar()
    }
  }

  async openViewModal(evt: MockupEvent) {

    const modal = await this.modalController.create({
      component: MobileViewEventModalComponent,
      mode: 'ios',
      backdropDismiss: true,
      showBackdrop: true,
      componentProps: {
        event: evt,
        calendar_id: this.menuSelectedBtn,
        title: `${Default_PT.VISUALIZE_EVENT} - ${moment(evt.evt_start).format('DD/MM/YYYY')} - ${evt.evt_client}`
      }
    });

    await modal.present();

    const { data, role } = await modal.onDidDismiss();

    if (!isEmpty(data) && (data.deleted || data.edited)) {
      this.setupCalendar()
    }
  }

  async manageWorkers() {
    const modal = await this.modalController.create({
      component: MobileManageWorkersModalComponent,
      mode: 'ios',
      backdropDismiss: true,
      showBackdrop: true,
    });

    await modal.present();

    const { data, role } = await modal.onDidDismiss();

    if (data || role) {
      this.setupCalendar()
    }
  }


  async fillForm(id: number) {
    const modal = await this.modalController.create({
      component: MobileFillFormComponent,
      mode: 'ios',
      backdropDismiss: true,
      showBackdrop: true,
      componentProps: {
        form_id: id
      }
    });

    await modal.present();
    const { data, role } = await modal.onDidDismiss();

    if (!isEmpty(data) && isEmpty(data.filled)) {
      this.setupCalendar()
    }
  }

  checkOpenForms() {
    let emptyForms: any[] = []

    this.eventsWithForms.forEach((event) => {
      event.evt_forms.forEach((form: Form) => {
        if (form.created_at === form.updated_at) {
          const now = new Date();
          const nowIn5 = new Date(now.getTime() + 5 * 60000);

          if (nowIn5 > new Date(event.evt_end)) {

            emptyForms.push({
              id: form.id,
              title: event.evt_title,
              end: event.evt_end,
              missed_by: moment(event.evt_end).fromNow(),
            })
          }
        }
      })
    })

    emptyForms.sort((a, b) => { return new Date(b.end).getTime() - new Date(a.end).getTime() })
    this.emptyForms = emptyForms
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