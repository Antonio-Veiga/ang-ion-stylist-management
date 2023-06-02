import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, ModalController, NavParams } from '@ionic/angular';
import { Default_PT } from 'src/app/defaults/langs/pt-pt/Defaults';
import { Service } from 'src/app/models/Service';
import { APIService } from 'src/app/services/api/api.service';
import { isEqual, isEmpty } from 'lodash';
import { MobileCreateEditClientModalComponent } from '../mobile-create-edit-client-modal/mobile-create-edit-client-modal.component';
import { Client } from 'src/app/models/Client';
import { EventPayload } from 'src/app/models/payloads/HandleEventCreation';
import * as moment from 'moment-timezone'
import { lastValueFrom } from 'rxjs';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { InfoSnackBarComponent } from 'src/app/partials/info-snack/info-snack.component';
import { MockupEvent } from 'src/app/desktop/desktop-home/desktop-home.component';
import { PredefinedEventEditPayload } from 'src/app/models/payloads/HandlePredefinedEventEdit';
import { MobileManageFormTreatmentManipulationComponent } from '../mobile-manage-form-treatment-manipulation/mobile-manage-form-treatment-manipulation.component';
moment.tz.setDefault('Europe/Lisbon');

interface CheckboxTemplate {
  name: string;
  duration: number;
  isActive: boolean;
}

@Component({
  selector: 'app-mobile-create-edit-event-modal',
  templateUrl: './mobile-create-edit-event-modal.component.html',
  styleUrls: ['./mobile-create-edit-event-modal.component.scss'],
})
export class MobileCreateEditEventModalComponent {
  public clientOptions: any[] = []
  public serviceOptions: any[] = []
  public workersOptions: any[] = []
  public controlGroup!: FormGroup
  public componentTitle!: string
  public eventDate?: string
  public calendarID!: number
  public previousClient?: Client
  public cOptionsLoaded = false
  public wOptionsLoaded = false
  public submiting = false
  public editAction = false
  public eventData?: MockupEvent
  public CEventBtnText?: string

  public isSmallScreen = window.matchMedia("(max-width: 600px)").matches;

  public selectedServiceCheckboxes = new Map<number, CheckboxTemplate>();

