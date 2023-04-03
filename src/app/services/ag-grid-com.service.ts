import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { CellData } from '../data/AgGridCellData';

@Injectable({
  providedIn: 'root'
})
export class AgGridComService {
  public CellSubject = new Subject<CellData>();

  public notifyCellValueChanged(data: CellData): void {
    this.CellSubject.next(data);
  }
}
