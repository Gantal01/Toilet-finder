import { TestBed } from '@angular/core/testing';

import { GeocodeService } from '../services/geocode.service';

describe('GeocodeService', () => {
  let service: GeocodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeocodeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
