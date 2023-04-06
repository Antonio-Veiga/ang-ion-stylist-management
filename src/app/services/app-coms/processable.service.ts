import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProcessableService {
  public _Processing = new Subject<boolean>();

  public notifyWhenProcessing(processing: boolean): void {
    this._Processing.next(processing);
  }
}
