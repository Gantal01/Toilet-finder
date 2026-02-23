import { TestBed } from '@angular/core/testing';

import { TagDictionaryService } from './tag-dictionary.service';

describe('TagDictionaryService', () => {
  let service: TagDictionaryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TagDictionaryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
