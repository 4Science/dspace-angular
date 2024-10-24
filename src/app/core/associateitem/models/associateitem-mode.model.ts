import { typedObject } from '../../cache/builders/build-decorators';
import { ResourceType } from '../../shared/resource-type';
import { autoserialize, autoserializeAs, deserialize, deserializeAs } from 'cerialize';
import { IDToUUIDSerializer } from '../../cache/id-to-uuid-serializer';
import { HALLink } from '../../shared/hal-link.model';
import { excludeFromEquals } from '../../utilities/equals.decorators';
import { DSpaceObject } from '../../shared/dspace-object.model';

/**
 * Describes a AssociateItemMode mode
 */
@typedObject
export class AssociateItemMode extends DSpaceObject {

  static type = new ResourceType('associateitemmode');

  /**
   * The object type
   */
  @excludeFromEquals
  @autoserialize
  type: ResourceType;

  /**
   * The universally unique identifier of this Item
   * This UUID is generated client-side and isn't used by the backend.
   * It is based on the ID, so it will be the same for each refresh.
   */
  @deserializeAs(new IDToUUIDSerializer(AssociateItemMode.type.value), 'name')
  uuid: string;

  /**
   * Name of the EditItem Mode
   */
  // @autoserialize
  // name: string;

  @autoserializeAs('name')
  modename: string;

  /**
   * Label used for i18n
   */
  @autoserialize
  label: string;

  /**
   * Name of the discovery
   */
  @autoserialize
  discovery: string;

  /**
   * Name of the metadatafield
   */
  @autoserialize
  metadatafield: string;

  /**
   * The {@link HALLink}s for this AssociateItemMode
   */
  @deserialize
  _links: {
    self: HALLink;
  };
}
