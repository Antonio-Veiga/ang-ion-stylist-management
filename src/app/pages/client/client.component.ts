import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Platform, ViewWillEnter } from '@ionic/angular';
import { DesktopClientsComponent } from 'src/app/desktop/desktop-clients/desktop-clients.component';
import { AgGridUsable } from 'src/app/interfaces/Loadable';
import { MobileClientsComponent } from 'src/app/mobile/mobile-clients/mobile-clients.component';
import { PlaceholderComponent } from 'src/app/placeholder/placeholder.component';

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss'],
})
export class ClientComponent implements ViewWillEnter, OnInit {
  platform!: Platform
  // component!: AgGridUsable
  component!: any
  childCached = false

  @ViewChild('ChildComponentRef', { read: ViewContainerRef, static: true }) public childRef!: ViewContainerRef

  constructor(platform: Platform) { this.platform = platform }

  ionViewWillEnter(): void {
    if (this.childCached) { this.component.loadContent() }
  }

  ngOnInit(): void {
    this.detectPlatform()
  }

  detectPlatform() {
    if (this.platform.is('mobile')) {
      this.component = this.childRef.createComponent(MobileClientsComponent).instance
      this.childCached = true
    } else {
      this.component = this.childRef.createComponent(PlaceholderComponent).instance

      // this.component = this.childRef.createComponent(DesktopClientsComponent).instance
      // this.childCached = true
    }
  }
}
