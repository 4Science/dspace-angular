import { Component } from '@angular/core';

import { MetadataRepresentationType } from '../../../../core/shared/metadata-representation/metadata-representation.model';
import { VALUE_LIST_BROWSE_DEFINITION } from '../../../../core/shared/value-list-browse-definition.resource-type';
import { metadataRepresentationComponent } from '../../../metadata-representation/metadata-representation.decorator';
import { MetadataRepresentationListElementComponent } from '../metadata-representation-list-element.component';
//@metadataRepresentationComponent('Publication', MetadataRepresentationType.PlainText)
// For now, authority controlled fields are rendered the same way as plain text fields
//@metadataRepresentationComponent('Publication', MetadataRepresentationType.AuthorityControlled)
@metadataRepresentationComponent('Publication', MetadataRepresentationType.BrowseLink)
@Component({
  selector: 'ds-browse-link-metadata-list-element',
  templateUrl: './browse-link-metadata-list-element.component.html',
})
/**
 * A component for displaying MetadataRepresentation objects in the form of plain text
 * It will simply use the value retrieved from MetadataRepresentation.getValue() to display as plain text
 */
export class BrowseLinkMetadataListElementComponent extends MetadataRepresentationListElementComponent {
  /**
   * Get the appropriate query parameters for this browse link, depending on whether the browse definition
   * expects 'startsWith' (eg browse by date) or 'value' (eg browse by title)
   */
  getQueryParams() {
    const queryParams = { startsWith: this.mdRepresentation.getValue() };
    if (this.mdRepresentation.browseDefinition.getRenderType() === VALUE_LIST_BROWSE_DEFINITION.value) {
      return { value: this.mdRepresentation.getValue() };
    }
    return queryParams;
  }
}
