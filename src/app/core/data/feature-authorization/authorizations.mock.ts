import { ResourceType } from '../../shared/resource-type';
import { DSpaceObject } from '../../shared/dspace-object.model';


export const mockAuthSiteObject = {
  id: 'f92d103c-e4ad-4dfb-b59f-f90c7425407e',
  uuid: 'f92d103c-e4ad-4dfb-b59f-f90c7425407e',
  name: 'DSpace at My University',
  metadata: {},
  type: new ResourceType('site'),
  uniqueType: 'core.site',
  _links: {
    self: {
      href: 'host/server/api/core/sites/f92d103c-e4ad-4dfb-b59f-f90c7425407e'
    }
  }
} as DSpaceObject;



