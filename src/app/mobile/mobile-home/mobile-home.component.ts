import { Component, OnInit } from '@angular/core';
import { FCalendarUsable } from 'src/app/interfaces/Loadable';

@Component({
  selector: 'app-mobile-home',
  templateUrl: './mobile-home.component.html',
  styleUrls: ['./mobile-home.component.scss'],
})
export class MobileHomeComponent implements OnInit, FCalendarUsable {

  constructor() { }

  async setupCalendar() {
    throw new Error('Method not implemented.');
  }

  ngOnInit() { }

}
