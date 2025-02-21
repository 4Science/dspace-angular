import { MetadataMap } from '@dspace/core';

/**
 * Properties to send to the REST API for uploading a bitstream
 */
export class UploaderProperties {
  /**
   * A custom name for the bitstream
   */
  name: string;

  /**
   * PolicyMetadata for the bitstream (e.g. dc.description)
   */
  metadata: MetadataMap;

  /**
   * The name of the bundle to upload the bitstream to
   */
  bundleName: string;
}
