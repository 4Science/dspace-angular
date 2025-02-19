import { AsyncPipe } from '@angular/common';
import {
  Component,
  Input,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  hasNoValue,
  hasValue,
} from '@dspace/shared/utils';
import { TranslateModule } from '@ngx-translate/core';

import { DSONameService } from '../../../core/breadcrumbs/dso-name.service';
import { LinkService } from '../../../core/cache/builders/link.service';
import { followLink } from '../../../core/data/follow-link-config.model';
import { Community } from '../../../core/shared/community.model';
import { ViewMode } from '../../../core/shared/view-mode.model';
import { ThemedThumbnailComponent } from '../../../thumbnail/themed-thumbnail.component';
import { listableObjectComponent } from '../../object-collection/shared/listable-object/listable-object.decorator';
import { AbstractListableElementComponent } from '../../object-collection/shared/object-collection-element/abstract-listable-element.component';

/**
 * Component representing a grid element for a community
 */
@Component({
  selector: 'ds-community-grid-element',
  styleUrls: ['./community-grid-element.component.scss'],
  templateUrl: './community-grid-element.component.html',
  standalone: true,
  imports: [RouterLink, ThemedThumbnailComponent, AsyncPipe, TranslateModule],
})

@listableObjectComponent(Community, ViewMode.GridElement)
export class CommunityGridElementComponent extends AbstractListableElementComponent<Community> {
  private _object: Community;

  constructor(
    public dsoNameService: DSONameService,
    private linkService: LinkService,
  ) {
    super(dsoNameService);
  }

  // @ts-ignore
  @Input() set object(object: Community) {
    this._object = object;
    if (hasValue(this._object) && hasNoValue(this._object.logo)) {
      this.linkService.resolveLink<Community>(this._object, followLink('logo'));
    }
  }

  get object(): Community {
    return this._object;
  }
}
