import { Component, Input, OnInit } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import langPT from '@fullcalendar/core/locales/pt';
import { APIService } from 'src/app/services/api.service';
import { CalendarEventWrapper } from 'src/app/models/CalendarEventWrapper';
import { FCalendarUsable } from 'src/app/interfaces/Loadable';

@Component({
  selector: 'app-desktop-home',
  templateUrl: './desktop-home.component.html',
  styleUrls: ['./desktop-home.component.scss'],
})
export class DesktopHomeComponent implements OnInit, FCalendarUsable {
  public pageTitle: string = 'Calendário'
  public calendarLoaded = 1;
  public calendarLoading = false;
  public loadingComponent!: HTMLIonLoadingElement
  public loadedEvents!: any[]

  public overlay = {
    title: 'a carregar eventos.',
    desc: 'espere um momento enquanto os eventos são carregados.'
  }

  @Input() public reload!: string;

  events!: CalendarEventWrapper

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
    dateClick: (data) => { },
    eventClick: (data) => { }
  };

  constructor(public api: APIService) {
    this.setupCalendar();
  }

  ngOnInit() { }

  async setupCalendar() {
    this.calendarLoading = false;

    try {
      this.api.getEvents(this.calendarLoaded).subscribe((data) => {
        this.events = data
        this.makeCalendar()
      })
    } catch (_) {
      console.error(_)
    }
  }

  makeCalendar() {
    this.loadedEvents = []

    this.events.data.forEach((event) => {
      const finalTime = new Date(event.time)
      finalTime.setMinutes(finalTime.getMinutes() + event.duration)

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
    this.calendarLoading = true;
  }
}
