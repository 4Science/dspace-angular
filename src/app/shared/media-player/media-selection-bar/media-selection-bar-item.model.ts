import {Bitstream} from '../../../core/shared/bitstream.model';

/**
 * Model representing a selection bar item
 */
export class MediaSelectionBarItem {
  /**
   * Incoming Bitstream
   */
  bitstream: Bitstream;

  /**
   * Incoming Bitstream thumbnail
   */
  thumbnail: string;

  /**
   * Incoming scene timestamp
   */
  sceneTimestamp?: number;
}
