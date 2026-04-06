import { TestBed } from '@angular/core/testing';

import { MarkerManagerService } from './marker-manager.service';

describe('MarkerManagerService', () => {
  let service: MarkerManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MarkerManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
