import { Component, OnInit } from '@angular/core';
import { NavParams } from '@ionic/angular';
import { Default_PT } from 'src/app/defaults/langs/pt-pt/Defaults';
import { Client } from 'src/app/models/Client';

const moment = require('moment')

@Component({
  selector: 'app-mobile-view-client-modal',
  templateUrl: './mobile-view-client-modal.component.html',
  styleUrls: ['./mobile-view-client-modal.component.scss'],
})
export class MobileViewClientModalComponent implements OnInit {
  public modalClient!: Client
  public undefinedText = Default_PT.UNDEFINED

  constructor(params: NavParams) { this.modalClient = { ...params.data['client'], birthdate: moment(params.data['client'].birthdate).format('DD-MM-YYYY') } }

  ngOnInit() { }

}
