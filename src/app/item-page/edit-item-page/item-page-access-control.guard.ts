import { CanActivateFn } from '@angular/router';
import { of as observableOf } from 'rxjs';

import { dsoPageSingleFeatureGuard } from '@dspace/core';
import { FeatureID } from '@dspace/core';
import { itemPageResolver } from '@dspace/core';

/**
 * Guard for preventing unauthorized access to certain {@link Item} pages requiring administrator rights
 */
export const itemPageAccessControlGuard: CanActivateFn =
  dsoPageSingleFeatureGuard(
    () => itemPageResolver,
    () => observableOf(FeatureID.AdministratorOf),
  );
