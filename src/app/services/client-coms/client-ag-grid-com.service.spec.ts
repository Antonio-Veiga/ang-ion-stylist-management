import { TestBed } from '@angular/core/testing';

import { ClientAgGridComService } from './client-ag-grid-com.service';

describe('ClientComService', () => {
  let service: ClientAgGridComService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClientAgGridComService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
