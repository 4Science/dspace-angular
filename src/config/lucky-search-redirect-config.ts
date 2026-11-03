import {Config} from './config.interface';

export interface LuckySearchRedirectConfig extends Config {
  [indexName: string]: number;
  default: number;
}
