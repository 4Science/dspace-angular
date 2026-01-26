/**
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */

import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AuthorizationDataService } from '../../../core/data/feature-authorization/authorization-data.service';
import { AuthorizationDataServiceStub } from '../../testing/authorization-service.stub';
import { MetadataCmsMenuProvider } from './metadata-cms.menu';

describe('MetadataCmsMenuProvider', () => {

  let provider: MetadataCmsMenuProvider;
  let authorizationServiceStub = new AuthorizationDataServiceStub();

  beforeEach(() => {
    spyOn(authorizationServiceStub, 'isAuthorized').and.returnValue(
      of(true),
    );
    TestBed.configureTestingModule({
      providers: [
        MetadataCmsMenuProvider,
        { provide: AuthorizationDataService, useValue: authorizationServiceStub },
      ],
    });
    provider = TestBed.inject(MetadataCmsMenuProvider);
  });

  it('should be created', () => {
    expect(provider).toBeTruthy();
  });
});
