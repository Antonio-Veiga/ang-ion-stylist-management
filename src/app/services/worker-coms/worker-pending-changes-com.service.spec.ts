import { TestBed } from '@angular/core/testing';

import { WorkerPendingChangesComService } from './worker-pending-changes-com.service';

describe('WorkerPendingChangesService', () => {
  let service: WorkerPendingChangesComService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkerPendingChangesComService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
