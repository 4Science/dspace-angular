import { Injectable } from '@angular/core';
import { RequestService } from '../data/request.service';
import { RemoteDataBuildService } from '../cache/builders/remote-data-build.service';
import { ObjectCacheService } from '../cache/object-cache.service';
import {filter, map, mergeMap, switchMap, toArray} from 'rxjs/operators';
import { getFirstCompletedRemoteData } from '../shared/operators';
import {AsyncSubject, combineLatest, from as observableFrom, Observable} from 'rxjs';
import { RemoteData } from '../data/remote-data';
import { DeleteRequest, PutRequest } from '../data/request.models';
import { RequestParam } from '../cache/models/request-param.model';
import { NoContent } from '../shared/NoContent.model';
import { hasValue, isNotEmpty } from '../../shared/empty.util';
import { URLCombiner } from '../url-combiner/url-combiner';
import { ObjectCacheEntry } from '../cache/object-cache.reducer';
import { HALEndpointService } from '../shared/hal-endpoint.service';

/**
 * A service that provides methods to make REST requests with AssociateItemMode endpoint. No real HAL-Service.
 * Basic functionality (param building) was copied from other services, mainly data-service.
 */

@Injectable()
export class AssociateItemService {

  protected linkPath = 'associateitem';
  protected responseMsToLive = 10 * 1000;

  constructor(private requestService: RequestService,
              protected rdbService: RemoteDataBuildService,
              private objectCache: ObjectCacheService,
              protected halService: HALEndpointService){
    //
    this.halService.getEndpoint(this.linkPath).subscribe(value => {
      this.linkPath = value;
    });
  }

  /**
   * PUT Request on /create endpoint to create associateItem
   * */
    public createAssociation(sourceitem: string, targetitem: string, mode: string): Observable<RemoteData<any>> {
      //create object
      let reps: RequestParam[] = [];
      reps.push(new RequestParam('sourceuuid', sourceitem));
      reps.push(new RequestParam('targetuuid', targetitem));
      reps.push(new RequestParam('modename', mode));

      let href = this.buildHrefWithParams(this.linkPath + '/create', reps);

      const requestId = this.requestService.generateRequestId();
      const request = new PutRequest(requestId, href, undefined);

      if (hasValue(this.responseMsToLive)) {
        request.responseMsToLive = this.responseMsToLive;
      }

      this.requestService.send(request);

      return this.rdbService.buildFromRequestUUID(requestId);
    }

  /**
   * DELETE Request on /delete endpoint to remove associateItem
   * */
    public deleteAssociation(sourceitem: string, targetitem: string, mode: string): Observable<RemoteData<NoContent>> {

      let reps: RequestParam[] = [];
      reps.push(new RequestParam('sourceuuid', sourceitem));
      reps.push(new RequestParam('targetuuid', targetitem));
      reps.push(new RequestParam('modename', mode));

      let href = this.buildHrefWithParams(this.linkPath + '/delete', reps);

      const requestId = this.requestService.generateRequestId();

      const request = new DeleteRequest(requestId, href);
      if (hasValue(this.responseMsToLive)) {
        request.responseMsToLive = this.responseMsToLive;
      }
      this.requestService.send(request);

      const response$ = this.rdbService.buildFromRequestUUID(requestId);

      const invalidated$ = new AsyncSubject<boolean>();
      response$.pipe(
        getFirstCompletedRemoteData(),
        switchMap((rd: RemoteData<NoContent>) => {
          if (rd.hasSucceeded) {
            this.invalidateByHref(href);
            return response$;
          } else {
            return response$;
          }
        })
      ).subscribe(() => {
        invalidated$.next(true);
        invalidated$.complete();
      });

      return combineLatest([response$, invalidated$]).pipe(
        filter(([_, invalidated]) => invalidated),
        map(([response, _]) => response),
      );
  }

  protected buildHrefWithParams(href: string, params: RequestParam[]): string {

    let args = [];
    if (hasValue(params)) {
      params.forEach((param: RequestParam) => {
        args = this.addHrefArg(href, args, `${param.fieldName}=${param.fieldValue}`);
      });
    }

    if (isNotEmpty(args)) {
      return new URLCombiner(href, `?${args.join('&')}`).toString();
    } else {
      return href;
    }
  }

  protected addHrefArg(href: string, currentArgs: string[], newArg: string): string[] {
    if (href.includes(newArg) || currentArgs.includes(newArg)) {
      return [...currentArgs];
    } else {
      return [...currentArgs, newArg];
    }
  }

  protected invalidateByHref(href: string): Observable<boolean> {
    const done$ = new AsyncSubject<boolean>();

    this.objectCache.getByHref(href).pipe(
      switchMap((oce: ObjectCacheEntry) => observableFrom(oce.requestUUIDs).pipe(
        mergeMap((requestUUID: string) => this.requestService.setStaleByUUID(requestUUID)),
        toArray(),
      )),
    ).subscribe(() => {
      done$.next(true);
      done$.complete();
    });

    return done$;
  }

}
