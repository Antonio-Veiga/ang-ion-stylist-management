import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { CreateEventDialogData } from 'src/app/interfaces/CreateEventDialogData';
import { Client } from 'src/app/models/Client';
import { Service } from 'src/app/models/Service';
import { APIService } from 'src/app/services/api/api.service';
import { isEmpty, isEqual } from 'lodash';
import { DesktopCreateEditClientModalComponent } from '../desktop-create-edit-client-modal/desktop-create-edit-client-modal.component';

interface CheckboxTemplate {
  name: string;
  duration: number;
  isActive: boolean;
}

@Component({
  selector: 'app-desktop-create-edit-event-modal',
  templateUrl: './desktop-create-edit-event-modal.component.html',
  styleUrls: ['./desktop-create-edit-event-modal.component.scss'],
})
export class DesktopCreateEditEventModalComponent {
  public clientOptions: Client[] = []
  public serviceOptions: any[] = []
  public workersOptions: any[] = []
  public controlGroup!: FormGroup
  public componentTitle!: string
  public calendarID!: number
  public previousClient?: Client
  public cOptionsLoaded = false
  public wOptionsLoaded = false
  public submiting = false

  public selectedServiceCheckboxes = new Map<number, CheckboxTemplate>();

  constructor(private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public _data: CreateEventDialogData,
    public api: APIService,
    public _dialog: MatDialog) {
    this.componentTitle = _data.title
    this.calendarID = _data.calendarID

    this.controlGroup = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(128), Validators.pattern(/^(?!\s)(?!.*\s{2,})(.*\S)?(?<!\s)$/)]],
      time: ['', [Validators.required, Validators.pattern(/^(0[7-9]|1\d|2[0-1]):[0-5]\d$/)]],
      client: [undefined, Validators.required],
      workerID: ['', Validators.required],
    });

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
  }

  getClientOptions(onHoldClient?: Client) {
    this.cOptionsLoaded = false

    this.api.getActiveClients(this.calendarID).subscribe((wrapper) => {
      this.clientOptions = wrapper.data.map((client) => {
        return { ...client };
      })

      this.cOptionsLoaded = true

      if (onHoldClient) { this.controlGroup.get('client')?.setValue(onHoldClient); this.controlGroup.get('client')?.markAsTouched() }
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

  openCEClientModal() {
    const CEDiagRef = this._dialog.open(DesktopCreateEditClientModalComponent, {
      data: {
        client: Client,
        action: 'fast-add',
        predefined_sex: this.calendarID == 1 ? 'M' : 'F',
      }
    });

    CEDiagRef.afterClosed().subscribe(async () => {
      if (CEDiagRef.componentInstance._data.response) {
        this.getClientOptions(CEDiagRef.componentInstance.fastAddedClient)
      }
    })
  }

  clientSearchFn(term: string, item: any) {
    return item.name.includes(term) || item.phonenumber.includes(term)
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

  public utilStripFn(): number[] {
    return Array.from(this.selectedServiceCheckboxes.keys()).filter(
      (key) => this.selectedServiceCheckboxes.get(key)?.isActive
    );
  }
}
