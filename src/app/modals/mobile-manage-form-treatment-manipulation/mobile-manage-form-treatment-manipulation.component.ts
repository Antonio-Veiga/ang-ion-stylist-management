import { Component } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { ModalController, NavParams } from '@ionic/angular';
import { lastValueFrom } from 'rxjs';
import { Default_PT } from 'src/app/defaults/langs/pt-pt/Defaults';
import { Client } from 'src/app/models/Client';
import { FormTreatmentPayload, ManipulateFormTreatmentPayload } from 'src/app/models/payloads/HandleMultipleFormTreatmentManipulation';
import { InfoSnackBarComponent } from 'src/app/partials/info-snack/info-snack.component';
import { APIService } from 'src/app/services/api/api.service';

interface FormStructure {
  objective: boolean;
  hair_state: boolean;
  advised_treatment: boolean;
  product_tab: boolean;
  attachments: boolean;
}

interface Tab {
  tab_service_id: number;
  tab_title: string;
  tab_new_form: boolean;
  tab_new_treatment: boolean;
  tab_assoc_treatment: boolean,
  tab_treatment_id: number | undefined;
  form_structure: FormStructure;
}

@Component({
  selector: 'app-mobile-manage-form-treatment-manipulation',
  templateUrl: './mobile-manage-form-treatment-manipulation.component.html',
  styleUrls: ['./mobile-manage-form-treatment-manipulation.component.scss'],
})
export class MobileManageFormTreatmentManipulationComponent {
  public componentTitle = Default_PT.MANAGE_FORMS_AND_TREATMENTS
  public eventId?: number
  public client?: Client
  public tabs: Map<number, Tab> = new Map<number, Tab>()
  public tabsArray: any[] = []
  public loadedTab?: Tab
  public submiting = false

  constructor(public modalController: ModalController, params: NavParams, public api: APIService, public _snackBar: MatSnackBar) {
    this.client = params.data['client']
    this.eventId = params.data['event_id']
    this.constructTabs(params.data['services'])
    this.loadedTab = this.tabs.get(Array.from(this.tabs.keys())[0])
    this.tabsArray = this.mapToArray(this.tabs)
  }

  constructTabs(services: any) {
    services.forEach((service: any) => {
      this.tabs.set(service.id,
        {
          tab_service_id: service.id,
          tab_title: service.name,
          tab_new_form: false,
          tab_new_treatment: false,
          tab_assoc_treatment: false,
          tab_treatment_id: undefined,
          form_structure: {
            objective: false,
            hair_state: false,
            advised_treatment: false,
            product_tab: false,
            attachments: false
          }
        }
      )
    });
  }

  changeTab(tab: number) {
    if (!this.submiting) {
      if (this.loadedTab?.tab_service_id != tab) {
        this.loadedTab = this.tabs.get(tab)
      }
    }
  }

  mapToArray(map: Map<number, Tab>): { key: number, tab: Tab }[] {
    return Array.from(map.entries()).map(([key, tab]) => ({ key, tab }));
  }

  removeTab() {
    if (this.tabs.size > 1) {
      let selectedKey = this.loadedTab!.tab_service_id
      this.tabs.delete(selectedKey);
      this.removeTabFromUI(selectedKey);
      const tabKeys = Array.from(this.tabs.keys())
      this.loadedTab = this.tabs.get(tabKeys[0])
    } else {
      this.modalController.dismiss()
    }
  }

  removeTabFromUI(index: number) {
    document.querySelector(`button[id="${index}"]`)?.remove()
  }

  async createFormsAndTreatments() {
    this.submiting = true
    this.disableAllInputs()
    let payload = this.makePayload()

    let manipulateFormTreatmentReq$ = this.api.handleFormTreatmentManipulation(payload)
    await lastValueFrom(manipulateFormTreatmentReq$)

    this.submiting = false
    this.enableAllInputs()

    this.openInfoSnackBar(Default_PT.ASSOCS_CREATED, Default_PT.INFO_BTN)
    this.modalController.dismiss()
  }

  enableAllInputs() {
    const inputs = document.querySelectorAll('input');

    inputs.forEach((input: HTMLInputElement) => {
      if (input.disabled) {
        input.disabled = false;
      }
    });
  }

  disableAllInputs() {
    const inputs = document.querySelectorAll('input');

    inputs.forEach((input: HTMLInputElement) => {
      if (!input.disabled) {
        input.disabled = true;
      }
    });
  }

  makePayload(): ManipulateFormTreatmentPayload {
    let payloadArr: FormTreatmentPayload[] = []
    let tabArr = this.mapToArray(this.tabs)

    for (const tab of tabArr) {
      if (tab.tab.tab_new_form) {
        let currPayload: FormTreatmentPayload = { type: 'new-form' }
        currPayload.form_structure = { ...tab.tab.form_structure }

        currPayload.client_id = this.client?.id
        currPayload.service_id = tab.tab.tab_service_id
        currPayload.assoc_event_id = this.eventId

        payloadArr.push(currPayload)

      } else if (tab.tab.tab_new_treatment) {
        let currPayload: FormTreatmentPayload = { type: 'new-treatment' }
        currPayload.form_structure = { ...tab.tab.form_structure }

        currPayload.client_id = this.client?.id
        currPayload.service_id = tab.tab.tab_service_id
        currPayload.assoc_event_id = this.eventId

        payloadArr.push(currPayload)

      } else if (tab.tab.tab_assoc_treatment) {
        let currPayload: FormTreatmentPayload = { type: 'assoc-treatment' }
        currPayload.assoc_event_id = this.eventId

        payloadArr.push(currPayload)
      }
    }

    return { payload: payloadArr }
  }


  openInfoSnackBar(content: string, btnContent: string) {
    const config = new MatSnackBarConfig();
    config.data = { content: content, btnContent: btnContent, duration: 3000 };
    this._snackBar.openFromComponent(InfoSnackBarComponent, config);
  }

  validate(): boolean {
    let tabArr = this.mapToArray(this.tabs)

    for (const tab of tabArr) {
      if (tab.tab.tab_assoc_treatment && tab.tab.tab_treatment_id === undefined) {
        return false;
      }

      if (
        (tab.tab.tab_new_treatment ||
          tab.tab.tab_new_form) &&
        !(
          tab.tab.form_structure.objective ||
          tab.tab.form_structure.hair_state ||
          tab.tab.form_structure.advised_treatment ||
          tab.tab.form_structure.product_tab ||
          tab.tab.form_structure.attachments
        )
      ) {
        return false;
      }

      if (!tab.tab.tab_assoc_treatment && !tab.tab.tab_new_treatment && !tab.tab.tab_new_form) {
        return false;
      }
    }

    return true;
  }
}
