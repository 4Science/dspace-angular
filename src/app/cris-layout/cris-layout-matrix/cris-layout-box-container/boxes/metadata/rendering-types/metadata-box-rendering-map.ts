import { AdvancedAttachmentComponent } from './advanced-attachment/advanced-attachment.component';
import { AttachmentComponent } from './attachment/attachment.component';
import { BrowseComponent } from './browse/browse.component';
import { CrisrefComponent } from './crisref/crisref.component';
import { DateComponent } from './date/date.component';
import { FieldRenderingType } from './field-rendering-type';
import { GmapComponent } from './gmap/gmap.component';
import { HeadingComponent } from './heading/heading.component';
import { HtmlComponent } from './html/html.component';
import { IdentifierComponent } from './identifier/identifier.component';
import { LinkComponent } from './link/link.component';
import { LinkAuthorityComponent } from './link-authority/link-authority.component';
import { LongtextComponent } from './longtext/longtext.component';
import { MarkdownComponent } from './markdown/markdown.component';
import { GooglemapsGroupComponent } from './metadataGroup/googlemaps-group/googlemaps-group.component';
import { InlineComponent } from './metadataGroup/inline/inline.component';
import { OpenstreetmapGroupComponent } from './metadataGroup/openstreetmap-group/openstreetmap-group.component';
import { TableComponent } from './metadataGroup/table/table.component';
import { OpenStreetMapRenderingComponent } from './open-street-map/open-street-map-rendering.component';
import { OrcidComponent } from './orcid/orcid.component';
import { MetadataBoxFieldRenderOptions } from './rendering-type.model';
// eslint-disable-next-line dspace-angular-ts/themed-component-usages
import { SearchComponent } from './search/search.component';
import { TagComponent } from './tag/tag.component';
import { TagBrowseComponent } from './tag-browse/tag-browse.component';
import { TagSearchComponent } from './tag-search/tag-search.component';
import { TextComponent } from './text/text.component';
import { ThumbnailRenderingComponent } from './thumbnail/thumbnail.component';
import { ValuepairComponent } from './valuepair/valuepair.component';

export const layoutBoxesMap = new Map<FieldRenderingType, MetadataBoxFieldRenderOptions>([
  [FieldRenderingType.TEXT, { componentRef: TextComponent, structured: false } as MetadataBoxFieldRenderOptions],
  [FieldRenderingType.HEADING, { componentRef: HeadingComponent, structured: false } as MetadataBoxFieldRenderOptions],
  [FieldRenderingType.LONGTEXT, {
    componentRef: LongtextComponent,
    structured: false,
  } as MetadataBoxFieldRenderOptions],
  [FieldRenderingType.DATE, { componentRef: DateComponent, structured: false } as MetadataBoxFieldRenderOptions],
  [FieldRenderingType.LINK, { componentRef: LinkComponent, structured: false } as MetadataBoxFieldRenderOptions],
  [FieldRenderingType.IDENTIFIER, {
    componentRef: IdentifierComponent,
    structured: false,
  } as MetadataBoxFieldRenderOptions],
  [FieldRenderingType.CRISREF, { componentRef: CrisrefComponent, structured: false } as MetadataBoxFieldRenderOptions],
  [FieldRenderingType.THUMBNAIL, {
    componentRef: ThumbnailRenderingComponent,
    structured: true,
  } as MetadataBoxFieldRenderOptions],
  [FieldRenderingType.ATTACHMENT, {
    componentRef: AttachmentComponent,
    structured: true,
  } as MetadataBoxFieldRenderOptions],
  [FieldRenderingType.TABLE, { componentRef: TableComponent, structured: true } as MetadataBoxFieldRenderOptions],
  [FieldRenderingType.INLINE, { componentRef: InlineComponent, structured: true } as MetadataBoxFieldRenderOptions],
  [FieldRenderingType.ORCID, { componentRef: OrcidComponent, structured: false } as MetadataBoxFieldRenderOptions],
  [FieldRenderingType.TAG, { componentRef: TagComponent, structured: true } as MetadataBoxFieldRenderOptions],
  [FieldRenderingType.VALUEPAIR, {
    componentRef: ValuepairComponent,
    structured: false,
  } as MetadataBoxFieldRenderOptions],
  [FieldRenderingType.ADVANCEDATTACHMENT, {
    componentRef: AdvancedAttachmentComponent,
    structured: true,
  } as MetadataBoxFieldRenderOptions],
  [FieldRenderingType.AUTHORITYLINK, {
    componentRef: LinkAuthorityComponent,
    structured: false,
  } as MetadataBoxFieldRenderOptions],
  [FieldRenderingType.HTML, {
    componentRef: HtmlComponent,
    structured: false,
  } as MetadataBoxFieldRenderOptions],
  [FieldRenderingType.GMAP, {
    componentRef: GmapComponent,
    structured: false,
  } as MetadataBoxFieldRenderOptions],
  [FieldRenderingType.GMAPGROUP, {
    componentRef: GooglemapsGroupComponent,
    structured: true,
  } as MetadataBoxFieldRenderOptions],
  [FieldRenderingType.OSMAP, {
    componentRef: OpenStreetMapRenderingComponent,
    structured: false,
  } as MetadataBoxFieldRenderOptions],
  [FieldRenderingType.OSMAPGROUP, {
    componentRef: OpenstreetmapGroupComponent,
    structured: true,
  } as MetadataBoxFieldRenderOptions],
  [FieldRenderingType.BROWSE, {
    componentRef: BrowseComponent,
    structured: false,
  } as MetadataBoxFieldRenderOptions],
  [FieldRenderingType.TAGBROWSE, {
    componentRef: TagBrowseComponent,
    structured: false,
  } as MetadataBoxFieldRenderOptions],
  [FieldRenderingType.MARKDOWN, {
    componentRef: MarkdownComponent,
    structured: false,
  } as MetadataBoxFieldRenderOptions],
  [FieldRenderingType.SEARCH, {
    /* eslint-disable-next-line dspace-angular-ts/themed-component-usages */
    componentRef: SearchComponent,
    structured: false,
  } as MetadataBoxFieldRenderOptions],
  [FieldRenderingType.TAGSEARCH, {
    componentRef: TagSearchComponent,
    structured: false,
  } as MetadataBoxFieldRenderOptions],
]);
