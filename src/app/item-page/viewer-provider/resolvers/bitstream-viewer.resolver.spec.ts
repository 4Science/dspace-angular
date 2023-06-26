import { TestBed } from '@angular/core/testing';

import { BitstreamViewerResolver } from './bitstream-viewer.resolver';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('BitstreamViewerResolver', () => {
  let resolver: BitstreamViewerResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA]
    });
    resolver = new BitstreamViewerResolver(undefined, undefined, undefined);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
