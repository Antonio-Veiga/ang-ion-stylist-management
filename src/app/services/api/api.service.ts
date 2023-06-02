import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CalendarEventWrapper } from '../../models/CalendarEventWrapper';
import { Observable } from 'rxjs';
import { ClientWrapper } from '../../models/ClientWrapper';
import { ClientSingletonWrapper } from '../../models/ClientSingletonWrapper';
import { Client } from '../../models/Client';
import { ServiceWrapper } from '../../models/ServiceWrapper';
import { ServiceSingletonWrapper } from '../../models/ServiceSingletonWrapper';
import { Service } from '../../models/Service';
import { LabelGluesWrapper } from 'src/app/models/LabelGluesWrapper';
import { LabelWrapper } from 'src/app/models/LabelWrapper';
import { Label } from 'src/app/models/Label';
import { LabelSingletonWrapper } from 'src/app/models/LabelSingletonWrapper';
import { LabelRemovalPayload } from 'src/app/models/payloads/HandleLabelRemovalPayload';
import { LabelGluePayload } from 'src/app/models/payloads/HandleMassPostLabelGluePayload';
import { CalendarWrapper } from 'src/app/models/CalendarWrapper';
import { AddLabelPayload } from 'src/app/models/payloads/HandleLabelCreation';
import { PredefinedEventSingletonWrapper } from 'src/app/models/PredefinedEventSingletonWrapper';
import { PredefinedEventPayload } from 'src/app/models/payloads/HandlePredefinedEventCreation';
import { EventPayload } from 'src/app/models/payloads/HandleEventCreation';
import { GenericCalendarEventWrapper } from 'src/app/models/GenericCalendarEventWrapper';
import { CalendarEvent } from 'src/app/models/CalendarEvent';
import { CalendarEventSingletonWrapper } from 'src/app/models/CalendarEventSingletonWrapper';
import { PredefinedEventEditPayload } from 'src/app/models/payloads/HandlePredefinedEventEdit';
import { HolidayWrapper } from 'src/app/models/HolidayWrapper';
import { ManipulateFormTreatmentPayload } from 'src/app/models/payloads/HandleMultipleFormTreatmentManipulation';
import { FormSingletonWrapper } from 'src/app/models/FormSingletonWrapper';
import { AdvisedTreatmentWrapper } from 'src/app/models/AdvisedTreatmentWrapper';
import { HairStateWrapper } from 'src/app/models/HairStateWrapper';
import { ProductWrapper } from 'src/app/models/ProductWrapper';
import { PredefinedEventEditDefinitivePayload } from 'src/app/models/payloads/HandlePredefinedEventEditDefinitive';

// const ENDPOINT = 'http://192.168.2.196:8000/api/v1/';
// const ENDPOINT = 'https://testing-area.doctorphone.online/management/laravel-api/api/v1/';
const ENDPOINT = 'https://api.backoffice.doctorphone.online/management-apis/hugooliveira/api/v1/'
const INCLUDE_LABEL = 'includeLabel=true';
const INCLUDE_SERVICES = 'includeServices=true';
const INCLUDE_CLIENT = 'includeClient=true';
const INCLUDE_CALENDARS = 'includeCalendars=true';
const WITH_GLUE = 'withGlue=true';
const ACTIVE_EQ = 'active[eq]='
const CALENDAR_EQ = 'calendarId[eq]=';
const NAME_EQ = 'name[eq]=';
const DELETED_EQ = 'deleted[eq]=';
const ID_DIFF = 'id[dif]=';
const PHONE_EQ = 'phonenumber[eq]=';
const USER_EQ = 'userId[eq]=';
const SEX_EQ = 'sex[eq]=';
const TIME_GT = 'time[gt]=';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  }),
};
@Injectable({
  providedIn: 'root'
})
export class APIService {

  constructor(private http: HttpClient) { }

  getCalendars(): Observable<CalendarWrapper> {
    return this.http.get<CalendarWrapper>(`${ENDPOINT}calendars`, httpOptions)
  }

