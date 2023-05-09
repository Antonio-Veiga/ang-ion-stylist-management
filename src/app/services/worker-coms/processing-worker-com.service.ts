import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class ProcessingWorkerComService {
  public processing = new Subject<boolean>()

  public notifyWhenProcessing(isProcessing: boolean) {
    this.processing.next(isProcessing)
  }
}
