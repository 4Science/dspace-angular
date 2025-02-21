import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  ResolveFn,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs';

import { followLink } from '@dspace/core';
import { RemoteData } from '@dspace/core';
import { getFirstCompletedRemoteData } from '@dspace/core';
import { WorkspaceItem } from '@dspace/core';
import { WorkspaceitemDataService } from '@dspace/core';

/**
 * Method for resolving a workflow item based on the parameters in the current route
 * @param {ActivatedRouteSnapshot} route The current ActivatedRouteSnapshot
 * @param {RouterStateSnapshot} state The current RouterStateSnapshot
 * @param {WorkspaceitemDataService} workspaceItemService
 * @returns Observable<<RemoteData<Item>> Emits the found workflow item based on the parameters in the current route,
 * or an error if something went wrong
 */
export const workspaceItemPageResolver: ResolveFn<RemoteData<WorkspaceItem>> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  workspaceItemService: WorkspaceitemDataService = inject(WorkspaceitemDataService),
): Observable<RemoteData<WorkspaceItem>> => {
  return workspaceItemService.findById(route.params.id,
    true,
    false,
    followLink('item'),
  ).pipe(
    getFirstCompletedRemoteData(),
  );
};
