import { TestBed } from '@angular/core/testing';

import { WorkerMultipleChangesComService } from './worker-multiple-changes-com.service';

describe('WorkerMultipleChangesComService', () => {
  let service: WorkerMultipleChangesComService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkerMultipleChangesComService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
