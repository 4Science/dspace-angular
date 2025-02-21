import { of as observableOf } from 'rxjs';

import { buildPaginatedList } from '@dspace/core';
import { Community } from '@dspace/core';
import { PageInfo } from '@dspace/core';
import { createSuccessfulRemoteDataObject$ } from '@dspace/core';
import { CommunityListSaveAction } from './community-list.actions';
import { CommunityListReducer } from './community-list.reducer';
import { toFlatNode } from './community-list-service';

describe('communityListReducer', () => {
  const mockSubcommunities1Page1 = [Object.assign(new Community(), {
    id: 'ce64f48e-2c9b-411a-ac36-ee429c0e6a88',
    uuid: 'ce64f48e-2c9b-411a-ac36-ee429c0e6a88',
    name: 'subcommunity1',
  })];
  const mockFlatNodeOfCommunity = toFlatNode(
    Object.assign(new Community(), {
      id: '7669c72a-3f2a-451f-a3b9-9210e7a4c02f',
      uuid: '7669c72a-3f2a-451f-a3b9-9210e7a4c02f',
      subcommunities: createSuccessfulRemoteDataObject$(buildPaginatedList(new PageInfo(), mockSubcommunities1Page1)),
      collections: createSuccessfulRemoteDataObject$(buildPaginatedList(new PageInfo(), [])),
      name: 'community1',
    }), observableOf(true), 0, false, null,
  );

  it ('should set init state of the expandedNodes and loadingNode', () => {
    const state = {
      expandedNodes: [],
      loadingNode: null,
    };
    const action = new CommunityListSaveAction([], null);
    const newState = CommunityListReducer(null, action);
    expect(newState).toEqual(state);
  });

  it ('should save new state of the expandedNodes and loadingNode at a save action', () => {
    const state = {
      expandedNodes: [mockFlatNodeOfCommunity],
      loadingNode: null,
    };
    const action = new CommunityListSaveAction([mockFlatNodeOfCommunity], null);
    const newState = CommunityListReducer(null, action);
    expect(newState).toEqual(state);
  });
});
