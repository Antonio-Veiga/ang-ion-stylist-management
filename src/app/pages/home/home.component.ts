import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Platform, ViewWillEnter } from '@ionic/angular';
import { DesktopHomeComponent } from 'src/app/desktop/desktop-home/desktop-home.component';
import { FCalendarUsable } from 'src/app/interfaces/Loadable';
import { MobileHomeComponent } from 'src/app/mobile/mobile-home/mobile-home.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements ViewWillEnter, OnInit {
  platform!: Platform
  component!: FCalendarUsable
  childCached = false

  @ViewChild('ChildComponentRef', { read: ViewContainerRef, static: true }) public childRef!: ViewContainerRef

  constructor(platform: Platform) { this.platform = platform; }

  ionViewWillEnter(): void {
    if (this.childCached) { this.component.setupCalendar() }
  }

  ngOnInit(): void {
    this.detectPlatform()
  }

  detectPlatform() {
    if (this.platform.is('ios') || this.platform.is('android')) {
      this.component = this.childRef.createComponent(MobileHomeComponent).instance
      this.childCached = true
    } else {
      this.component = this.childRef.createComponent(DesktopHomeComponent).instance
      this.childCached = true
    }
  }
}