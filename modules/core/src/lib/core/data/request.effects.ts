import {
  Injectable,
  Injector,
} from '@angular/core';
import {
  hasValue,
  isNotEmpty,
} from '@dspace/shared/utils';
import {
  Actions,
  createEffect,
  ofType,
} from '@ngrx/effects';
import {
  catchError,
  filter,
  map,
  mergeMap,
  take,
  withLatestFrom,
} from 'rxjs/operators';

import { getClassForType } from '../cache';
import { ParsedResponse } from '../cache';
import { DSpaceSerializer } from '../dspace-rest';
import { DspaceRestService } from '../dspace-rest';
import { RawRestResponse } from '../dspace-rest';
import { StoreActionTypes } from '../store.actions';
import { XSRFService } from '../xsrf';
import {
  RequestActionTypes,
  RequestErrorAction,
  RequestExecuteAction,
  RequestSuccessAction,
  ResetResponseTimestampsAction,
} from './request.actions';
import { RequestService } from './request.service';
import { RequestEntry } from './request-entry.model';
import { RequestError } from './request-error.model';
import { RestRequestMethod } from './rest-request-method';
import { RestRequestWithResponseParser } from './rest-request-with-response-parser.model';

@Injectable()
export class RequestEffects {

  execute = createEffect(() => this.actions$.pipe(
    ofType(RequestActionTypes.EXECUTE),
    mergeMap((action: RequestExecuteAction) => {
      return this.requestService.getByUUID(action.payload).pipe(
        take(1),
      );
    }),
    filter((entry: RequestEntry) => hasValue(entry)),
    withLatestFrom(this.xsrfService.tokenInitialized$),
    // If it's a GET request, or we have an XSRF token, dispatch it immediately
    // Otherwise wait for the XSRF token first
    filter(([entry, tokenInitialized]: [RequestEntry, boolean]) => entry.request.method === RestRequestMethod.GET || tokenInitialized === true),
    map(([entry, tokenInitialized]: [RequestEntry, boolean]) => entry.request),
    mergeMap((request: RestRequestWithResponseParser) => {
      let body = request.body;
      if (isNotEmpty(request.body) && !request.isMultipart) {
        const serializer = new DSpaceSerializer(getClassForType(request.body.type));
        body = serializer.serialize(request.body);
      }
      return this.restApi.request(request.method, request.href, body, request.options, request.isMultipart).pipe(
        map((data: RawRestResponse) => this.injector.get(request.getResponseParser()).parse(request, data)),
        map((response: ParsedResponse) => new RequestSuccessAction(request.uuid, response.statusCode, response.link, response.unCacheableObject)),
        catchError((error: unknown) => {
          if (error instanceof RequestError) {
            // if it's an error returned by the server, complete the request
            return [new RequestErrorAction(request.uuid, error.statusCode, error.message)];
          } else {
            // if it's a client side error, throw it
            throw error;
          }
        }),
      );
    }),
  ));

  /**
   * When the store is rehydrated in the browser, set all cache
   * timestamps to 'now', because the time zone of the server can
   * differ from the client.
   *
   * This assumes that the server cached everything a negligible
   * time ago, and will likely need to be revisited later
   */
  fixTimestampsOnRehydrate = createEffect(() => this.actions$
    .pipe(ofType(StoreActionTypes.REHYDRATE),
      map(() => new ResetResponseTimestampsAction(new Date().getTime())),
    ));

  constructor(
    private actions$: Actions,
    private restApi: DspaceRestService,
    private injector: Injector,
    protected requestService: RequestService,
    protected xsrfService: XSRFService,
  ) { }

}
