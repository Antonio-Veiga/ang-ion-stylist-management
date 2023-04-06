import { TestBed } from '@angular/core/testing';

import { ProcessableService } from './processable.service';

describe('ProcessableService', () => {
  let service: ProcessableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProcessableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
