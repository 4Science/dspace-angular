import { typedObject } from '../../cache/builders/build-decorators';
import { CacheableObject } from '../../cache/cacheable-object.model';
import { SECTION } from './section.resource-type';
import { autoserialize, deserialize } from 'cerialize';
import { HALLink } from '../../shared/hal-link.model';
import { excludeFromEquals } from '../../utilities/equals.decorators';
import { ResourceType } from '../../shared/resource-type';

/**
 * Describes a type of Section.
 */
@typedObject
export class Section extends CacheableObject {
  static type = SECTION;

  /**
   * The object type
   */
  @excludeFromEquals
  @autoserialize
  type: ResourceType;

  /**
   * The identifier of this Section.
   */
  @autoserialize
  id: string;

  @autoserialize
  componentRows: SectionComponent[][];

  /**
   * The {@link HALLink}s for this section
   */
  @deserialize
  _links: {
    self: HALLink,
  };

}

export interface SectionComponent {
  componentType: string;
  style: string;
}

export interface BrowseSection extends SectionComponent {
  browseNames: string[];
  componentType: 'browse';
}

export interface TopSection extends SectionComponent {
  discoveryConfigurationName: string;
  sortField: string;
  order: string;
  titleKey: string;
  componentType: 'top';
  numberOfItems: number;

  showAsCard: boolean;
  showLayoutSwitch: boolean;
  defaultLayoutMode: LayoutModeEnum;
  cardStyle?: string;
  itemListStyle?: string;
  cardColumnStyle?: string;
  showAllResults: boolean;
}

export interface GridSection extends SectionComponent {
  discoveryConfigurationName: string;
  'main-content-link': string;
}

export interface SearchSection extends SectionComponent {
  discoveryConfigurationName: string;
  componentType: 'search';
  searchType: string;
  initialStatements: number;
  displayTitle: boolean;
}

export interface FacetSection extends SectionComponent {
  discoveryConfigurationName: string;
  componentType: 'facet';
  facetsPerRow: number;
}

export interface TextRowSection extends SectionComponent {
  content: string;
  contentType: string;
  componentType: 'text-row';
}

export interface MultiColumnTopSection extends SectionComponent {
  discoveryConfigurationName: string;
  sortField: string;
  order: string;
  titleKey: string;
  columnList: TopSectionColumn[];
  componentType: 'multi-column-top';
}

export interface TopSectionColumn {
  style: string;
  metadataField: string;
  titleKey: string;
}

export enum LayoutModeEnum {
  LIST = 'list',
  CARD = 'card'
}

export interface CarouselSection extends SectionComponent {
  discoveryConfigurationName: string;
  order: string;
  sortField: string;
  numberOfItems: number;
  style: string;
  title: string;
  link: string;
  description: string;
  componentType: 'carousel';
  targetBlank: boolean ;
  fitWidth: boolean;
  fitHeight: boolean;
  keepAspectRatio: boolean;
  aspectRatio: number;
  carouselHeightPx: number;
  captionStyle: string;
  titleStyle: string;
}
