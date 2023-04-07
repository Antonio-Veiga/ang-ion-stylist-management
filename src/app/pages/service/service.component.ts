import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Platform } from '@ionic/angular';
import { DesktopServicesComponent } from 'src/app/desktop/desktop-services/desktop-services.component';
import { AgGridUsable } from 'src/app/interfaces/Loadable';
import { MobileServicesComponent } from 'src/app/mobile/mobile-services/mobile-services.component';

@Component({
  selector: 'app-service',
  templateUrl: './service.component.html',
  styleUrls: ['./service.component.scss'],
})
export class ServiceComponent implements OnInit {
  platform!: Platform
  childCached = false
  component!: AgGridUsable

  @ViewChild('ChildComponentRef', { read: ViewContainerRef, static: true }) public childRef!: ViewContainerRef

  constructor(platform: Platform) { this.platform = platform; console.log("Constructed SERVICE (1).") }

  ionViewWillEnter(): void { if (this.childCached) { this.component.loadContent(); console.log("Cached SERVICE (2).") } }

  ngOnInit(): void {
    this.detectPlatform()
  }

  detectPlatform() {
    if ((this.platform.is('ios') && !this.platform.is('ipad')) || this.platform.is('android')) {
      this.component = this.childRef.createComponent(MobileServicesComponent).instance
      this.childCached = true
    } else {
      this.component = this.childRef.createComponent(DesktopServicesComponent).instance
      this.childCached = true
    }
  }
}
