import { TestBed } from '@angular/core/testing';

import { MultipleChangesComService } from './multiple-changes-com.service';

describe('MultipleChangesComService', () => {
  let service: MultipleChangesComService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MultipleChangesComService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
