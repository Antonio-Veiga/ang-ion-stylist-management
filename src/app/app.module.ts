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
import { MobileCreateEditClientModalComponent } from './modals/mobile-create-edit-client-modal/mobile-create-edit-client-modal.component';
import { MobileViewClientModalComponent } from './modals/mobile-view-client-modal/mobile-view-client-modal.component';
import { MobileServicesComponent, ServiceNameHolder } from './mobile/mobile-services/mobile-services.component';
import { MobileViewServiceModalComponent } from './modals/mobile-view-service-modal/mobile-view-service-modal.component';
import { MobileChangeServiceModalComponent } from './modals/mobile-change-service-modal/mobile-change-service-modal.component';
import { MobileViewEventModalComponent } from './modals/mobile-view-event-modal/mobile-view-event-modal.component';
import { DesktopViewEventModalComponent } from './modals/desktop-view-event-modal/desktop-view-event-modal.component';
import { DesktopManageWorkersModalComponent, WorkerActionsHolder, WorkerNameInputSelector, WorkersCalendarSelector, WorkersColorSelector } from './modals/desktop-manage-workers-modal/desktop-manage-workers-modal.component';
import { PendingChangesComponent } from './modals/desktop-manage-workers-modal/sub-components/pending-changes/pending-changes.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { DesktopCreateWorkerModalComponent } from './modals/desktop-create-worker-modal/desktop-create-worker-modal.component';
import { MobileManageWorkersModalComponent } from './modals/mobile-manage-workers-modal/mobile-manage-workers-modal.component';
import { MobileCreateWorkerModalComponent } from './modals/mobile-create-worker-modal/mobile-create-worker-modal.component';
import { MobileCreateEditPredefinedEventModalComponent } from './modals/mobile-create-edit-predefined-event-modal/mobile-create-edit-predefined-event-modal.component';
import { MobileAbsencesComponent } from './mobile/mobile-absences/mobile-absences.component';
import { DesktopAbsencesComponent } from './desktop/desktop-absences/desktop-absences.component';
import { AbsenceComponent } from './pages/absence/absence.component';
import { MobileManageFormTreatmentManipulationComponent } from './modals/mobile-manage-form-treatment-manipulation/mobile-manage-form-treatment-manipulation.component';
import { MobileFillFormComponent } from './modals/mobile-fill-form/mobile-fill-form.component';

// forced install only available for Angular 14
import { FileUploadModule } from 'ng2-file-upload';
import { ImageViewerModule } from "ngx-image-viewer";


import { Camera } from '@ionic-native/camera/ngx';
import { ManageWorkerHelperViewComponent } from './modals/mobile-manage-workers-modal/small-screen-helper-components/manage-worker-helper-view/manage-worker-helper-view.component';

@NgModule({
  declarations: [
    AppComponent, HomeComponent,
    DesktopNavComponent, DesktopHomeComponent, DesktopClientsComponent, MobileViewClientModalComponent, MobileServicesComponent, MobileViewServiceModalComponent,
    MobileNavComponent, MobileHomeComponent, MobileClientsComponent, MobileCreateEditEventModalComponent, DesktopCreateEditEventModalComponent,
    DesktopCreateEditClientModalComponent, InfoSnackBarComponent, DeleteDialog, DesktopServicesComponent, MobileCreateEditClientModalComponent, ServiceNameHolder,
    SegementHolder, PriceInputHolder, DurationInputHolder, ServiceActionsHolder, ClientActionsHolder, NoActionsHolder, MatchersDialog, MobileChangeServiceModalComponent,
    MobileViewEventModalComponent, DesktopViewEventModalComponent, DesktopManageWorkersModalComponent, MobileManageWorkersModalComponent, WorkerActionsHolder, WorkerNameInputSelector,
    WorkersColorSelector, WorkersCalendarSelector, PendingChangesComponent, DesktopCreateWorkerModalComponent, MobileCreateWorkerModalComponent, MobileCreateEditPredefinedEventModalComponent,
    AbsenceComponent, MobileAbsencesComponent, DesktopAbsencesComponent, MobileManageFormTreatmentManipulationComponent, MobileFillFormComponent, ManageWorkerHelperViewComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    Ng2SearchPipeModule,
    IonicModule,
    MaterialModule,
    CommonModule,
    FormsModule,
    FileUploadModule,
    ReactiveFormsModule,
    FullCalendarModule,
    AgGridModule,
    NgSelectModule,
    HttpClientModule,
    IonicModule.forRoot(),
    ImageViewerModule.forRoot()
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorHandlingService,
      multi: true,
    },
    Camera
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
