import {
  autoserialize,
  deserialize,
} from 'cerialize';

import { isNotEmpty } from '../../../../shared/empty.util';
import { PLACEHOLDER_PARENT_METADATA } from '../../../../shared/form/builder/ds-dynamic-form-ui/ds-dynamic-form-constants';
import { OtherInformation } from '../../../../shared/form/builder/models/form-field-metadata-value.model';
import { ListableObject } from '../../../../shared/object-collection/shared/listable-object.model';
import { typedObject } from '../../../cache/builders/build-decorators';
import { GenericConstructor } from '../../../shared/generic-constructor';
import { HALLink } from '../../../shared/hal-link.model';
import { Metadata } from '../../../shared/metadata.utils';
import { excludeFromEquals } from '../../../utilities/equals.decorators';
import { VOCABULARY_ENTRY } from './vocabularies.resource-type';

/**
 * Model class for a VocabularyEntry
 */
@typedObject
export class VocabularyEntry extends ListableObject {
  static type = VOCABULARY_ENTRY;

  /**
   * The identifier of this vocabulary entry
   */
  @autoserialize
  authority: string;

  /**
   * The display value of this vocabulary entry
   */
  @autoserialize
  display: string;

  /**
   * The value of this vocabulary entry
   */
  @autoserialize
  value: string;

  /**
   * An object containing additional information related to this vocabulary entry
   */
  @autoserialize
  otherInformation: OtherInformation;

  /**
   * A value representing security level value of the metadata
   */
  @autoserialize
    securityLevel: number;

  /**
   * A string representing the kind of vocabulary entry
   */
  @excludeFromEquals
  @autoserialize
  public type: any;

  /**
   * The {@link HALLink}s for this ExternalSourceEntry
   */
  @deserialize
  _links: {
    self: HALLink;
    vocabularyEntryDetail?: HALLink;
  };

  /**
   * This method checks if entry has an authority value
   *
   * @return boolean
   */
  hasAuthority(): boolean {
    return Metadata.hasValidAuthority(this.authority);
  }

  /**
   * This method checks if entry has a value
   *
   * @return boolean
   */
  hasValue(): boolean {
    return isNotEmpty(this.value);
  }

  /**
   * This method checks if entry has related information object
   *
   * @return boolean
   */
  hasOtherInformation(): boolean {
    return isNotEmpty(this.otherInformation);
  }

  /**
   * This method checks if entry has a placeholder as value
   *
   * @return boolean
   */
  hasPlaceholder(): boolean {
    return this.hasValue() && this.value === PLACEHOLDER_PARENT_METADATA;
  }

  /**
   * Method that returns as which type of object this object should be rendered
   */
  getRenderTypes(): (string | GenericConstructor<ListableObject>)[] {
    return [this.constructor as GenericConstructor<ListableObject>];
  }

}
