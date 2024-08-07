import { Component } from '@angular/core';

import { Context } from '../../../../../../../app/core/shared/context.model';
import { ViewMode } from '../../../../../../../app/core/shared/view-mode.model';
import { JournalComponent as BaseComponent } from '../../../../../../../app/entity-groups/journal-entities/item-pages/journal/journal.component';
import { listableObjectComponent } from '../../../../../../../app/shared/object-collection/shared/listable-object/listable-object.decorator';

@listableObjectComponent('Journal', ViewMode.StandalonePage, Context.Any, 'custom')
@Component({
  selector: 'ds-journal',
  // styleUrls: ['./journal.component.scss'],
  styleUrls: ['../../../../../../../app/entity-groups/journal-entities/item-pages/journal/journal.component.scss'],
  // templateUrl: './journal.component.html',
  templateUrl: '../../../../../../../app/entity-groups/journal-entities/item-pages/journal/journal.component.html',
})
/**
 * The component for displaying metadata and relations of an item of the type Journal
 */
export class JournalComponent extends BaseComponent {
}
