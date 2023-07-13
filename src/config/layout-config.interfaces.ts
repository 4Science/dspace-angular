import { Config } from './config.interface';

export interface UrnConfig extends Config {
  name: string;
  baseUrl: string;
}

export interface CrisRefEntityStyleConfig extends Config {
  icon: string;
  style: string;
}

export interface CrisRefConfig extends Config {
  entityType: string;
  entityStyle: {
    default: CrisRefEntityStyleConfig;
    [entity: string]: CrisRefEntityStyleConfig;
  };
}

export interface CrisLayoutMetadataBoxConfig extends Config {
  defaultMetadataLabelColStyle: string;
  defaultMetadataValueColStyle: string;
  loadMore: CrisLoadMoreConfig;
}

export interface CrisLayoutTypeConfig {
  orientation: string;
}

export interface NavbarConfig extends Config {
  showCommunityCollection: boolean;
}

export interface involvedInstitution {
  src: string;
  href: string;
}

export interface FooterConfig extends Config {
  involvedInstitutions: involvedInstitution[];
}

export interface CrisItemPageConfig extends Config {
  [entity: string]: CrisLayoutTypeConfig;
  default: CrisLayoutTypeConfig;
}

export interface CrisLoadMoreConfig extends Config {
  first: number;
  last: number;
}

export interface CrisRefStyleMetadata extends Config {
  [metadata: string]: string;
  default: string;
}

export interface CrisLayoutConfig extends Config {
  urn: UrnConfig[];
  crisRef: CrisRefConfig[];
  crisRefStyleMetadata: CrisRefStyleMetadata;
  itemPage: CrisItemPageConfig;
  metadataBox: CrisLayoutMetadataBoxConfig;
}

export interface LayoutConfig extends Config {
  navbar: NavbarConfig;
  search: SearchLayoutConfig;
  footer: FooterConfig;
}

export interface SuggestionConfig extends Config {
  source: string;
  collectionId: string;
}

export interface SearchLayoutConfig {
  filters: SearchFiltersConfig;
}

export interface SearchFiltersConfig {
  datepicker: string[];
}
