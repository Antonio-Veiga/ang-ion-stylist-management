import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { Default_PT } from 'src/app/defaults/langs/pt-pt/Defaults';
import { MockupEvent } from 'src/app/desktop/desktop-home/desktop-home.component';

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

  public openPopoverIcon = "add-circle-outline"

  constructor(public params: NavParams, public modalController: ModalController) {
    this.eventTemplate = params.data['event']
    this.componentTitle = params.data['title']
    this.intervalText = `${moment(this.eventTemplate.evt_start).format("HH:mm:ss")}-${moment(this.eventTemplate.evt_end).format("HH:mm:ss")}`
  }


  toggleServices() {
    if (this.collapsed) { this.collapsed = false; this.openPopoverIcon = "remove-circle-outline" } else {
      this.collapsed = true;
      this.openPopoverIcon = "add-circle-outline"
    }
  }
}
