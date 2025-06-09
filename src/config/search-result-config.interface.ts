import { AdditionalMetadataConfig } from './additional-metadata.config';
import { Config } from './config.interface';

export interface SearchResultConfig extends Config {
  additionalMetadataFields: SearchResultAdditionalMetadataEntityTypeConfig[],
  authorMetadata: string[];
  authorRoleMetadataMap: {[key: string]: string},
}

export interface SearchResultAdditionalMetadataEntityTypeConfig extends Config {
  entityType: string,
  metadataConfiguration: Array<AdditionalMetadataConfig>[]
}