  constructor(private formBuilder: FormBuilder,
    params: NavParams,
    public api: APIService,
    public modalController: ModalController,
    public alertController: AlertController,
    public _snackBar: MatSnackBar) {
    this.componentTitle = params.data['title']
    this.calendarID = params.data['calendarID']

    if (params.data['action'] == 'edit-event') {
      this.editAction = true

      // reference value, never change eventData
      this.eventData = params.data['eventData']
    }

    this.controlGroup = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(128), Validators.pattern(/^\S(.*\S)?$/)]],
      time: ['', [Validators.required, Validators.pattern(/^(0[7-9]|1\d|2[0-1]):[0-5]\d$/)]],
      client: [undefined, Validators.required],
      workerID: [undefined, Validators.required],
      comment: ['']
    })

    if (moment(params.data['date'], 'YYYY-MM-DDTHH:mm:ssZ', true).isValid()) {
      let date = new Date(params.data['date'])

      this.controlGroup.patchValue({ time: `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}` })
      this.controlGroup.get('time')?.markAsTouched()
      this.eventDate = moment(date).format('YYYY-MM-DD')
    } else {
      this.eventDate = params.data['date']
    }

    this.getClientOptions()
    this.getServiceOptions()
    this.getWorkersOptions()

    this.controlGroup.get('client')?.valueChanges.subscribe((client) => {
      let title = this.controlGroup.get('name')?.value

      if (isEmpty(client) && (this.previousClient && this.previousClient.name == title)) {
        this.controlGroup.patchValue({ name: '' })
      } else {
        if ((!isEmpty(client) && isEmpty(title)) || (this.previousClient && this.previousClient.name == title)) { this.controlGroup.patchValue({ name: client.name }) }
      }

      this.previousClient = client
    })

    if (this.editAction) {
      this.CEventBtnText = Default_PT.EDIT_EVENT_BTN_TEXT
      let dateFormatted = new Date(this.eventData!.evt_start)

      this.controlGroup.patchValue({
        name: this.eventData?.evt_title,
        time: `${String(dateFormatted.getHours()).padStart(2, '0')}:${String(dateFormatted.getMinutes()).padStart(2, '0')}`,
      })

      if (!this.eventData?.evt_is_predefined) {
        this.controlGroup.patchValue({ comment: this.eventData?.evt_comment })
      }

      this.controlGroup.get('name')?.markAsTouched()
      this.controlGroup.get('time')?.markAsTouched()
    } else {
      this.CEventBtnText = Default_PT.CREATE_EVENT_BTN_TEXT
    }
  }


  getClientOptions(onHoldClient?: Client) {
    this.api.getActiveClients(this.calendarID).subscribe((wrapper) => {
      this.clientOptions = wrapper.data.map((client) => {
        return { ...client };
      })

      this.cOptionsLoaded = true

      if (onHoldClient) {
        this.controlGroup.get('client')?.setValue(onHoldClient); this.controlGroup.get('client')?.markAsTouched()
      } else if (this.editAction) {

        let selectedClient = this.clientOptions.find((client) => {
          return client.id == this.eventData?.evt_client_id
        })

        if (!isEmpty(selectedClient)) {
          this.controlGroup.patchValue({ client: selectedClient })
          this.controlGroup.get('client')?.markAsTouched()
        }
      }
    })
  }

  getServiceOptions() {
    this.api.getServices(this.calendarID, true).subscribe((wrapper) => {
      this.serviceOptions = wrapper.data.map((service) => {
        return { id: service.id, name: service.name };
      })

      this.fillServiceMap(wrapper.data)

      if (this.editAction) {

        let ids = Array.from(this.selectedServiceCheckboxes.keys());
        this.eventData?.evt_services.forEach((service) => {
          if (ids.includes(service.id!)) {
            let selectedCheckbox = this.selectedServiceCheckboxes.get(service.id!)
            selectedCheckbox!.isActive = true
            this.selectedServiceCheckboxes.set(service.id!, selectedCheckbox!)

            setTimeout(() => {
              let htmlInputEl = document.querySelector(`input#checkbox-${service.id!}`) as HTMLInputElement
              htmlInputEl.checked = true
            }, 100)
          }
        })
      }
    })
  }

  getWorkersOptions() {
    this.api.getGluedLabels(this.calendarID).subscribe((wrapper) => {
      this.workersOptions = wrapper.data.map((glue) => {
        return { id: glue.label!.id, name: glue.label!.name }
      })

      this.wOptionsLoaded = true


      if (this.editAction) {
        let selectedWorker = this.workersOptions.find((worker) => {
          return worker.id == this.eventData?.evt_label_id
        })


        if (!isEmpty(selectedWorker)) {
          this.controlGroup.patchValue({ workerID: selectedWorker.id })
          this.controlGroup.get('workerID')?.markAsTouched()
        }
      }
    })
  }

  async createEvent() {
    if (this.controlGroup.valid && this.selectedServiceCheckboxes.size > 0) {

      this.submiting = true

      let assoc_service_ids: number[] = []

      for (const [key, value] of this.selectedServiceCheckboxes) {
        if (value.isActive) { assoc_service_ids.push(key) }
      }

      // handle event creation
      let payload: EventPayload = {
        title: this.controlGroup.get('name')!.value,
        time: this.createDate(this.eventDate!, this.controlGroup.get('time')!.value),
        calendar_id: this.calendarID,
        client_id: (this.controlGroup.get('client')!.value).id,
        worker_id: this.controlGroup.get('workerID')!.value,
        comment: isEmpty(this.controlGroup.get('comment')!.value) ? null : this.controlGroup.get('comment')!.value,
        assoc_service_ids: assoc_service_ids
      }

      const postEventReq$ = this.api.postEvent(payload)
      let calendarEventWrapper = await lastValueFrom(postEventReq$)

      this.submiting = false
      this.openInfoSnackBar(Default_PT.EVENT_ADDED, Default_PT.INFO_BTN)

      this.modalController.dismiss(
        {
          created: true,
          services: this.getServiceValuesFromKeys(assoc_service_ids),
          client: (this.controlGroup.get('client')!.value),
          event_id: calendarEventWrapper.data.id
        }
      )
    } else {
      this.openInfoSnackBar(Default_PT.INVALID_INPUT, Default_PT.INFO_BTN)
    }
  }

  getServiceValuesFromKeys(ids: number[]) {
    return ids.map((id) => {
      let service = this.selectedServiceCheckboxes.get(id)

      return {
        id: id,
        name: service!.name,
      }
    })
  }

  async editEvent() {
    if (this.controlGroup.valid && this.selectedServiceCheckboxes.size > 0) {
      this.submiting = true

      let assoc_service_ids: number[] = []

      for (const [key, value] of this.selectedServiceCheckboxes) {
        if (value.isActive) { assoc_service_ids.push(key) }
      }

      if (this.eventData?.evt_is_predefined) {

        // handle event predefined edition
        let payload: PredefinedEventEditPayload = {
          title: this.controlGroup.get('name')!.value,
          time: this.createDate(this.eventDate!, this.controlGroup.get('time')!.value),
          calendar_id: this.calendarID,
          client_id: (this.controlGroup.get('client')!.value).id,
          worker_id: this.controlGroup.get('workerID')!.value,
          comment: isEmpty(this.controlGroup.get('comment')!.value) ? null : this.controlGroup.get('comment')!.value,
          assoc_service_ids: assoc_service_ids,
          restriction_date: moment(this.createDate(this.eventDate!, this.controlGroup.get('time')!.value)).format('YYYY-MM-DD'),
        }

        const editPredefinedEventReq$ = this.api.editPredefinedEvent(payload, this.eventData!.evt_id)
        await lastValueFrom(editPredefinedEventReq$)

        this.submiting = false
        this.openInfoSnackBar(Default_PT.EVENT_EDITED, Default_PT.INFO_BTN)
        this.modalController.dismiss({ created: true })

      } else {

        // handle event edition
        let payload: EventPayload = {
          title: this.controlGroup.get('name')!.value,
          time: this.createDate(this.eventDate!, this.controlGroup.get('time')!.value),
          client_id: (this.controlGroup.get('client')!.value).id,
          worker_id: this.controlGroup.get('workerID')!.value,
          comment: isEmpty(this.controlGroup.get('comment')!.value) ? null : this.controlGroup.get('comment')!.value,
          assoc_service_ids: assoc_service_ids
        }

        const editEventReq$ = this.api.editEvent(payload, this.eventData!.evt_id)
        await lastValueFrom(editEventReq$)

        this.submiting = false
        this.openInfoSnackBar(Default_PT.EVENT_EDITED, Default_PT.INFO_BTN)
        this.modalController.dismiss({ created: true })
      }
    } else {
      this.openInfoSnackBar(Default_PT.INVALID_INPUT, Default_PT.INFO_BTN)
    }
  }

  async openCEClientModal() {
    const modal = await this.modalController.create({
      component: MobileCreateEditClientModalComponent,
      componentProps: {
        title: Default_PT.CREATE_CLIENT_FAST_CREATION,
        client: Client,
        predefined_sex: this.calendarID == 1 ? 'M' : 'F',
        action: 'fast-add'
      }
    });

    await modal.present();

    const { data, role } = await modal.onDidDismiss();

    if (role !== 'backdrop' && data !== true) {
      this.getClientOptions(data)
    }
  }

  clientSearchFn(term: string, item: any) {
    const searchTerm = term.toLowerCase();
    const itemName = item.name.toLowerCase();

    return itemName.includes(searchTerm) || item.phonenumber.includes(term);
  }

  compareFn(a: any, b: any) {
    return isEqual(a, b)
  }

  public fillServiceMap(services: Service[]) {
    services.forEach((service) => { this.selectedServiceCheckboxes.set(service.id!, { isActive: false, name: service.name!, duration: service.duration! }) })
  }

  checkboxChange(input: EventTarget | null) {
    let HTMLInput = (input as HTMLInputElement)
    let checkbox: CheckboxTemplate = this.selectedServiceCheckboxes.get(Number.parseInt(HTMLInput!.value))!
    checkbox.isActive = HTMLInput!.checked

    this.selectedServiceCheckboxes.set(Number.parseInt(HTMLInput!.value), checkbox)
  }

  calculateEta(): number {
    let duration: number = 0
    let ids = this.utilStripFn()
    ids.forEach((id) => { duration += Number(this.selectedServiceCheckboxes.get(id)?.duration!) })
    return duration
  }

  createDate(date: string, time: string): string {
    return moment(`${date} ${time}`).format('YYYY-MM-DD HH:mm:ss')
  }

  openInfoSnackBar(content: string, btnContent: string) {
    const config = new MatSnackBarConfig();
    config.data = { content: content, btnContent: btnContent, duration: 3000 };
    this._snackBar.openFromComponent(InfoSnackBarComponent, config);
  }

  public utilStripFn(): number[] {
    return Array.from(this.selectedServiceCheckboxes.keys()).filter(
      (key) => this.selectedServiceCheckboxes.get(key)?.isActive
    );
  }

  changed() {
    let assoc_service_ids: number[] = []

    for (const [key, value] of this.selectedServiceCheckboxes) {
      if (value.isActive) { assoc_service_ids.push(key) }
    }

    let serviceIds = this.eventData?.evt_services.map((service) => { return service.id })

    return this.eventData?.evt_title != this.controlGroup.get('title')!.value ||
      this.eventData?.evt_start != this.controlGroup.get('time')!.value ||
      this.eventData?.evt_client_id != this.controlGroup.get('client')!.value.id ||
      this.eventData?.evt_label_id != this.controlGroup.get('workerID')!.value ||
      (!this.eventData?.evt_is_predefined && (this.eventData?.evt_comment != this.controlGroup.get('comment')!.value)) ||
      !isEqual(assoc_service_ids.sort(), serviceIds!.sort())
  }
}
