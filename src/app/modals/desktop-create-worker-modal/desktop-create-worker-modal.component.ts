import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Default_PT } from 'src/app/defaults/langs/pt-pt/Defaults';
import { Calendar } from 'src/app/models/Calendar';
import { APIService } from 'src/app/services/api/api.service';
import { isEqual } from 'lodash';
import { AddLabelPayload } from 'src/app/models/payloads/HandleLabelCreation';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { InfoSnackBarComponent } from 'src/app/partials/info-snack/info-snack.component';

@Component({
  selector: 'app-desktop-create-worker-modal',
  templateUrl: './desktop-create-worker-modal.component.html',
  styleUrls: ['./desktop-create-worker-modal.component.scss'],
})
export class DesktopCreateWorkerModalComponent {
  public createdWorker: boolean = false
  public submitting: boolean = false
  public creatWorkerBtnText: string = Default_PT.CREATE_WORKER_TEXT
  public componentTitle = Default_PT.CREATE_WORKER_MODAL_TITLE
  public controlGroup!: FormGroup
  public calendarOptions?: Calendar[]

  constructor(private formBuilder: FormBuilder, public api: APIService, public _snackBar: MatSnackBar) {
    this.controlGroup = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(128), Validators.pattern(/^\S(.*\S)?$/)]],
      hex_color_value: ['#ffffff', [Validators.required]],
      associated_calendars: [undefined, [Validators.required]],
    })

    this.controlGroup.get('hex_color_value')?.markAsTouched()
    this.getAllCalendars()
  }

  getAllCalendars() {
    this.api.getCalendars().subscribe((wrapper) => {
      this.calendarOptions = wrapper.data
    })
  }

  compareFn(a: any, b: any) {
    return isEqual(a, b)
  }

  createWorker() {
    if (this.controlGroup.valid) {
      this.controlGroup.disable()
      this.submitting = true

      let payload: AddLabelPayload = {
        name: this.controlGroup.get('name')!.value,
        color_hex_value: this.controlGroup.get('hex_color_value')!.value,
        assoc_calendar_ids: this.controlGroup.get('associated_calendars')!.value
      }

      this.api.postLabel(payload).subscribe(() => {
        this.controlGroup.enable()
        this.submitting = false
        this.controlGroup.reset()
        this.openInfoSnackBar(Default_PT.WORKER_CREATED, Default_PT.INFO_BTN)
      })

      if (!this.createdWorker) { this.createdWorker = true }
    }
  }


  openInfoSnackBar(content: string, btnContent: string) {
    const config = new MatSnackBarConfig();
    config.data = { content: content, btnContent: btnContent, duration: 3000 };
    this._snackBar.openFromComponent(InfoSnackBarComponent, config);
  }
}
