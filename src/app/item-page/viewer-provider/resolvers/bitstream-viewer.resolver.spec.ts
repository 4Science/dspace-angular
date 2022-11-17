import { TestBed } from '@angular/core/testing';

import { BitstreamViewerResolver } from './bitstream-viewer.resolver';

describe('BitstreamViewerResolver', () => {
  let resolver: BitstreamViewerResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(BitstreamViewerResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
