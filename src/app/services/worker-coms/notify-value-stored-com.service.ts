import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { WorkerCellData } from 'src/app/data/AgGridWorkerCellData';

@Injectable()
export class NotifyValueStoredComService {
  public CellSubject = new Subject<WorkerCellData>();

  public notifyCellValueChanged(data: WorkerCellData): void {
    this.CellSubject.next(data);
  }
}
