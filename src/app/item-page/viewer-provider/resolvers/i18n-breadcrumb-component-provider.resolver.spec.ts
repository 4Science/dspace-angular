import { TestBed } from '@angular/core/testing';

import { I18nBreadcrumbComponentProviderResolver } from './i18n-breadcrumb-component-provider.resolver';

describe('I18nBreadcrumbComponentProviderResolver', () => {
  let resolver: I18nBreadcrumbComponentProviderResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(I18nBreadcrumbComponentProviderResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
