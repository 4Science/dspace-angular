import { TestBed } from '@angular/core/testing';

import { ComponentProviderResolver } from './component-provider.resolver';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ComponentProviderResolver', () => {
  let resolver: ComponentProviderResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA]
    });
    resolver = new ComponentProviderResolver();
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