  getEvents(calendarId: number): Observable<CalendarEventWrapper> {
    return this.http.get<CalendarEventWrapper>(`${ENDPOINT}events?${INCLUDE_LABEL}&${INCLUDE_SERVICES}&${INCLUDE_CLIENT}&${CALENDAR_EQ}${calendarId}`, httpOptions)
  }

  getAllEvents(calendarId: number): Observable<GenericCalendarEventWrapper> {
    return this.http.get<GenericCalendarEventWrapper>(`${ENDPOINT}events/get-all-events?calendarId=${calendarId}`, httpOptions)
  }

  getLabels() {
    return this.http.get<LabelWrapper>(`${ENDPOINT}labels?${INCLUDE_CALENDARS}`, httpOptions)
  }

  patchLabel(label: Label, id: number): Observable<LabelSingletonWrapper> {
    return this.http.patch<LabelSingletonWrapper>(`${ENDPOINT}labels/${id}`, label, httpOptions)
  }

  getGluedLabels(calendarId: number): Observable<LabelGluesWrapper> {
    return this.http.get<LabelGluesWrapper>(`${ENDPOINT}labels/glue?${CALENDAR_EQ}${calendarId}`, httpOptions);
  }

  getActiveClients(calendarId?: number): Observable<ClientWrapper> {
    let req = `clients?${DELETED_EQ}0`

    if (calendarId == 1) { req += `&${SEX_EQ}M` } else if (calendarId) { req += `&${SEX_EQ}F` }

    return this.http.get<ClientWrapper>(`${ENDPOINT}${req}`, httpOptions);
  }

  getForm(form_id: number): Observable<FormSingletonWrapper> {
    return this.http.get<FormSingletonWrapper>(`${ENDPOINT}forms/get-one?id=${form_id}`, httpOptions)
  }

  getDeletedClients(): Observable<ClientWrapper> {
    return this.http.get<ClientWrapper>(`${ENDPOINT}clients?${DELETED_EQ}1`, httpOptions);
  }

  getClientByName(name: string, id?: number): Observable<ClientWrapper> {
    let req = `${ENDPOINT}clients?${NAME_EQ}${name}`
    if (id) { req += `&${ID_DIFF}${id}` }

    return this.http.get<ClientWrapper>(req, httpOptions);
  }

  getClientByPhonenumber(phonenumber: string, id?: number): Observable<ClientWrapper> {
    let req = `${ENDPOINT}clients?${PHONE_EQ}${phonenumber}`
    if (id) { req += `&${ID_DIFF}${id}` }

    return this.http.get<ClientWrapper>(req, httpOptions);
  }

  postClient(client: Client): Observable<ClientSingletonWrapper> {
    return this.http.post<ClientSingletonWrapper>(`${ENDPOINT}clients`, client, httpOptions)
  }

  editClient(client: Client, id?: number): Observable<ClientSingletonWrapper> {
    return this.http.patch<ClientSingletonWrapper>(`${ENDPOINT}clients/${id}`, client, httpOptions)
  }

  deleteClient(id?: number): Observable<ClientSingletonWrapper> {
    return this.http.delete<ClientSingletonWrapper>(`${ENDPOINT}clients/${id}`, httpOptions)
  }

  getServices(calendaId?: number, active?: boolean): Observable<ServiceWrapper> {
    let req = `${ENDPOINT}services`
    let addSymbol = '?'

    if (calendaId) { req += `?${CALENDAR_EQ}${calendaId}`; addSymbol = '&' }

    if (active) { req += `${addSymbol}${ACTIVE_EQ}1` }

    return this.http.get<ServiceWrapper>(req, httpOptions)
  }

  postLabel(payload: AddLabelPayload) {
    return this.http.post<LabelWrapper>(`${ENDPOINT}labels/create-labels-and-glue`, payload, httpOptions)
  }

