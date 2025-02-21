import {
  autoserialize,
  inheritSerialization,
} from 'cerialize';

import { typedObject } from '../../cache';
import { DSpaceObject } from '../../shared';
import { HALLink } from '../../shared';
import { FEEDBACK } from './feedback.resource-type';

@typedObject
@inheritSerialization(DSpaceObject)
export class Feedback extends DSpaceObject {
  static type = FEEDBACK;

  /**
   * The email address
   */
  @autoserialize
  public email: string;

  /**
   * A string representing message the user inserted
   */
  @autoserialize
  public message: string;
  /**
   * A string representing the page from which the user came from
   */
  @autoserialize
  public page: string;

  _links: {
    self: HALLink;
  };

}
