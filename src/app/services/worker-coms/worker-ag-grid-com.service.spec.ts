import { TestBed } from '@angular/core/testing';

import { WorkerAgGridComService } from './worker-ag-grid-com.service';

describe('WorkerAgGridComService', () => {
  let service: WorkerAgGridComService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkerAgGridComService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
