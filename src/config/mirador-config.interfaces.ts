import { Config } from './config.interface';

export interface MiradorConfig extends Config {
  enableDownloadPlugin: boolean;
  enableAnnotationServer: boolean;
  annotationServerUrl?: string;
}
