import { Config } from './config.interface';

export interface MiradorConfig extends Config {
  enableDownloadPlugin: boolean;
  enableAnnotationServer: boolean;
  annotationServerUrl?: string;
  downloadMetadataConfig: string;
  downloadRestConfig: string;
  downloadSelectOptions: MiradorMetadataDownloadValue[]
}

export type MiradorMetadataDownloadValue = 'no' | 'all' | 'alternative' | 'single-image';
