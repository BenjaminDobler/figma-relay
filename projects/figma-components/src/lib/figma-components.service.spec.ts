import { TestBed } from '@angular/core/testing';

import { FigmaComponentsService } from './figma-components.service';

describe('FigmaComponentsService', () => {
  let service: FigmaComponentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FigmaComponentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
