import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ServiceCellData } from 'src/app/data/AgGridServiceCellData';

@Injectable({
  providedIn: 'root'
})
export class MultipleChangesComService {
  private PendingChanges = new Map<number, ServiceCellData>();
  public PendingMapSubject = new Subject<Map<number, ServiceCellData>>();

  private notifyPendingMapChanged(data: Map<number, ServiceCellData>): void {
    this.PendingMapSubject.next(data);
  }

  public addPendingChange(cellId: number, data: ServiceCellData) {
    this.PendingChanges.set(cellId, data);
    this.notifyPendingMapChanged(this.PendingChanges);
  }

  public removePedingChange(cellId: number) {
    if (this.PendingChanges.has(cellId)) { this.PendingChanges.delete(cellId); this.notifyPendingMapChanged(this.PendingChanges); }
  }

  public clearPendingChanges() {
    this.PendingChanges.clear()
    this.notifyPendingMapChanged(this.PendingChanges)
  }
}
