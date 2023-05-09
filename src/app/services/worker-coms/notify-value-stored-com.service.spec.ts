import { TestBed } from '@angular/core/testing';

import { NotifyValueStoredComService } from './notify-value-stored-com.service';

describe('NotifyValueStoredComService', () => {
  let service: NotifyValueStoredComService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotifyValueStoredComService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
