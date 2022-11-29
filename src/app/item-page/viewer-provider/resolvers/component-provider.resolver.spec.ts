import { TestBed } from '@angular/core/testing';

import { ComponentProviderResolver } from './component-provider.resolver';

describe('ComponentProviderResolver', () => {
  let resolver: ComponentProviderResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(ComponentProviderResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
