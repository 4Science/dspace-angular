import {
  autoserialize,
  inheritSerialization,
} from 'cerialize';

import { typedObject } from '../../cache/builders/build-decorators';
import { DSpaceObject } from '../../shared/dspace-object.model';
import { HALLink } from '../../shared/hal-link.model';
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

  /**
   * Google reCAPTCHA token for spam protection
   */
  @autoserialize
  public captcha: string;

  _links: {
    self: HALLink;
  };

}
