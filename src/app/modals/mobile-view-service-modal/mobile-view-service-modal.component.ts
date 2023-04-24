import { Component, OnInit } from '@angular/core';
import { NavParams } from '@ionic/angular';
import { Default_PT } from 'src/app/defaults/langs/pt-pt/Defaults';
import { Service } from 'src/app/models/Service';
import 'moment/locale/pt-br';

const moment = require('moment')
moment.locale('pt-br')

@Component({
  selector: 'app-mobile-view-service-modal',
  templateUrl: './mobile-view-service-modal.component.html',
  styleUrls: ['./mobile-view-service-modal.component.scss'],
})
export class MobileViewServiceModalComponent {
  public modalService!: Service
  public undefinedText = Default_PT.UNDEFINED
  public minutesText = Default_PT.MINUTES
  public priceText = Default_PT.EURO

  constructor(params: NavParams) { this.modalService = { ...params.data['service'], createdAt: moment(params.data['service'].createdAt).fromNow(), updatedAt: moment(params.data['service'].updatedAt).fromNow() } }
}
