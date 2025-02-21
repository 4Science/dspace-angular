import { TestBed } from '@angular/core/testing';
import {
  Router,
  UrlTree,
} from '@angular/router';
import {
  Observable,
  of as observableOf,
} from 'rxjs';
import { AuthService } from '@dspace/core';
import { AuthorizationDataService } from '@dspace/core';
import { FeatureID } from '@dspace/core';

import { BitstreamDataService } from '@dspace/core';
import { Bitstream } from '@dspace/core';
import { createSuccessfulRemoteDataObject$ } from '@dspace/core';
import { bitstreamPageAuthorizationsGuard } from './bitstream-page-authorizations.guard';

describe('bitstreamPageAuthorizationsGuard', () => {
  let authorizationService: AuthorizationDataService;
  let authService: AuthService;
  let router: Router;
  let route;
  let parentRoute;
  let bitstreamService: BitstreamDataService;
  let bitstream: Bitstream;
  let uuid = '1234-abcdef-54321-fedcba';
  let bitstreamSelfLink = 'test.url/1234-abcdef-54321-fedcba';

  beforeEach(() => {
    authorizationService = jasmine.createSpyObj('authorizationService', {
      isAuthorized: observableOf(true),
    });
    router = jasmine.createSpyObj('router', {
      parseUrl: {},
      navigateByUrl: undefined,
    });
    authService = jasmine.createSpyObj('authService', {
      isAuthenticated: observableOf(true),
    });

    parentRoute = {
      params: {
        id: '3e1a5327-dabb-41ff-af93-e6cab9d032f0',
      },
    };
    route = {
      params: {},
      parent: parentRoute,
    };
    bitstream = new Bitstream();
    bitstream.uuid = uuid;
    bitstream._links = { self: { href: bitstreamSelfLink }  } as any;
    bitstreamService = jasmine.createSpyObj('bitstreamService', { findById: createSuccessfulRemoteDataObject$(bitstream) });

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthorizationDataService, useValue: authorizationService },
        { provide: Router, useValue: router },
        { provide: AuthService, useValue: authService },
        { provide: BitstreamDataService, useValue: bitstreamService },
      ],
    });
  });

  it('should call authorizationService.isAuthorized with the appropriate arguments', (done) => {
    const result$ = TestBed.runInInjectionContext(() => {
      return bitstreamPageAuthorizationsGuard(route, { url: 'current-url' } as any);
    }) as Observable<boolean | UrlTree>;

    result$.subscribe((result) => {
      expect(authorizationService.isAuthorized).toHaveBeenCalledWith(
        FeatureID.CanManagePolicies,
        bitstreamSelfLink,
        undefined,
      );
      done();
    });

  });
});
