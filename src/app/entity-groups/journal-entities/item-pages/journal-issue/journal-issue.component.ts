import { Component } from '@angular/core';

import { ViewMode } from '../../../../core/shared/view-mode.model';
import {
  listableObjectComponent
} from '../../../../shared/object-collection/shared/listable-object/listable-object.decorator';
import { ItemComponent } from '../../../../item-page/simple/item-types/shared/item.component';
import { TranslateModule } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { RelatedItemsComponent } from '../../../../item-page/simple/related-items/related-items-component';
import {
  GenericItemPageFieldComponent
} from '../../../../item-page/simple/field-components/specific-field/generic/generic-item-page-field.component';
import { ThemedThumbnailComponent } from '../../../../thumbnail/themed-thumbnail.component';
import {
  MetadataFieldWrapperComponent
} from '../../../../shared/metadata-field-wrapper/metadata-field-wrapper.component';
import { DsoEditMenuComponent } from '../../../../shared/dso-page/dso-edit-menu/dso-edit-menu.component';
import {
  ThemedItemPageTitleFieldComponent
} from '../../../../item-page/simple/field-components/specific-field/title/themed-item-page-field.component';
import {
  ThemedResultsBackButtonComponent
} from '../../../../shared/results-back-button/themed-results-back-button.component';
import { AsyncPipe, NgIf } from '@angular/common';

@listableObjectComponent('JournalIssue', ViewMode.StandalonePage)
@Component({
    selector: 'ds-journal-issue',
    styleUrls: ['./journal-issue.component.scss'],
    templateUrl: './journal-issue.component.html',
    standalone: true,
    imports: [NgIf, ThemedResultsBackButtonComponent, ThemedItemPageTitleFieldComponent, DsoEditMenuComponent, MetadataFieldWrapperComponent, ThemedThumbnailComponent, GenericItemPageFieldComponent, RelatedItemsComponent, RouterLink, AsyncPipe, TranslateModule]
})
/**
 * The component for displaying metadata and relations of an item of the type Journal Issue
 */
export class JournalIssueComponent extends ItemComponent {
}
