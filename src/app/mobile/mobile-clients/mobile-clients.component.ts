import { Component, OnInit } from '@angular/core';
import { AgGridUsable } from 'src/app/interfaces/Loadable';

@Component({
  selector: 'app-mobile-clients',
  templateUrl: './mobile-clients.component.html',
  styleUrls: ['./mobile-clients.component.scss'],
})
export class MobileClientsComponent implements OnInit, AgGridUsable {

  constructor() { }

  ngOnInit() { }


  async loadContent() {
    throw new Error('Method not implemented.');
  }
}
