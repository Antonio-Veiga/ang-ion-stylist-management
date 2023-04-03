import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AgGridComService {
  public durationValueChanged = new Subject<number>();
  public priceValueChanged = new Subject<number>();
  public activeValueChanged = new Subject<0 | 1>();
  public validValueChanged = new Subject<boolean>();

  public notifyDurationChanged(value: number): void {
    this.durationValueChanged.next(value);
  }

  public notifyPriceChanged(value: number): void {
    this.priceValueChanged.next(value);
  }

  public notifyActiveChanged(value: 0 | 1): void {
    this.activeValueChanged.next(value);
  }

  public notifyValidChanged(value: boolean): void {
    this.validValueChanged.next(value);
  }
}
