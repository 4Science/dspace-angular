import {
  autoserialize,
  deserialize,
} from 'cerialize';

import { typedObject } from '../cache';
import { ListableObject } from '../object-collection';
import { GenericConstructor } from '../shared';
import { HALLink } from '../shared';
import { HALResource } from '../shared';
import { ResourceType } from '../shared';
import { excludeFromEquals } from '../utilities';
import { METADATA_SCHEMA } from './metadata-schema.resource-type';

/**
 * Class that represents a metadata schema
 */
@typedObject
export class MetadataSchema extends ListableObject implements HALResource {
  static type = METADATA_SCHEMA;

  /**
   * The unique identifier for this metadata schema
   */
  @autoserialize
  id: number;

  /**
   * The object type
   */
  @excludeFromEquals
  @autoserialize
  type: ResourceType;

  /**
   * A unique prefix that defines this schema
   */
  @autoserialize
  prefix: string;

  /**
   * The namespace of this metadata schema
   */
  @autoserialize
  namespace: string;

  @deserialize
  _links: {
    self: HALLink,
  };

  /**
   * Method that returns as which type of object this object should be rendered
   */
  getRenderTypes(): (string | GenericConstructor<ListableObject>)[] {
    return [this.constructor as GenericConstructor<ListableObject>];
  }
}
