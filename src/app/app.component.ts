import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { DesktopNavComponent } from './navigation/desktop-nav/desktop-nav.component';
import { MobileNavComponent } from './navigation/mobile-nav/mobile-nav.component';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  navComponent: any
  constructor(platform: Platform) { platform.is('mobile') ? this.navComponent = MobileNavComponent : this.navComponent = DesktopNavComponent }
}
