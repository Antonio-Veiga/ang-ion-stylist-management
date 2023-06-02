import { Component } from '@angular/core';
import { AlertController, ModalController, NavParams } from '@ionic/angular';
import { Default_PT } from 'src/app/defaults/langs/pt-pt/Defaults';
import { MockupEvent } from 'src/app/desktop/desktop-home/desktop-home.component';
import { isEmpty } from 'lodash';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { InfoSnackBarComponent } from 'src/app/partials/info-snack/info-snack.component';
import { APIService } from 'src/app/services/api/api.service';
import { MobileCreateEditEventModalComponent } from '../mobile-create-edit-event-modal/mobile-create-edit-event-modal.component';
import { MobileCreateEditPredefinedEventModalComponent } from '../mobile-create-edit-predefined-event-modal/mobile-create-edit-predefined-event-modal.component';

const moment = require('moment')
@Component({
  selector: 'app-mobile-view-event-modal',
  templateUrl: './mobile-view-event-modal.component.html',
  styleUrls: ['./mobile-view-event-modal.component.scss'],
})
export class MobileViewEventModalComponent {

  public eventTemplate!: MockupEvent
  public intervalText?: string
  public minutesText = Default_PT.MINUTES
  public componentTitle?: string
  public collapsed: boolean = true
  public processing: boolean = false
  public calendarId?: 1 | 2 | 3 | 4 | number

  public isPredefinedText?: string
  public comment?: string

  public openPopoverIcon = "add-circle-outline"

  constructor(public params: NavParams,
    public modalController: ModalController,
    public alertController: AlertController,
    public _snackBar: MatSnackBar,
    public api: APIService) {
    this.eventTemplate = params.data['event']
    this.componentTitle = params.data['title']
    this.calendarId = params.data['calendar_id']

    this.eventTemplate.evt_is_predefined ? this.isPredefinedText = Default_PT.PREDEFINED_EVENT_TEXT : this.isPredefinedText = Default_PT.NOT_PREDEFINED_EVENT_TEXT
    isEmpty(this.eventTemplate.evt_comment) ? this.comment = Default_PT.EMPTY_COMMENT_TEXT : this.comment = this.eventTemplate.evt_comment!

    this.intervalText = `${moment(this.eventTemplate.evt_start).format("DD/MM/YYYY HH:mm:ss")} até ${moment(this.eventTemplate.evt_end).format("DD/MM/YYYY HH:mm:ss")}`
  }

  async promptDeleteEvent() {
    const alert = await this.alertController.create({
      header: Default_PT.DELETE_EVENT_TITLE,
      message: `${Default_PT.DELETE_EVENT_MOBILE_PROMPT} ${this.eventTemplate.evt_title}?`,
      buttons: [{ text: Default_PT.CANCEL_BUTTON_TEXT }, { text: Default_PT.CONTINUE_BUTTON_TEXT, handler: () => { this.deleteEvent(this.eventTemplate.evt_id, this.eventTemplate.evt_is_predefined) } }],
      mode: 'ios'
    });

    await alert.present();
  }

  async promptEditEvent() {
    const modal = await this.modalController.create({
      component: MobileCreateEditEventModalComponent,
      componentProps: {
        calendarID: this.calendarId,
        date: moment(this.eventTemplate.evt_start).format('YYYY-MM-DD'),
        title: `${Default_PT.EDIT_EVENT} - ${moment(this.eventTemplate.evt_start).format('DD/MM/YYYY')}`,
        eventData: this.eventTemplate,
        action: 'edit-event'
      }
    });

    await modal.present();

    const { data, role } = await modal.onDidDismiss();

    if (role !== 'backdrop' && data && data.created) {
      this.modalController.dismiss({ edited: true })
    }
  }

  deleteEvent(event_id: number, isPredefined: boolean) {
    this.processing = true

    if (isPredefined) {
      let restrictionDate = moment(this.eventTemplate.evt_start).format('YYYY-MM-DD')
      this.api.deleteSinglePredefinedEvent(event_id, restrictionDate).subscribe(this.finishDelete.bind(this))
    } else {
      this.api.deleteEvent(event_id).subscribe(this.finishDelete.bind(this))
    }
  }

  finishDelete() {
    this.openInfoSnackBar(Default_PT.DELETE_EVENT_SUCCESS, Default_PT.INFO_BTN)
    this.modalController.dismiss({ deleted: true })
  }

  openInfoSnackBar(content: string, btnContent: string) {
    const config = new MatSnackBarConfig();
    config.data = { content: content, btnContent: btnContent, duration: 3000 };
    this._snackBar.openFromComponent(InfoSnackBarComponent, config);
  }

  checkForms() {
    console.log(this.eventTemplate.evt_forms)
  }

  hasForms() {
    return !isEmpty(this.eventTemplate.evt_forms)
  }

  async promptEditPredefinedEvent() {
    const modal = await this.modalController.create({
      component: MobileCreateEditPredefinedEventModalComponent,
      componentProps: {
        calendarID: this.calendarId,
        date: moment(this.eventTemplate.evt_start).format('YYYY-MM-DD'),
        eventData: this.eventTemplate,
        action: 'edit-event'
      }
    });

    await modal.present();

    const { data, role } = await modal.onDidDismiss();

    if (role !== 'backdrop' && data && data.created) {
      this.modalController.dismiss({ edited: true })
    }
  }

  async promptDeletePredefinedEvent() {
    const alert = await this.alertController.create({
      header: Default_PT.DELETE_PREDEFINED_EVENT_TITLE,
      message: `${Default_PT.DELETE_EVENT_MOBILE_PROMPT} ${this.eventTemplate.evt_title}?`,
      buttons: [{ text: Default_PT.CANCEL_BUTTON_TEXT }, { text: Default_PT.CONTINUE_BUTTON_TEXT, handler: () => { this.deletePredefinedEvent(this.eventTemplate.evt_id) } }],
      mode: 'ios'
    });

    await alert.present();
  }

  deletePredefinedEvent(evt_id: number) {
    this.processing = true
    this.api.deletePredefinedEvent(evt_id).subscribe(this.finishDelete.bind(this))
  }

  toggleServices() {
    if (this.collapsed) { this.collapsed = false; this.openPopoverIcon = "remove-circle-outline" } else {
      this.collapsed = true;
      this.openPopoverIcon = "add-circle-outline"
    }
  }
}
