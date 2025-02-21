import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { AuthService } from '@dspace/core';
import { ServerResponseService } from '@dspace/core';

/**
 * This component representing the `PageNotFound` DSpace page.
 */
@Component({
  selector: 'ds-base-pagenotfound',
  styleUrls: ['./pagenotfound.component.scss'],
  templateUrl: './pagenotfound.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
  standalone: true,
  imports: [RouterLink, TranslateModule],
})
export class PageNotFoundComponent implements OnInit {

  /**
   * Initialize instance variables
   *
   * @param {AuthService} authservice
   * @param {ServerResponseService} responseService
   */
  constructor(private authservice: AuthService, private responseService: ServerResponseService) {
    this.responseService.setNotFound();
  }

  /**
   * Remove redirect url from the state
   */
  ngOnInit(): void {
    this.authservice.clearRedirectUrl();
  }

}
