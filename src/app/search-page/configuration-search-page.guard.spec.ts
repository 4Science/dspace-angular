import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from '@angular/router';

import { PAGE_NOT_FOUND_PATH } from '../app-routing-paths';
import { RouterStub } from '../shared/testing/router.stub';
import { configurationSearchPageGuard } from './configuration-search-page.guard';

describe('configurationSearchPageGuard', () => {
  let router: RouterStub;
  let route: ActivatedRouteSnapshot;
  let state: RouterStateSnapshot;

  const runGuard = () =>
    TestBed.runInInjectionContext(() =>
      configurationSearchPageGuard(route, state),
    );

  beforeEach(() => {
    router = new RouterStub();

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: router },
      ],
    });

    route = {
      params: {},
      data: {},
    } as any;
    state = {} as any;
  });

  describe('when the configuration param has a value', () => {
    beforeEach(() => {
      route.params = { configuration: 'default' };
    });

    it('should return true', () => {
      expect(runGuard()).toBe(true);
    });

    it('should set the title in the route data based on the configuration', () => {
      runGuard();
      expect(route.data).toEqual({ title: 'default.search.title' });
    });

    it('should not redirect to the 404 page', () => {
      spyOn(router, 'createUrlTree').and.callThrough();
      runGuard();
      expect(router.createUrlTree).not.toHaveBeenCalled();
    });
  });

  describe('when the configuration param is undefined', () => {
    beforeEach(() => {
      route.params = {};
    });

    it('should redirect to the 404 page', () => {
      spyOn(router, 'createUrlTree').and.callThrough();
      const result = runGuard();
      expect(router.createUrlTree).toHaveBeenCalledWith([PAGE_NOT_FOUND_PATH]);
      expect(result).toBe('/testing-url' as any);
    });

    it('should not set a title in the route data', () => {
      runGuard();
      expect(route.data).toEqual({});
    });
  });

  describe('when the configuration param is null', () => {
    beforeEach(() => {
      route.params = { configuration: null };
    });

    it('should redirect to the 404 page', () => {
      spyOn(router, 'createUrlTree').and.callThrough();
      runGuard();
      expect(router.createUrlTree).toHaveBeenCalledWith([PAGE_NOT_FOUND_PATH]);
    });
  });

  describe('when the configuration param is the literal string "null"', () => {
    beforeEach(() => {
      route.params = { configuration: 'null' };
    });

    it('should redirect to the 404 page', () => {
      spyOn(router, 'createUrlTree').and.callThrough();
      runGuard();
      expect(router.createUrlTree).toHaveBeenCalledWith([PAGE_NOT_FOUND_PATH]);
    });

    it('should not set a title in the route data', () => {
      runGuard();
      expect(route.data).toEqual({});
    });
  });

  describe('when the configuration param is the literal string "undefined"', () => {
    beforeEach(() => {
      route.params = { configuration: 'undefined' };
    });

    it('should redirect to the 404 page', () => {
      spyOn(router, 'createUrlTree').and.callThrough();
      runGuard();
      expect(router.createUrlTree).toHaveBeenCalledWith([PAGE_NOT_FOUND_PATH]);
    });
  });
});
