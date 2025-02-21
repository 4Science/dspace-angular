import { Observable } from 'rxjs';

import {
  buildPaginatedList,
  PaginatedList,
} from '../../data';
import { RemoteData } from '../../data';
import { Group } from '@dspace/core';
import { PageInfo } from '../../shared';
import {
  createSuccessfulRemoteDataObject,
  createSuccessfulRemoteDataObject$,
} from '@dspace/core';
import { EPersonMock } from './eperson.mock';

export const SpecialGroupMock2: Group = Object.assign(new Group(), {
  handle: null,
  subgroups: [],
  epersons: [],
  permanent: true,
  selfRegistered: false,
  _links: {
    self: {
      href: 'https://rest.api/server/api/eperson/specialGroups/testgroupid2',
    },
    subgroups: { href: 'https://rest.api/server/api/eperson/specialGroups/testgroupid2/subgroups' },
    object: { href: 'https://rest.api/server/api/eperson/specialGroups/testgroupid2/object' },
    epersons: { href: 'https://rest.api/server/api/eperson/specialGroups/testgroupid2/epersons' },
  },
  _name: 'testgroupname2',
  id: 'testgroupid2',
  uuid: 'testgroupid2',
  type: 'specialGroups',
  // object: createSuccessfulRemoteDataObject$({ name: 'testspecialGroupsid2objectName'})
});

export const SpecialGroupMock: Group = Object.assign(new Group(), {
  handle: null,
  subgroups: [SpecialGroupMock2],
  epersons: [EPersonMock],
  selfRegistered: false,
  permanent: false,
  _links: {
    self: {
      href: 'https://rest.api/server/api/eperson/specialGroups/testgroupid',
    },
    subgroups: { href: 'https://rest.api/server/api/eperson/specialGroups/testgroupid/subgroups' },
    object: { href: 'https://rest.api/server/api/eperson/specialGroups/testgroupid2/object' },
    epersons: { href: 'https://rest.api/server/api/eperson/specialGroups/testgroupid/epersons' },
  },
  _name: 'testgroupname',
  id: 'testgroupid',
  uuid: 'testgroupid',
  type: 'specialGroups',
});

export const SpecialGroupDataMock: RemoteData<PaginatedList<Group>> = createSuccessfulRemoteDataObject(buildPaginatedList(new PageInfo(), [SpecialGroupMock2,SpecialGroupMock]));
export const SpecialGroupDataMock$: Observable<RemoteData<PaginatedList<Group>>> = createSuccessfulRemoteDataObject$(buildPaginatedList(new PageInfo(), [SpecialGroupMock2,SpecialGroupMock]));
export const EmptySpecialGroupDataMock$: Observable<RemoteData<PaginatedList<Group>>> = createSuccessfulRemoteDataObject$(buildPaginatedList(new PageInfo(), []));



