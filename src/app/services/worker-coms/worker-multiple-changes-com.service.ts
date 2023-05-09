import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { WorkerNormalizedData } from 'src/app/data/WorkerNormalizedChanges';

@Injectable()
export class WorkerMultipleChangesComService {
  private PendingChanges = new Map<number, WorkerNormalizedData>();
  public PendingMapSubject = new Subject<Map<number, WorkerNormalizedData>>();

  private notifyPendingMapChanged(data: Map<number, WorkerNormalizedData>): void {
    this.PendingMapSubject.next(data);
  }

  public addPendingChange(cellId: number, data: WorkerNormalizedData) {
    this.PendingChanges.set(cellId, data);
    this.notifyPendingMapChanged(this.PendingChanges);
  }

  public removePedingChange(cellId: number) {
    if (this.PendingChanges.has(cellId)) { this.PendingChanges.delete(cellId); this.notifyPendingMapChanged(this.PendingChanges); }
  }

  public getPendingValue(cellId: number): WorkerNormalizedData | undefined {
    return this.PendingChanges.get(cellId);
  }

  public clearPendingChanges() {
    this.PendingChanges.clear()
    this.notifyPendingMapChanged(this.PendingChanges)
  }
}
