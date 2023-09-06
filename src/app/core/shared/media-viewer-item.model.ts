import { Bitstream } from './bitstream.model';

/**
 * Model representing a media viewer item
 */
export class MediaViewerItem {
  /**
   * Incoming Bitstream
   */
  bitstream: Bitstream;

  /**
   * Incoming Bitstream format type
   */
  format: string;

  /**
   * Incoming Bitstream format mime type
   */
  mimetype: string;

  /**
   * Incoming Bitstream thumbnail
   */
  thumbnail: string | Bitstream;

  /**
   * Incoming manifest url
   */
  manifestUrl?: string;

  /**
   * Incoming Bitstream format description
   */
  formatDescription?: string;

  /**
   * Incoming Bitstream name
   */
  name?: string;
}
