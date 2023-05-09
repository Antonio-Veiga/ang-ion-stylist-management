import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { WorkerCellData } from 'src/app/data/AgGridWorkerCellData';

@Injectable({
  providedIn: 'root'
})
export class WorkerAgGridComService {

  public CellSubject = new Subject<WorkerCellData>();

  public notifyCellValueChanged(data: WorkerCellData): void {
    this.CellSubject.next(data);
  }
}
