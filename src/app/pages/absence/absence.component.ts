import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Platform } from '@ionic/angular';
import { DesktopAbsencesComponent } from 'src/app/desktop/desktop-absences/desktop-absences.component';
import { AgGridUsable } from 'src/app/interfaces/Loadable';
import { MobileAbsencesComponent } from 'src/app/mobile/mobile-absences/mobile-absences.component';
import { PlaceholderComponent } from 'src/app/placeholder/placeholder.component';

@Component({
  selector: 'app-absence',
  templateUrl: './absence.component.html',
  styleUrls: ['./absence.component.scss'],
})
export class AbsenceComponent implements OnInit {
  platform!: Platform
  // component!: AgGridUsable
  component!: any
  childCached = false

  @ViewChild('ChildComponentRef', { read: ViewContainerRef, static: true }) public childRef!: ViewContainerRef

  constructor(platform: Platform) { this.platform = platform; }

  ionViewWillEnter(): void {
    if (this.childCached) { this.component.loadContent(); }
  }

  ngOnInit(): void {
    this.detectPlatform()
  }

  detectPlatform() {
    this.component = this.childRef.createComponent(PlaceholderComponent).instance
    this.childCached = true

    // if (this.platform.is('mobile')) {
    //   this.component = this.childRef.createComponent(MobileAbsencesComponent).instance
    //   this.childCached = true
    // } else {
    //   this.component = this.childRef.createComponent(DesktopAbsencesComponent).instance
    //   this.childCached = true
    // }
  }
}
