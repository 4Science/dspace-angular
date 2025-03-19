import { Config } from './config.interface';

export interface MiradorConfig extends Config {
  enableDownloadPlugin: boolean;
  itemDownloadMetadataConfig: string;
  collectionDownloadMetadataConfig: string;
  restPropertyDownloadConfig: string;
}

export type MiradorMetadataDownloadValue = 'no' | 'all' | 'alternative' | 'single-image';
