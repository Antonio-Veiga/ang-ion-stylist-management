import { TestBed } from '@angular/core/testing';

import { AgGridComService } from './ag-grid-com.service';

describe('AgGridComService', () => {
  let service: AgGridComService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AgGridComService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
