import { Component, OnInit } from '@angular/core';
import { AgGridUsable } from 'src/app/interfaces/Loadable';

@Component({
  selector: 'app-desktop-absences',
  templateUrl: './desktop-absences.component.html',
  styleUrls: ['./desktop-absences.component.scss'],
})
export class DesktopAbsencesComponent implements OnInit, AgGridUsable {

  constructor() { }

  loadContent(): void {
    this.onGridReady()
  }


  onGridReady(): void {

  }

  ngOnInit() { }

}
