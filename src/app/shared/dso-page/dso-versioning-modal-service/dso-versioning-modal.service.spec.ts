import { waitForAsync } from '@angular/core/testing';
import {
  EMPTY,
  of as observableOf,
} from 'rxjs';

import { buildPaginatedList } from '@dspace/core';
import { Item } from '@dspace/core';
import { MetadataMap } from '@dspace/core';
import { PageInfo } from '@dspace/core';
import { Version } from '@dspace/core';
import { createSuccessfulRemoteDataObject$ } from '@dspace/core';
import { createRelationshipsObservable } from '../../../item-page/simple/item-types/shared/item.component.spec';
import { DsoVersioningModalService } from './dso-versioning-modal.service';

describe('DsoVersioningModalService', () => {
  let service: DsoVersioningModalService;
  let modalService;
  let versionService;
  let versionHistoryService;
  let itemVersionShared;
  let router;
  let workspaceItemDataService;
  let itemService;

  const mockItem: Item = Object.assign(new Item(), {
    bundles: createSuccessfulRemoteDataObject$(buildPaginatedList(new PageInfo(), [])),
    metadata: new MetadataMap(),
    relationships: createRelationshipsObservable(),
    _links: {
      self: {
        href: 'item-href',
      },
      version: {
        href: 'version-href',
      },
    },
  });

  beforeEach(waitForAsync(() => {
    modalService = jasmine.createSpyObj('modalService', {
      open: { componentInstance: { firstVersion: {}, versionNumber: {}, createVersionEvent: EMPTY } },
    });
    versionService = jasmine.createSpyObj('versionService', {
      findByHref: createSuccessfulRemoteDataObject$<Version>(new Version()),
    });
    versionHistoryService = jasmine.createSpyObj('versionHistoryService', {
      createVersion: createSuccessfulRemoteDataObject$<Version>(new Version()),
      hasDraftVersion$: observableOf(false),
    });
    itemVersionShared = jasmine.createSpyObj('itemVersionShared', ['notifyCreateNewVersion']);
    router = jasmine.createSpyObj('router', ['navigateByUrl']);
    workspaceItemDataService = jasmine.createSpyObj('workspaceItemDataService', ['findByItem']);
    itemService = jasmine.createSpyObj('itemService', ['findByHref']);

    service = new DsoVersioningModalService(
      modalService,
      versionService,
      versionHistoryService,
      itemVersionShared,
      router,
      workspaceItemDataService,
      itemService,
    );
  }));
  describe('when onCreateNewVersion() is called', () => {
    it('should call versionService.findByHref', () => {
      service.openCreateVersionModal(mockItem);
      expect(versionService.findByHref).toHaveBeenCalledWith('version-href');
    });
  });

  describe('isNewVersionButtonDisabled', () => {
    it('should call versionHistoryService.hasDraftVersion$', () => {
      service.isNewVersionButtonDisabled(mockItem);
      expect(versionHistoryService.hasDraftVersion$).toHaveBeenCalledWith(mockItem._links.version.href);
    });
  });

  describe('getVersioningTooltipMessage', () => {
    it('should return the create message when isNewVersionButtonDisabled returns false', (done) => {
      spyOn(service, 'isNewVersionButtonDisabled').and.returnValue(observableOf(false));
      service.getVersioningTooltipMessage(mockItem, 'draft-message', 'create-message').subscribe((message) => {
        expect(message).toEqual('create-message');
        done();
      });
    });
    it('should return the draft message when isNewVersionButtonDisabled returns true', (done) => {
      spyOn(service, 'isNewVersionButtonDisabled').and.returnValue(observableOf(true));
      service.getVersioningTooltipMessage(mockItem, 'draft-message', 'create-message').subscribe((message) => {
        expect(message).toEqual('draft-message');
        done();
      });
    });
  });
});
