import { Component, OnInit } from '@angular/core';
import { AgGridUsable } from 'src/app/interfaces/Loadable';

@Component({
  selector: 'app-mobile-services',
  templateUrl: './mobile-services.component.html',
  styleUrls: ['./mobile-services.component.scss'],
})
export class MobileServicesComponent implements OnInit, AgGridUsable {

  constructor() { }

  loadContent(): void {
    throw new Error('Method not implemented.');
  }

  ngOnInit() { }

}
