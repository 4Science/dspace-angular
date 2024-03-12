import { ChangeDetectionStrategy, Component, } from '@angular/core';

import { FullItemPageComponent as BaseComponent } from '../../../../../app/item-page/full/full-item-page.component';
import { ErrorComponent } from '../../../../../app/shared/error/error.component';
import { ThemedLoadingComponent } from '../../../../../app/shared/loading/themed-loading.component';
import { TranslateModule } from '@ngx-translate/core';
import {
  ThemedFullFileSectionComponent
} from '../../../../../app/item-page/full/field-components/file-section/themed-full-file-section.component';
import { CollectionsComponent } from '../../../../../app/item-page/field-components/collections/collections.component';
import { ItemVersionsComponent } from '../../../../../app/item-page/versions/item-versions.component';
import { AsyncPipe, KeyValuePipe, NgForOf, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  ThemedItemPageTitleFieldComponent
} from '../../../../../app/item-page/simple/field-components/specific-field/title/themed-item-page-field.component';
import { DsoEditMenuComponent } from '../../../../../app/shared/dso-page/dso-edit-menu/dso-edit-menu.component';
import {
  ItemVersionsNoticeComponent
} from '../../../../../app/item-page/versions/notice/item-versions-notice.component';
import { ViewTrackerComponent } from '../../../../../app/statistics/angulartics/dspace/view-tracker.component';
import { ThemedItemAlertsComponent } from '../../../../../app/item-page/alerts/themed-item-alerts.component';
import { VarDirective } from '../../../../../app/shared/utils/var.directive';
import { fadeInOut } from '../../../../../app/shared/animations/fade';

/**
 * This component renders a full item page.
 * The route parameter 'id' is used to request the item it represents.
 */

@Component({
  selector: 'ds-full-item-page',
  // styleUrls: ['./full-item-page.component.scss'],
  styleUrls: ['../../../../../app/item-page/full/full-item-page.component.scss'],
  // templateUrl: './full-item-page.component.html',
  templateUrl: '../../../../../app/item-page/full/full-item-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeInOut],
  standalone: true,
  imports: [
    ErrorComponent,
    ThemedLoadingComponent,
    TranslateModule,
    ThemedFullFileSectionComponent,
    CollectionsComponent,
    ItemVersionsComponent,
    NgIf,
    NgForOf,
    AsyncPipe,
    KeyValuePipe,
    RouterLink,
    ThemedItemPageTitleFieldComponent,
    DsoEditMenuComponent,
    ItemVersionsNoticeComponent,
    ViewTrackerComponent,
    ThemedItemAlertsComponent,
    VarDirective
  ],
})
export class FullItemPageComponent extends BaseComponent {
}
