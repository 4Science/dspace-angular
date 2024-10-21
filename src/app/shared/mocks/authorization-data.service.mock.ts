import { AuthorizationDataService } from "../../core/data/feature-authorization/authorization-data.service";


/**
 * Mock for [[AuthorizationDataService]]
 */
export function getMockAuthorizationDataService():
  AuthorizationDataService {
  return jasmine.createSpyObj('AuthorizationDataService', {
    isAuthorized: jasmine.createSpy('isAuthorized'),
    getObjectsAuthorizations: jasmine.createSpy('getObjectsAuthorizations'),
  });
}
