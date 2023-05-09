import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Default_PT } from 'src/app/defaults/langs/pt-pt/Defaults';
import { MockupEvent } from 'src/app/desktop/desktop-home/desktop-home.component';
import { VisualizeEventDialogData } from 'src/app/interfaces/VisualizeEventDialogData';

const moment = require('moment')

@Component({
  selector: 'app-desktop-view-event-modal',
  templateUrl: './desktop-view-event-modal.component.html',
  styleUrls: ['./desktop-view-event-modal.component.scss'],
})
export class DesktopViewEventModalComponent {
  public componentTitle?: string
  public eventTemplate!: MockupEvent
  public intervalText?: string
  public minutesText = Default_PT.MINUTES

  public openPopoverIcon = "add-circle-outline"

  constructor(@Inject(MAT_DIALOG_DATA) public _data: VisualizeEventDialogData) {
    this.componentTitle = _data.title
    this.eventTemplate = _data.event

    this.intervalText = `${moment(this.eventTemplate.evt_start).format("HH:mm:ss")}-${moment(this.eventTemplate.evt_end).format("HH:mm:ss")}`
  }


  onDismiss() {
    this.openPopoverIcon = "add-circle-outline"
  }

  onPresent() {
    this.openPopoverIcon = "remove-circle-outline"
  }
}
