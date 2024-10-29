import { AppState } from "../../../app.reducer";
import { Store } from "@ngrx/store";
import { AuthorizationService } from "./authorization.service";
import { AuthorizationsState } from "./authorization.interfaces";
import { Observable, of as observableOf } from 'rxjs';
import { SiteDataService } from "../site-data.service";
import { Site } from "../../shared/site.model";


describe('AuthorizationService', () => {
  let service: AuthorizationService;
  let store: Store<AppState>;

  const site: Site = Object.assign(new Site(), {
    id: 'test-site',
    _links: {
      self: { href: 'test-site-href' }
    },
    metadata: {
      'cris.cms.footer': [
        {
          value: 'Test footer',
          language: 'en'
        }
      ],
    }
  });
  const siteService = jasmine.createSpyObj('siteService', {
    find: observableOf(site)
  });



  describe('', () => {
    beforeEach(() => {
      const _initialState = { authorizationFeatures: {loading: false, authorizations: {}, hasError: false} };
      store = new Store<AppState>(observableOf(_initialState), undefined, undefined);
      service = new AuthorizationService(siteService, store);
    });

    it('should return loading false on init', (done) => {
      service.isLoading().subscribe((loading) => {
        expect(loading).toBeFalsy();
        done()
      });
    });

    it('should return hasError false on init', (done) => {
      service.hasErrors().subscribe((hasError) => {
        expect(hasError).toBeFalsy();
        done()
      });
    });

  });



});
