import {Component, Input} from '@angular/core';

import {hasValue} from '../../../../../../shared/empty.util';
import {Item} from '../../../../../../core/shared/item.model';
import {TranslateService} from '@ngx-translate/core';
import {LayoutField} from '../../../../../../core/layout/models/box.model';
import {MetadataValue} from '../../../../../../core/shared/metadata.models';
import {Chips} from '../../../../../../shared/chips/models/chips.model';

/**
 * This class defines the basic model to extends for create a new
 * field render component
 */
@Component({
  template: ''
})
export abstract class RenderingTypeModelComponent {

  /**
   * Current DSpace item
   */
  @Input() item: Item;
  /**
   * Current field
   */
  @Input() field: LayoutField;
  /**
   * The rendering sub-type, if exists
   * e.g. for type identifier.doi this property
   * contains the sub-type doi
   */
  @Input() renderingSubType: string;

  /**
   * Returns the value of the metadata to show
   */
  @Input() nested: boolean;

  @Input() indexToBeRendered;

  /**
   * The prefix used for box field label's i18n key
   */
  fieldI18nPrefix = 'layout.field.label.';

  constructor(protected translateService: TranslateService) {
  }

  /**
   * Returns all metadata values in the item
   */
  get metadataValues(): string[] {
    return this.field.metadata ? this.item.allMetadataValues(this.field.metadata) : [];
  }

  get metadata(): MetadataValue[] {
    return this.field.metadata ? this.item.allMetadata(this.field.metadata) : [];
  }

  /**
   * Returns true if the field has label, false otherwise
   */
  get hasLabel(): boolean {
    return hasValue(this.field.label);
  }

  /**
   * Returns a string representing the label of field if exists
   */
  get label(): string {
    const fieldLabelI18nKey = this.fieldI18nPrefix + this.field.label;
    const header: string = this.translateService.instant(fieldLabelI18nKey);
    if (header === fieldLabelI18nKey ) {
      // if translation does not exist return the value present in the header property
      return this.translateService.instant(this.field.label);
    } else {
      return header;
    }
  }

  /**
   * Returns a string representing the style of field container if exists
   */
  get containerStyle(): string {
    return this.field.style;
  }

  /**
   * Returns a string representing the style of field label if exists
   */
  get labelStyle(): string {
    return this.field.styleLabel;
  }

  /**
   * Returns a string representing the style of field value if exists
   */
  get valueStyle(): string {
    return this.field.styleValue || '';
  }

  /**
   * returns the search link
   */
  getSearchHrefLink(rendering, renderingSubType, metadata, metadataValue): string {
    let searchLinkHref = '/search?';
    let renderingArray = rendering.split('.');
    const indexSuffix = renderingArray[renderingArray.length - 1];
    // add search configuration to querystring
    if (renderingSubType !== 'default') {
      searchLinkHref += `configuration=${renderingSubType}&`;
    }
    // add search query to querystring
    switch (indexSuffix) {
      case 'default':
        searchLinkHref += `query="${metadataValue}"`;
        break;
      case 'auto':
        searchLinkHref += `query=${metadata}:"${metadataValue}"`;
        break;
      default:
        searchLinkHref += `query=${indexSuffix}:"${metadataValue}"`;
        break;
    }
    return searchLinkHref;
  }

  /**
   * Creates the chips component with the required values
   * @params initChipsValues values to be rendered in chip items
   */
  initRenderingChips(initChipsValues: any[], type = 'tag', metadataType = '') {
    if (type === 'search') {
      initChipsValues.forEach((element, ind) => {
        initChipsValues[ind] = {
          value: element,
          href: this.getSearchHrefLink(this.field.rendering, this.renderingSubType, this.field.metadata, element)
        };
      });
    } else if (type === 'browse') {
      initChipsValues.forEach((element, ind) => {
        initChipsValues[ind] = {
          value: element,
          href: `/browse/${metadataType}?value=${element}`
        };
      });
    }
    return new Chips(initChipsValues,'value');
  }
}
