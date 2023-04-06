import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ClientCellData } from 'src/app/data/AgGridClientCellData';

@Injectable({
  providedIn: 'root'
})
export class ClientAgGridComService {
  public CellSubject = new Subject<ClientCellData>();

  public notifyCellValueChanged(data: ClientCellData): void {
    this.CellSubject.next(data);
  }
}