import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ServiceCellData } from '../../data/AgGridServiceCellData';

@Injectable({
  providedIn: 'root'
})
export class AgGridComService {
  public CellSubject = new Subject<ServiceCellData>();

  public notifyCellValueChanged(data: ServiceCellData): void {
    this.CellSubject.next(data);
  }
}
