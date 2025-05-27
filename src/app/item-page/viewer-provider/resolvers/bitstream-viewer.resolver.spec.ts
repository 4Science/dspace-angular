import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { bitstreamViewerProviderResolver } from './bitstream-viewer.resolver';


describe('BitstreamViewerResolver', () => {
  let resolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
    });
    resolver = bitstreamViewerProviderResolver;
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
