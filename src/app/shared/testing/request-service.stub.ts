import { Observable, of as observableOf } from 'rxjs';
import { RestRequest } from '../../core/data/rest-request.model';
import { RequestEntry } from '../../core/data/request-entry.model';

/**
 * Stub service for {@link RequestService}.
 */
export class RequestServiceStub {

  removeByHrefSubstring(_href: string): Observable<boolean> {
    return observableOf(true);
  }

  send(request: RestRequest, useCachedVersionIfAvailable = false): boolean {
    return true;
  }

  getByUUID(uuid: string): Observable<RequestEntry> {
    return observableOf(null);
  }

  generateRequestId(): string {
    return '';
  }

}
