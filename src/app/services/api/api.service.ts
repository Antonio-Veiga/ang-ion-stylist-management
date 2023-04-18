import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CalendarEventWrapper } from '../../models/CalendarEventWrapper';
import { Observable } from 'rxjs';
import { LabelSettingsWrapper } from '../../models/LabelSettingsWrapper';
import { ClientWrapper } from '../../models/ClientWrapper';
import { ClientSingletonWrapper } from '../../models/ClientSingletonWrapper';
import { Client } from '../../models/Client';
import { ServiceWrapper } from '../../models/ServiceWrapper';
import { ServiceSingletonWrapper } from '../../models/ServiceSingletonWrapper';
import { Service } from '../../models/Service';
import { LabelGluesWrapper } from 'src/app/models/LabelGluesWrapper';

const ENDPOINT = 'http://192.168.2.198:8000/api/v1/';
const INCLUDE_LABEL = 'includeLabel=true';
const INCLUDE_SERVICE = 'includeService=true';
const INCLUDE_CLIENT = 'includeClient=true';
const WITH_GLUE = 'withGlue=true';
const ARRAY_ONLY = 'arrayOnly=true';
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

  getEvents(calendarId: number): Observable<CalendarEventWrapper> {
    return this.http.get<CalendarEventWrapper>(`${ENDPOINT}events?${INCLUDE_LABEL}&${INCLUDE_SERVICE}&${INCLUDE_CLIENT}&${CALENDAR_EQ}${calendarId}`, httpOptions)
  }

  getGluedLabels(calendarId: number) {
    return this.http.get<LabelGluesWrapper>(`${ENDPOINT}labels/glue?${CALENDAR_EQ}${calendarId}`, httpOptions);
  }

  getLabelSettings(userId: number, withGlue: boolean): Observable<LabelSettingsWrapper> {
    let req = `${ENDPOINT}labels/settings?${USER_EQ}${userId}`

    if (withGlue) { req += `&${WITH_GLUE}` }

    return this.http.get<LabelSettingsWrapper>(req, httpOptions);
  }

  getActiveClients(calendarId?: number): Observable<ClientWrapper> {
    let req = `clients?${DELETED_EQ}0`

    if (calendarId == 1) { req += `&${SEX_EQ}M` } else { req += `&${SEX_EQ}F` }

    return this.http.get<ClientWrapper>(`${ENDPOINT}${req}`, httpOptions);
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

  getServices(calendaId?: number): Observable<ServiceWrapper> {
    let req = `${ENDPOINT}services`

    if (calendaId) { req += `?${CALENDAR_EQ}${calendaId}` }

    return this.http.get<ServiceWrapper>(req, httpOptions)
  }

  patchService(service: Service, id: number): Observable<ServiceSingletonWrapper> {
    return this.http.patch<ServiceSingletonWrapper>(`${ENDPOINT}services/${id}`, service, httpOptions)
  }

  massAssignServices(service: ServiceWrapper): Observable<ServiceWrapper> {
    return this.http.patch<ServiceWrapper>(`${ENDPOINT}services/mass-patch`, service, httpOptions)
  }
  
}
