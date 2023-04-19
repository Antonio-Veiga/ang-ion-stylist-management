import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { ModalController, NavParams } from '@ionic/angular';
import * as _ from 'lodash';
import { Default_PT } from 'src/app/defaults/langs/pt-pt/Defaults';
import { Client } from 'src/app/models/Client';
import { InfoSnackBarComponent } from 'src/app/partials/info-snack/info-snack.component';
import { APIService } from 'src/app/services/api/api.service';

@Component({
  selector: 'app-mobile-create-edit-client-modal',
  templateUrl: './mobile-create-edit-client-modal.component.html',
  styleUrls: ['./mobile-create-edit-client-modal.component.scss'],
})
export class MobileCreateEditClientModalComponent {

  public controlGroup!: FormGroup
  public modelTemplate!: Client
  public action: 'add' | 'edit' | 'none'
  public submiting = false
  public matchers: Client[] = []
  public defaultClient?: Client
  public componentTitle?: string

  constructor(private formBuilder: FormBuilder,
    public params: NavParams,
    private _snackBar: MatSnackBar,
    private api: APIService,
    public modalController: ModalController) {
    this.constructFormGroup()
    this.modelTemplate = { ...params.data['client'] }
    this.action = params.data['action']

    this.componentTitle = params.data['title']
    if (this.action == 'edit') { this.controlGroup.markAllAsTouched(); this.defaultClient = { ...params.data['client'] }; this.controlGroup.get('sex')?.disable(); }
  }

  constructFormGroup() {
    this.controlGroup = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(128), Validators.pattern(/^(?!\s)(?!.*\s{2,})(.*\S)?(?<!\s)$/)]],
      sex: ['', Validators.required],
      address: ['', [Validators.minLength(4), Validators.maxLength(128), Validators.pattern(/^(?!\s)(?!.*\s{2,})(.*\S)?(?<!\s)$/)]],
      phonenumber: ['', Validators.pattern(/^(9[1236]\d{7}|2(?:[12]\\d|3[1-8]|41|49|5[1-689]|6[1256]|7[1-35-8]|9[12])\d{6})|999999999$/)],
      birthdate: ['', [Validators.minLength(10), Validators.maxLength(10), Validators.pattern(/^(19[0-9]{2}|20[0-9]{2}|21[0-1][0-9])-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/)]],
      instagram: ['', [Validators.minLength(4), Validators.maxLength(128), Validators.pattern(/^(?!\s)(?!.*\s{2,})(.*\S)?(?<!\s)$/)]],
      facebook: ['', [Validators.minLength(4), Validators.maxLength(128), Validators.pattern(/^(?!\s)(?!.*\s{2,})(.*\S)?(?<!\s)$/)]]
    });
  }

  async submitForm() {
    /*
    if (this.controlGroup.valid) {
      this.submiting = true
      this.matchers = []
      if (await this.checkPNValidity() || await this.checkUserValidity()) {
        const matchersDiagRef = this._dialog.open(MatchersDialog, {
          data: {
            matches: this.matchers
          }
        })
  
        matchersDiagRef.afterClosed().subscribe(() => {
          if (matchersDiagRef.componentInstance.diagData.response) {
            this.handleAction()
          } else { this.submiting = false; this._self.disableClose = false }
        })
  
      } else {
        this.handleAction()
      }
  
    } else {
      this.openInfoSnackBar(Default_PT.INVALID_INPUT, Default_PT.INFO_BTN)
    }
          /* Should not be possible but... */
  }

  handleAction() {
    this.params.data['response'] = true
    if (this.action == 'add') { this.createClient() }
    if (this.action == 'edit') { this.editClient() }
  }

  createClient() {
    this.api.postClient(this.modelTemplate).subscribe((singleton) => {
      this.controlGroup.reset();
      this.controlGroup.enable();
      this.submiting = false;
      this.openInfoSnackBar(Default_PT.CLIENT_CREATED, Default_PT.INFO_BTN)
    })
  }

  editClient() {
    const filteredClient: Client = this.filterTemplate()
    this.api.editClient(filteredClient, this.modelTemplate.id).subscribe(() => {
      this.controlGroup.enable();
      this.controlGroup.get('sex')?.disable();
      this.submiting = false;
      this.openInfoSnackBar(Default_PT.CLIENT_EDITED, Default_PT.INFO_BTN)
    })
  }

  checkPNValidity(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const pnumber = this.controlGroup.get('phonenumber')?.value

      if (jQuery.isEmptyObject(pnumber)) { resolve(false); } else {
        this.api.getClientByPhonenumber(pnumber, this.modelTemplate.id).subscribe((wrapper) => {
          if (wrapper.data.length === 0) { resolve(false) } else {
            this.matchers = this.matchers.concat(wrapper.data)
            resolve(true)
          }
        })
      }
    })
  }

  checkUserValidity(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const cname = this.controlGroup.get('name')?.value

      /* kinda of an obsolete check, since name is required parameter for submission */
      if (jQuery.isEmptyObject(cname) || cname == undefined) { resolve(false) } else {
        this.api.getClientByName(cname, this.modelTemplate.id).subscribe((wrapper) => {
          if (wrapper.data.length === 0) { resolve(false) } else {
            this.matchers = this.matchers.concat(wrapper.data)
            resolve(true)
          }
        })
      }
    })
  }


  filterTemplate(): Client {
    let returnCl: Client = {}

    if (!jQuery.isEmptyObject(this.modelTemplate.name)) { returnCl.name = this.modelTemplate.name }
    if (!jQuery.isEmptyObject(this.modelTemplate.address)) { returnCl.address = this.modelTemplate.address }
    if (!jQuery.isEmptyObject(this.modelTemplate.phonenumber)) { returnCl.phonenumber = this.modelTemplate.phonenumber }
    if (!jQuery.isEmptyObject(this.modelTemplate.birthdate)) { returnCl.birthdate = this.modelTemplate.phonenumber }
    if (!jQuery.isEmptyObject(this.modelTemplate.facebook)) { returnCl.facebook = this.modelTemplate.facebook }
    if (!jQuery.isEmptyObject(this.modelTemplate.instagram)) { returnCl.instagram = this.modelTemplate.instagram }

    return returnCl
  }


  openInfoSnackBar(content: string, btnContent: string) {
    const config = new MatSnackBarConfig();
    config.data = { content: content, btnContent: btnContent, duration: 3000 };
    this._snackBar.openFromComponent(InfoSnackBarComponent, config);
  }


  changed(): boolean {
    return !(_.isEqual(this.defaultClient, this.modelTemplate))
  }
}
