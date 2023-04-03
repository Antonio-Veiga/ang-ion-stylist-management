import { Component, OnInit, inject, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { APIService } from 'src/app/services/api.service';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Client } from 'src/app/models/Client';
import * as jQuery from 'jquery';
import { InfoSnackBarComponent } from 'src/app/pieces/info-snack/info-snack.component';

export interface SnackBarData {
  content: string
  btnContent: string
}

export interface DialogData {
  header: string
  data?: Client
  response?: boolean
}

@Component({
  selector: 'app-desktop-create-edit-client-modal',
  templateUrl: './desktop-create-edit-client-modal.component.html',
  styleUrls: ['./desktop-create-edit-client-modal.component.scss'],
})
export class DesktopCreateEditClientModalComponent implements OnInit {
  ceForm!: FormGroup
  newClient!: any
  submiting = false
  type!: string

  model: any = {
    id: null,
    name: '',
    phonenumber: '',
    sex: '',
    birthdate: '',
    address: '',
    instagram: '',
    facebook: '',
  }

  constructor(private formBuilder: FormBuilder, public api: APIService, private _snackBar: MatSnackBar, public _dialog: MatDialog) {
    this.ceForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(128), Validators.pattern(/^(?!\s)(?!.*\s{2,})(.*\S)?(?<!\s)$/)]],
      sex: ['', Validators.required],
      address: ['', [Validators.minLength(4), Validators.maxLength(128), Validators.pattern(/^(?!\s)(?!.*\s{2,})(.*\S)?(?<!\s)$/)]],
      phonenumber: ['', Validators.pattern(/^(9[1236]\d{7}|2(?:[12]\\d|3[1-8]|41|49|5[1-689]|6[1256]|7[1-35-8]|9[12])\d{6})|999999999$/)],
      birthdate: ['', [Validators.minLength(10), Validators.maxLength(10), Validators.pattern(/^(19[0-9]{2}|20[0-9]{2}|21[0-1][0-9])-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/)]],
      instagram: ['', [Validators.minLength(4), Validators.maxLength(128), Validators.pattern(/^(?!\s)(?!.*\s{2,})(.*\S)?(?<!\s)$/)]],
      facebook: ['', [Validators.minLength(4), Validators.maxLength(128), Validators.pattern(/^(?!\s)(?!.*\s{2,})(.*\S)?(?<!\s)$/)]]
    });
  }

  ngOnInit() { if (this.type === "edit") { this.ceForm.markAllAsTouched(); } }

  submitCEForm() {
    if (this.ceForm.valid) {
      this.submiting = true
      this.ceForm.disable()
      this.newClient = {}

      if (!jQuery.isEmptyObject(this.ceForm.get('name')?.value)) { this.newClient.name = this.ceForm.get('name')!.value.trim() }
      if (!jQuery.isEmptyObject(this.ceForm.get('sex')?.value)) { this.newClient.sex = this.ceForm.get('sex')!.value.trim() }
      if (!jQuery.isEmptyObject(this.ceForm.get('address')?.value)) { this.newClient.address = this.ceForm.get('address')!.value.trim() }
      if (!jQuery.isEmptyObject(this.ceForm.get('phonenumber')?.value)) { this.newClient.phonenumber = this.ceForm.get('phonenumber')!.value.trim() }
      if (!jQuery.isEmptyObject(this.ceForm.get('birthdate')?.value)) { this.newClient.birthdate = this.ceForm.get('birthdate')!.value.trim() }
      if (!jQuery.isEmptyObject(this.ceForm.get('instagram')?.value)) { this.newClient.instagram = this.ceForm.get('instagram')!.value.trim() }
      if (!jQuery.isEmptyObject(this.ceForm.get('facebook')?.value)) { this.newClient.facebook = this.ceForm.get('facebook')!.value.trim() }

      if (this.newClient.phonenumber != undefined) {
        this.api.getClientByPhonenumber(this.newClient.phonenumber, this.model.id).subscribe(async (wrapper) => {
          if (wrapper.data.length === 0) { this.createClient(this.newClient); }
          else {
            let dialogData

            wrapper.data.length === 1 ? dialogData = {
              header: 'Existe um cliente com o mesmo número.',
              data: wrapper.data[0]
            } : dialogData = { header: 'Existem múltiplos clientes com este número.' }

            const ref = this.openDialog(dialogData)

            ref.afterClosed().subscribe(() => {
              if (ref.componentInstance.diagData.response) {
                this.createClient(this.newClient)
              } else {
                this.ceForm.enable()
                this.submiting = false
              }
            })
          }
        })
      } else {
        this.api.getClientByName(this.newClient.name, this.model.id).subscribe(async (wrapper) => {
          if (wrapper.data.length === 0) { this.createClient(this.newClient) }
          else {
            let dialogData

            wrapper.data.length === 1 ? dialogData = {
              header: 'Existe um cliente com o mesmo nome.',
              data: wrapper.data[0]
            } : dialogData = { header: 'Existem múltiplos clientes com este nome.' }

            const ref = this.openDialog(dialogData)

            ref.afterClosed().subscribe(() => {
              if (ref.componentInstance.diagData.response) {
                this.createClient(this.newClient)
              } else {
                this.ceForm.enable()
                this.submiting = false
              }
            })
          }
        })
      }
    } else { this.openInfoSnackBar('Oops algo de errado aconteceu!', 'Discartar') }
  }

  openDialog(data: DialogData) {
    const dialogRef = this._dialog.open(ConfirmDialog, {
      data: data
    });

    return dialogRef
  }

  createClient(newClient: Client) {
    if (this.type == 'create') {
      // create client logic

      this.api.postClient(newClient).subscribe((singleton) => {
        if (singleton.data) { this.ceForm.reset(); this.ceForm.enable(); this.submiting = false; this.openInfoSnackBar('Cliente criado com sucesso!', 'Discartar') }
      })
    } else {
      // edit client logic 

      this.api.editClient(newClient, this.model.id).subscribe((singleton) => {
        let edClient = singleton.data
        if (edClient) {
          this.ceForm.setValue({
            name: edClient.name,
            sex: edClient.sex,
            address: edClient.address,
            phonenumber: edClient.phonenumber,
            birthdate: edClient.birthdate,
            instagram: edClient.instagram,
            facebook: edClient.facebook,
          })
          this.ceForm.enable();
          this.submiting = false;
          this.openInfoSnackBar('Cliente editado com sucesso!', 'Discartar')
        }
      })
    }
  }

  openInfoSnackBar(content: string, btnContent: string) {
    const config = new MatSnackBarConfig();
    config.data = { content: content, btnContent: btnContent, duration: 3000 };
    this._snackBar.openFromComponent(InfoSnackBarComponent, config);
  }
}


@Component({
  selector: 'confirm-dialog',
  templateUrl: 'confirm-dialog.html',
})
export class ConfirmDialog {
  constructor(public dialogRef: MatDialogRef<ConfirmDialog>, @Inject(MAT_DIALOG_DATA) public diagData: DialogData) { }

  onCancelClick() {
    this.diagData.response = false
    this.dialogRef.close()
  }

  onConfirmClick() {
    this.diagData.response = true
    this.dialogRef.close()
  }
}

