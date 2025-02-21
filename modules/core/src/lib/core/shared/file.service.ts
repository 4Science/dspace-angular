import {
  Inject,
  Injectable,
} from '@angular/core';
import { hasValue } from '@dspace/shared/utils';
import { Observable } from 'rxjs';
import {
  map,
  take,
} from 'rxjs/operators';

import { AuthService } from '../auth';
import { RawRestResponse } from '../dspace-rest';
import {
  NativeWindowRef,
  NativeWindowService,
} from '../services';
import { URLCombiner } from '../url-combiner';

/**
 * Provides utility methods to save files on the client-side.
 */
@Injectable({ providedIn: 'root' })
export class FileService {
  constructor(
    @Inject(NativeWindowService) protected _window: NativeWindowRef,
    private authService: AuthService,
  ) { }

  /**
   * Combines an URL with a short-lived token and sets the current URL to the newly created one and returns it
   *
   * @param url
   *    file url
   */
  retrieveFileDownloadLink(url: string): Observable<string> {
    return this.authService.getShortlivedToken().pipe(take(1), map((token) =>
      hasValue(token) ? new URLCombiner(url, `?authentication-token=${token}`).toString() : url,
    ));
  }
  /**
   * Derives file name from the http response
   * by looking inside content-disposition
   * @param res
   *    http RawRestResponse
   */
  getFileNameFromResponseContentDisposition(res: RawRestResponse) {
    // NOTE: to be able to retrieve 'Content-Disposition' header,
    // you need to set 'Access-Control-Expose-Headers': 'Content-Disposition' ON SERVER SIDE
    const contentDisposition = res.headers.get('content-disposition') || '';
    const matches = /filename="([^;]+)"/ig.exec(contentDisposition) || [];
    return (matches[1] || 'untitled').trim().replace(/\.[^/.]+$/, '');
  }
}
