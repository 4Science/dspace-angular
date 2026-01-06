import {
  AsyncPipe,
  NgTemplateOutlet,
} from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { BreadcrumbsComponent as BaseComponent } from '../../../../app/breadcrumbs/breadcrumbs.component';
import { EscapeHtmlPipe } from '../../../../app/shared/utils/escape-html.pipe';
import { VarDirective } from '../../../../app/shared/utils/var.directive';

@Component({
  selector: 'ds-themed-breadcrumbs',
  // templateUrl: './breadcrumbs.component.html',
  templateUrl: '../../../../app/breadcrumbs/breadcrumbs.component.html',
  // styleUrls: ['./breadcrumbs.component.scss']
  styleUrls: ['../../../../app/breadcrumbs/breadcrumbs.component.scss'],
  imports: [
    AsyncPipe,
    EscapeHtmlPipe,
    NgbTooltipModule,
    NgTemplateOutlet,
    RouterLink,
    TranslateModule,
    VarDirective,
  ],
})
export class BreadcrumbsComponent extends BaseComponent {
}
