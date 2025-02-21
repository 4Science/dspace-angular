import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Community } from '@dspace/core';
import { Context } from '@dspace/core';
import { ViewMode } from '@dspace/core';
import { listableObjectComponent } from '../../../../../../app/shared/object-collection/shared/listable-object/listable-object.decorator';
import { CommunityListElementComponent as BaseComponent } from '../../../../../../app/shared/object-list/community-list-element/community-list-element.component';

@listableObjectComponent(Community, ViewMode.ListElement, Context.Any, 'custom')

@Component({
  selector: 'ds-community-list-element',
  // styleUrls: ['./community-list-element.component.scss'],
  styleUrls: ['../../../../../../app/shared/object-list/community-list-element/community-list-element.component.scss'],
  // templateUrl: './community-list-element.component.html'
  templateUrl: '../../../../../../app/shared/object-list/community-list-element/community-list-element.component.html',
  standalone: true,
  imports: [ RouterLink],
})
/**
 * Component representing a list element for a community
 */
export class CommunityListElementComponent extends BaseComponent {}
