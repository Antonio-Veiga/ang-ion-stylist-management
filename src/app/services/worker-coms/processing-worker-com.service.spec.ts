import { TestBed } from '@angular/core/testing';

import { ProcessingWorkerComService } from './processing-worker-com.service';

describe('ProcessingWorkerComService', () => {
  let service: ProcessingWorkerComService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProcessingWorkerComService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
