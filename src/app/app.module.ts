import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouteReuseStrategy } from '@angular/router';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { MaterialModule } from './material.module';

import { FullCalendarModule } from '@fullcalendar/angular';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AgGridModule } from 'ag-grid-angular';
import { HomeComponent } from './pages/home/home.component';
import { DesktopNavComponent } from './navigation/desktop-nav/desktop-nav.component';
import { DesktopHomeComponent } from './desktop/desktop-home/desktop-home.component';
import { MobileHomeComponent } from './mobile/mobile-home/mobile-home.component';
import { MobileNavComponent } from './navigation/mobile-nav/mobile-nav.component';
import { DeleteDialog, ClientActionsHolder, DesktopClientsComponent, NoActionsHolder } from './desktop/desktop-clients/desktop-clients.component';
import { MobileClientsComponent } from './mobile/mobile-clients/mobile-clients.component';
import { DesktopCreateEditClientModalComponent, MatchersDialog } from './modals/desktop-create-edit-client-modal/desktop-create-edit-client-modal.component';
import { ServiceActionsHolder, DesktopServicesComponent, DurationInputHolder, PriceInputHolder, SegementHolder } from './desktop/desktop-services/desktop-services.component';
import { InfoSnackBarComponent } from './partials/info-snack/info-snack.component';

import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { ErrorHandlingService } from './services/HTTPClient/error-handling.service';
import { MobileCreateEditEventModalComponent } from './modals/mobile-create-edit-event-modal/mobile-create-edit-event-modal.component';
import { DesktopCreateEditEventModalComponent } from './modals/desktop-create-edit-event-modal/desktop-create-edit-event-modal.component';

@NgModule({
  declarations: [
    AppComponent, HomeComponent,
    DesktopNavComponent, DesktopHomeComponent, DesktopClientsComponent,
    MobileNavComponent, MobileHomeComponent, MobileClientsComponent, MobileCreateEditEventModalComponent, DesktopCreateEditEventModalComponent,
    DesktopCreateEditClientModalComponent, InfoSnackBarComponent, DeleteDialog, DesktopServicesComponent,
    SegementHolder, PriceInputHolder, DurationInputHolder, ServiceActionsHolder, ClientActionsHolder, NoActionsHolder, MatchersDialog],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    Ng2SearchPipeModule,
    IonicModule,
    MaterialModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FullCalendarModule,
    AgGridModule,
    HttpClientModule,
    IonicModule.forRoot()
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorHandlingService,
      multi: true,
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
