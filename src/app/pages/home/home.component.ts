import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Platform, ViewWillEnter, ViewWillLeave } from '@ionic/angular';
import { DesktopHomeComponent } from 'src/app/desktop/desktop-home/desktop-home.component';
import { FCalendarUsable } from 'src/app/interfaces/Loadable';
import { MobileHomeComponent } from 'src/app/mobile/mobile-home/mobile-home.component';
import { PlaceholderComponent } from 'src/app/placeholder/placeholder.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements ViewWillEnter, ViewWillLeave, OnInit {
  platform!: Platform
  // component!: FCalendarUsable
  component!: any
  childCached = false

  @ViewChild('ChildComponentRef', { read: ViewContainerRef, static: true }) public childRef!: ViewContainerRef

  constructor(platform: Platform) { this.platform = platform; }

  ionViewWillLeave(): void {
    if (this.component.currentSnackBarRef) { this.component.currentSnackBarRef.dismiss() }
  }

  ionViewWillEnter(): void {
    if (this.childCached) { this.component.setupCalendar(); }
  }

  ngOnInit(): void {
    this.detectPlatform()
  }

  detectPlatform() {
    if (this.platform.is('mobile')) {
      this.component = this.childRef.createComponent(MobileHomeComponent).instance
      this.childCached = true
    } else {
      this.component = this.childRef.createComponent(PlaceholderComponent).instance
      // this.component = this.childRef.createComponent(DesktopHomeComponent).instance
      // this.childCached = true
    }
  }
}