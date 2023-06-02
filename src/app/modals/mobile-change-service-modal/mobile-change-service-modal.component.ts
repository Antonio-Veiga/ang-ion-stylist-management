import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavParams } from '@ionic/angular';
import { Default_PT } from 'src/app/defaults/langs/pt-pt/Defaults';
import * as _ from 'lodash'
import { ServiceCellData } from 'src/app/data/AgGridServiceCellData';
import { AgGridComService } from 'src/app/services/service-coms/ag-grid-com.service';

@Component({
  selector: 'app-mobile-change-service-modal',
  templateUrl: './mobile-change-service-modal.component.html',
  styleUrls: ['./mobile-change-service-modal.component.scss'],
})
export class MobileChangeServiceModalComponent implements AfterViewInit {
  public validator!: FormGroup
  public dataTemplate!: ServiceCellData

  public minutesText = Default_PT.MINUTES
  public priceText = Default_PT.EURO

  @ViewChild('durInput') public durInput?: HTMLInputElement
  @ViewChild('priceInput') public priceInput?: HTMLInputElement

  constructor(public params: NavParams, public formBuilder: FormBuilder, private agGridCom: AgGridComService) {
    this.dataTemplate = { ...this.params.data['service'] }

    this.validator = this.formBuilder.group({
      duration: ['', [Validators.required, Validators.pattern(/^(?:0|[1-9]\d{0,2}|1[0-3]\d{2}|14[0-3]\d|1440)$/)]],
      price: ['', [Validators.required, Validators.pattern(/^(0|[1-9]\d{0,2})((\.|,)\d{1,2})?$/)]],
    });

    this.validator.setValue({ duration: this.dataTemplate.duration, price: this.dataTemplate.price })
    this.validator.markAllAsTouched()
  }


  ngAfterViewInit(): void {
    this.validator.get('duration')?.valueChanges.subscribe((value) => {
      if (this.durInput?.value != value) {
        this.durInput!.value = value
        this.validator.patchValue({ duration: value })
        this.dataTemplate.duration = value

        if (this.validator.valid) {
          const dataToSend = { ...this.dataTemplate };
          delete dataToSend.name;
          this.agGridCom.notifyCellValueChanged(dataToSend);
        }
      }
    })

    this.validator.get('price')?.valueChanges.subscribe((value) => {
      if (this.priceInput?.value != value) {
        this.priceInput!.value = value
        this.validator.patchValue({ price: value })
        this.dataTemplate.price = value


        if (this.validator.valid) {
          const dataToSend = { ...this.dataTemplate };
          delete dataToSend.name;
          this.agGridCom.notifyCellValueChanged(dataToSend);
        }
      }
    })
  }
}
