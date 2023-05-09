import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, NavParams } from '@ionic/angular';
import { CalendarEvent } from 'src/app/models/CalendarEvent';
import { Service } from 'src/app/models/Service';
import { APIService } from 'src/app/services/api/api.service';


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
  public modelTemplate: CalendarEvent = {}
  public clientOptions: any[] = []
  public serviceOptions: any[] = []
  public workersOptions: any[] = []
  public controlGroup!: FormGroup
  public componentTitle!: string
  public calendarID!: number
  public cOptionsLoaded = false
  public wOptionsLoaded = false
  public submiting = false

  public selectedServiceCheckboxes = new Map<number, CheckboxTemplate>();

  constructor(private formBuilder: FormBuilder, params: NavParams, public api: APIService, public modalController: ModalController) {
    this.componentTitle = params.data['title']
    this.calendarID = params.data['calendarID']

    this.controlGroup = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(128), Validators.pattern(/^(?!\s)(?!.*\s{2,})(.*\S)?(?<!\s)$/)]],
      time: ['', [Validators.required, Validators.pattern(/^(0[7-9]|1\d|2[0-1]):[0-5]\d$/)]],
      clientID: ['', Validators.required],
      workerID: ['', Validators.required],
    });

    this.getClientOptions()
    this.getServiceOptions()
    this.getWorkersOptions()
  }


  getClientOptions() {
    this.api.getActiveClients(this.calendarID).subscribe((wrapper) => {
      this.clientOptions = wrapper.data.map((client) => {
        return { id: client.id, name: client.name };
      })

      this.cOptionsLoaded = true
    })
  }

  getServiceOptions() {
    this.api.getServices(this.calendarID, true).subscribe((wrapper) => {
      this.serviceOptions = wrapper.data.map((service) => {
        return { id: service.id, name: service.name };
      })

      this.fillServiceMap(wrapper.data)
    })
  }

  getWorkersOptions() {
    this.api.getGluedLabels(this.calendarID).subscribe((wrapper) => {
      this.workersOptions = wrapper.data.map((glue) => {
        return { id: glue.label!.id, name: glue.label!.name }
      })

      this.wOptionsLoaded = true
    })
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


  public utilStripFn(): number[] {
    return Array.from(this.selectedServiceCheckboxes.keys()).filter(
      (key) => this.selectedServiceCheckboxes.get(key)?.isActive
    );
  }
}
