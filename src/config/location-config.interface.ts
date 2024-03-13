import { Config } from './config.interface';

export interface NominatimApiConfig extends Config {
  searchEndpoint: string,
  reverseSearchEndpoint: string,
  statusEndpoint: string,
}

export interface LocationConfig extends Config {
  nominatimApi: NominatimApiConfig,
}
