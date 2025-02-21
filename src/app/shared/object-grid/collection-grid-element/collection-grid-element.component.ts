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

import { DSONameService } from '@dspace/core';
import { LinkService } from '@dspace/core';
import { followLink } from '@dspace/core';
import { Collection } from '@dspace/core';
import { ViewMode } from '@dspace/core';
import { ThemedThumbnailComponent } from '../../../thumbnail/themed-thumbnail.component';
import { listableObjectComponent } from '../../object-collection/shared/listable-object/listable-object.decorator';
import { AbstractListableElementComponent } from '../../object-collection/shared/object-collection-element/abstract-listable-element.component';

/**
 * Component representing a grid element for collection
 */
@Component({
  selector: 'ds-collection-grid-element',
  styleUrls: ['./collection-grid-element.component.scss'],
  templateUrl: './collection-grid-element.component.html',
  standalone: true,
  imports: [RouterLink, ThemedThumbnailComponent, AsyncPipe, TranslateModule],
})
@listableObjectComponent(Collection, ViewMode.GridElement)
export class CollectionGridElementComponent extends AbstractListableElementComponent<
  Collection
> {
  private _object: Collection;

  constructor(
    public dsoNameService: DSONameService,
    private linkService: LinkService,
  ) {
    super(dsoNameService);
  }

  // @ts-ignore
  @Input() set object(object: Collection) {
    this._object = object;
    if (hasValue(this._object) && hasNoValue(this._object.logo)) {
      this.linkService.resolveLink<Collection>(
        this._object,
        followLink('logo'),
      );
    }
  }

  get object(): Collection {
    return this._object;
  }
}
