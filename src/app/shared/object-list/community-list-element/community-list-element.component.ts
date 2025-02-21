
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DSONameService } from '@dspace/core';
import { Community } from '@dspace/core';
import { ViewMode } from '@dspace/core';
import { listableObjectComponent } from '../../object-collection/shared/listable-object/listable-object.decorator';
import { AbstractListableElementComponent } from '../../object-collection/shared/object-collection-element/abstract-listable-element.component';

@Component({
  selector: 'ds-community-list-element',
  styleUrls: ['./community-list-element.component.scss'],
  templateUrl: './community-list-element.component.html',
  standalone: true,
  imports: [RouterLink],
})
/**
 * Component representing a list element for a community
 */
@listableObjectComponent(Community, ViewMode.ListElement)
export class CommunityListElementComponent extends AbstractListableElementComponent<Community> {

  constructor(
    public dsoNameService: DSONameService,
  ) {
    super(dsoNameService);
  }

}