  patchService(service: Service, id: number): Observable<ServiceSingletonWrapper> {
    return this.http.patch<ServiceSingletonWrapper>(`${ENDPOINT}services/${id}`, service, httpOptions)
  }

  patchLabelRemoval(payload: LabelRemovalPayload[]): Observable<LabelGluesWrapper> {
    return this.http.patch<LabelGluesWrapper>(`${ENDPOINT}labels/mass-removal`, payload, httpOptions)
  }

  postEvent(payload: EventPayload): Observable<CalendarEventSingletonWrapper> {
    return this.http.post<CalendarEventSingletonWrapper>(`${ENDPOINT}events/create-one`, payload, httpOptions)
  }

  handleFormTreatmentManipulation(payload: ManipulateFormTreatmentPayload): Observable<any> {
    return this.http.post<any>(`${ENDPOINT}form-treatment/handle-multiple`, payload, httpOptions)
  }

  postPredefinedEvent(payload: PredefinedEventPayload): Observable<PredefinedEventSingletonWrapper> {
    return this.http.post<PredefinedEventSingletonWrapper>(`${ENDPOINT}events/predefined/create-one`, payload, httpOptions)
  }

  massPostLabelGlue(payload: LabelGluePayload[]): Observable<LabelGluesWrapper> {
    return this.http.post<LabelGluesWrapper>(`${ENDPOINT}labels/glue/mass-post`, payload, httpOptions)
  }

  deleteEvent(id: number): Observable<CalendarEvent> {
    return this.http.delete<CalendarEvent>(`${ENDPOINT}events/delete?id=${id}`, httpOptions)
  }

  deleteSinglePredefinedEvent(id: number, restriction: string) {
    return this.http.delete<CalendarEvent>(`${ENDPOINT}events/predefined/add-restriction?id=${id}&restriction_date=${restriction}`, httpOptions)
  }

  massAssignServices(service: ServiceWrapper): Observable<ServiceWrapper> {
    return this.http.patch<ServiceWrapper>(`${ENDPOINT}services/mass-patch`, service, httpOptions)
  }

  editEvent(payload: EventPayload, id: number): Observable<CalendarEventSingletonWrapper> {
    return this.http.patch<CalendarEventSingletonWrapper>(`${ENDPOINT}events/edit-one?id=${id}`, payload, httpOptions)
  }

  editPredefinedEvent(payload: PredefinedEventEditPayload, id: number): Observable<CalendarEventSingletonWrapper> {
    return this.http.patch<CalendarEventSingletonWrapper>(`${ENDPOINT}events/predefined/edit-one?id=${id}`, payload, httpOptions)
  }

  getHolidays(minSearchData: number, maxSearchDate: number): Observable<HolidayWrapper> {
    return this.http.get<HolidayWrapper>(`${ENDPOINT}holidays/get-all-holidays?min_date=${minSearchData}&max_date=${maxSearchDate}`, httpOptions)
  }

  getAllAdvisedTreatments(): Observable<AdvisedTreatmentWrapper> {
    return this.http.get<AdvisedTreatmentWrapper>(`${ENDPOINT}advised-treatments/get-all`, httpOptions)
  }

  getAllHairStates(): Observable<HairStateWrapper> {
    return this.http.get<HairStateWrapper>(`${ENDPOINT}hair-states/get-all`, httpOptions)
  }

  getAllProducts(): Observable<ProductWrapper> {
    return this.http.get<ProductWrapper>(`${ENDPOINT}products/get-all`, httpOptions)
  }

  deletePredefinedEvent(id: number): Observable<PredefinedEventSingletonWrapper> {
    return this.http.delete<PredefinedEventSingletonWrapper>(`${ENDPOINT}events/predefined/delete-one?id=${id}`, httpOptions)
  }

  editPredefinedEventDefinitive(payload: PredefinedEventEditDefinitivePayload): Observable<PredefinedEventSingletonWrapper> {
    return this.http.patch<PredefinedEventSingletonWrapper>(`${ENDPOINT}events/predefined/edit-one-definitive`, payload, httpOptions)
  }
}