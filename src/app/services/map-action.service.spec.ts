import { TestBed } from '@angular/core/testing';

import { MapActionService } from './map-action.service';

describe('MapActionService', () => {
  let service: MapActionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapActionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
