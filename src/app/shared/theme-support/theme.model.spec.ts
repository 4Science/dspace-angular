import { TestBed } from '@angular/core/testing';

import { getCollectionModuleRoute } from '../../collection-page/collection-page-routing-paths';
import { getCommunityModuleRoute } from '../../community-page/community-page-routing-paths';
import { ConfigurationDataService } from '@dspace/core';
import { Collection } from '@dspace/core';
import { COLLECTION } from '@dspace/core';
import { Community } from '@dspace/core';
import { COMMUNITY } from '@dspace/core';
import { Item } from '@dspace/core';
import { ITEM } from '@dspace/core';
import { ConfigurationDataServiceStub } from '@dspace/core';
import { getItemModuleRoute } from '../../item-page/item-page-routing-paths';
import { HandleService } from '../handle.service';
import {
  HandleTheme,
  RegExTheme,
  Theme,
  UUIDTheme,
} from './theme.model';

describe('Theme Models', () => {
  let theme: Theme;

  describe('RegExTheme', () => {
    it('should return true when the regex matches the community\'s DSO route', (done: DoneFn) => {
      theme = new RegExTheme({
        name: 'community',
        regex: getCommunityModuleRoute() + '/.*',
      });
      const dso = Object.assign(new Community(), {
        type: COMMUNITY.value,
        uuid: 'community-uuid',
      });
      theme.matches('', dso).subscribe((matches: boolean) => {
        expect(matches).toBeTrue();
        done();
      });
    });

    it('should return true when the regex matches the collection\'s DSO route', (done: DoneFn) => {
      theme = new RegExTheme({
        name: 'collection',
        regex: getCollectionModuleRoute() + '/.*',
      });
      const dso = Object.assign(new Collection(), {
        type: COLLECTION.value,
        uuid: 'collection-uuid',
      });
      theme.matches('', dso).subscribe((matches: boolean) => {
        expect(matches).toBeTrue();
        done();
      });
    });

    it('should return true when the regex matches the item\'s DSO route', (done: DoneFn) => {
      theme = new RegExTheme({
        name: 'item',
        regex: getItemModuleRoute() + '/.*',
      });
      const dso = Object.assign(new Item(), {
        type: ITEM.value,
        uuid: 'item-uuid',
      });
      theme.matches('', dso).subscribe((matches: boolean) => {
        expect(matches).toBeTrue();
        done();
      });
    });

    it('should return true when the regex matches the url', (done: DoneFn) => {
      theme = new RegExTheme({
        name: 'url',
        regex: '.*partial.*',
      });
      theme.matches('theme/partial/url/match', null).subscribe((matches: boolean) => {
        expect(matches).toBeTrue();
        done();
      });
    });

    it('should return false when the regex matches neither the url, nor the DSO route', (done: DoneFn) => {
      theme = new RegExTheme({
        name: 'no-match',
        regex: '.*no/match.*',
      });
      theme.matches('theme/partial/url/match', null).subscribe((matches: boolean) => {
        expect(matches).toBeFalse();
        done();
      });
    });
  });

  describe('HandleTheme', () => {
    let handleService: HandleService;

    let configurationService: ConfigurationDataServiceStub;

    beforeEach(() => {
      configurationService = new ConfigurationDataServiceStub();

      TestBed.configureTestingModule({
        providers: [
          { provide: ConfigurationDataService, useValue: configurationService },
        ],
      });
      handleService = TestBed.inject(HandleService);
    });
    it('should return true when the DSO\'s handle matches the theme\'s handle', (done: DoneFn) => {
      theme = new HandleTheme({
        name: 'matching-handle',
        handle: '1234/5678',
      }, handleService);
      const matchingDso = Object.assign(new Item(), {
        type: ITEM.value,
        uuid: 'item-uuid',
        handle: '1234/5678',
      }, handleService);
      theme.matches('', matchingDso).subscribe((matches: boolean) => {
        expect(matches).toBeTrue();
        done();
      });
    });
    it('should return false when the DSO\'s handle contains the theme\'s handle as a subpart', (done: DoneFn) => {
      theme = new HandleTheme({
        name: 'matching-handle',
        handle: '1234/5678',
      }, handleService);
      const dso = Object.assign(new Item(), {
        type: ITEM.value,
        uuid: 'item-uuid',
        handle: '1234/567891011',
      });
      theme.matches('', dso).subscribe((matches: boolean) => {
        expect(matches).toBeFalse();
        done();
      });
    });

    it('should return false when the handles don\'t match', (done: DoneFn) => {
      theme = new HandleTheme({
        name: 'no-matching-handle',
        handle: '1234/5678',
      }, handleService);
      const dso = Object.assign(new Item(), {
        type: ITEM.value,
        uuid: 'item-uuid',
        handle: '1234/6789',
      });
      theme.matches('', dso).subscribe((matches: boolean) => {
        expect(matches).toBeFalse();
        done();
      });
    });
  });

  describe('UUIDTheme', () => {
    it('should return true when the DSO\'s UUID matches the theme\'s UUID', (done: DoneFn) => {
      theme = new UUIDTheme({
        name: 'matching-uuid',
        uuid: 'item-uuid',
      });
      const dso = Object.assign(new Item(), {
        type: ITEM.value,
        uuid: 'item-uuid',
      });
      theme.matches('', dso).subscribe((matches: boolean) => {
        expect(matches).toBeTrue();
        done();
      });
    });

    it('should return true when the UUIDs don\'t match', (done: DoneFn) => {
      theme = new UUIDTheme({
        name: 'matching-uuid',
        uuid: 'item-uuid',
      });
      const dso = Object.assign(new Collection(), {
        type: COLLECTION.value,
        uuid: 'collection-uuid',
      });
      theme.matches('', dso).subscribe((matches: boolean) => {
        expect(matches).toBeFalse();
        done();
      });
    });
  });
});
