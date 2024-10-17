import { Injectable } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { RequestService } from '../request.service';


@Injectable()
export class RequestEffects {

  constructor(
    private actions$: Actions,
    protected requestService: RequestService
  ) { }

}
