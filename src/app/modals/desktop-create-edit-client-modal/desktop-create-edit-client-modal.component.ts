import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { APIService } from 'src/app/services/api/api.service';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Client } from 'src/app/models/Client';
import { InfoSnackBarComponent } from 'src/app/partials/info-snack/info-snack.component';
import { ClientDialogData } from 'src/app/interfaces/ClientDialogData';
import { Default_PT } from 'src/app/defaults/langs/pt-pt/Defaults';
import { ClientMatchersDialogData } from 'src/app/interfaces/ClientMatchersDialogData';
import { isEqual } from 'lodash';

@Component({
  selector: 'app-desktop-create-edit-client-modal',
  templateUrl: './desktop-create-edit-client-modal.component.html',
  styleUrls: ['./desktop-create-edit-client-modal.component.scss'],
})
export class DesktopCreateEditClientModalComponent {
  public controlGroup!: FormGroup
  public modelTemplate!: Client
  public action: 'add' | 'edit' | 'fast-add'
  public submiting = false
  public matchers: Client[] = []
  public defaultClient?: Client
  public componentTitle?: string

  public fastAddedClient?: Client

  constructor(private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public _data: ClientDialogData,
    public _self: MatDialogRef<DesktopCreateEditClientModalComponent>,
    public _dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private api: APIService) {
    this.constructFormGroup()
    this.modelTemplate = { ..._data.client }
    this.action = _data.action

    if (this.action == 'edit') { this.controlGroup.markAllAsTouched(); this.defaultClient = { ...this._data.client }; this.controlGroup.get('sex')?.disable(); this.componentTitle = Default_PT.EDIT_CLIENT } else { this.componentTitle = Default_PT.CREATE_CLIENT }
    if (this.action == 'fast-add') { this.controlGroup.get('sex')?.setValue(_data.predefined_sex!); this.modelTemplate.sex = _data.predefined_sex; this.controlGroup.get('sex')?.disable(); }
  }

  constructFormGroup() {
    this.controlGroup = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(128), Validators.pattern(/^\S(.*\S)?$/)]],
      sex: ['', Validators.required],
      address: ['', [Validators.minLength(4), Validators.maxLength(128), Validators.pattern(/^\S(.*\S)?$/)]],
      phonenumber: ['', Validators.pattern(/^(9[1236]\d{7}|2(?:[1-9]\d|3[1-8]|4[19]|5[1-689]|6[1256]|7[1-35-8]|9[12])\d{6})$|999999999/)],
      birthdate: ['', [Validators.minLength(10), Validators.maxLength(10), Validators.pattern(/^(19|20|21[0-1])\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/)]],
      instagram: ['', [Validators.minLength(4), Validators.maxLength(128), Validators.pattern(/^\S(.*\S)?$/)]],
      facebook: ['', [Validators.minLength(4), Validators.maxLength(128), Validators.pattern(/^\S(.*\S)?$/)]]
    });
  }

  async submitForm() {
    if (this.controlGroup.valid) {
      this.submiting = true
      this.controlGroup.disable()
      this._self.disableClose = true
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
      /* Should not be possible but... */
      this.openInfoSnackBar(Default_PT.INVALID_INPUT, Default_PT.INFO_BTN)
    }
  }

  handleAction() {
    this._data.response = true
    if (this.action == 'add') { this.createClient() }
    if (this.action == 'edit') { this.editClient() }
    if (this.action == 'fast-add') { this.createClient(true) }
  }

  createClient(afterClose: boolean = false) {
    this.api.postClient(this.modelTemplate).subscribe((singleton) => {
      if (this.action == 'fast-add') { this.fastAddedClient = singleton.data }
      this.controlGroup.reset();
      this.controlGroup.enable();
      this.submiting = false;
      this._self.disableClose = false
      this.openInfoSnackBar(Default_PT.CLIENT_CREATED, Default_PT.INFO_BTN)

      if (afterClose) { this._self.close() }
    })
  }

  editClient() {
    const filteredClient: Client = this.filterTemplate()
    this.api.editClient(filteredClient, this.modelTemplate.id).subscribe(() => {
      this.controlGroup.enable();
      this.controlGroup.get('sex')?.disable();
      this.submiting = false;
      this._self.disableClose = false
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
    if (!jQuery.isEmptyObject(this.modelTemplate.birthdate)) { returnCl.birthdate = this.modelTemplate.birthdate }
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
    return !(isEqual(this.defaultClient, this.modelTemplate))
  }
}

@Component({
  selector: 'app-matchers-dialog',
  templateUrl: './micro-components-views/matchers-dialog.component.html',
})
export class MatchersDialog {
  public matchedClients!: Client[]
  public dialogTitle = Default_PT.CLIENT_MATCHERS_TITLE
  public continueBtnText = Default_PT.CONTINUE_BUTTON_TEXT
  public cancelBtnText = Default_PT.CANCEL_BUTTON_TEXT
  public nameLabel = Default_PT.NAME
  public pnumberLabel = Default_PT.PHONE_NUMBER

  constructor(@Inject(MAT_DIALOG_DATA) public diagData: ClientMatchersDialogData,
    public _self: MatDialogRef<MatchersDialog>) { this.matchedClients = this.diagData.matches }


  continueAction() {
    this.diagData.response = true
    this._self.close()
  }

  cancelAction() {
    this.diagData.response = false
    this._self.close()
  }
}