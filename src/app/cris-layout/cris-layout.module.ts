import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
  NgbAccordionModule,
  NgbActiveModal,
} from '@ng-bootstrap/ng-bootstrap';

import { ItemSharedModule } from '../item-page/item-shared.module';
import { MiradorViewerModule } from '../item-page/mirador-viewer/mirador-viewer.module';
import { ViewersSharedModule } from '../item-page/viewer-provider/viewers/viewers-shared.module';
import { MyDSpacePageModule } from '../my-dspace-page/my-dspace-page.module';
import { ComcolModule } from '../shared/comcol/comcol.module';
import { ContextMenuModule } from '../shared/context-menu/context-menu.module';
import { FormModule } from '../shared/form/form.module';
import { GooglemapsModule } from '../shared/googlemaps/googlemaps.module';
import { MarkdownViewerModule } from '../shared/markdown-viewer/markdown-viewer.module';
import { MediaPlayerModule } from '../shared/media-player/media-player.module';
import { MetricsModule } from '../shared/metric/metrics.module';
import { OpenStreetMapModule } from '../shared/open-street-map/open-street-map.module';
import { SearchModule } from '../shared/search/search.module';
import { SharedModule } from '../shared/shared.module';
import { CrisLayoutComponent } from './cris-layout.component';
import { CrisLayoutLeadingComponent } from './cris-layout-leading/cris-layout-leading.component';
import { CrisLayoutHorizontalComponent } from './cris-layout-loader/cris-layout-horizontal/cris-layout-horizontal.component';
import { CrisLayoutNavbarComponent } from './cris-layout-loader/cris-layout-horizontal/cris-layout-navbar/cris-layout-navbar.component';
import { CrisLayoutLoaderComponent } from './cris-layout-loader/cris-layout-loader.component';
import { CrisLayoutSidebarComponent } from './cris-layout-loader/cris-layout-vertical/cris-layout-sidebar/cris-layout-sidebar.component';
import { CrisLayoutVerticalComponent } from './cris-layout-loader/cris-layout-vertical/cris-layout-vertical.component';
import { CrisLayoutSidebarItemComponent } from './cris-layout-loader/shared/sidebar-item/cris-layout-sidebar-item.component';
import { CrisLayoutCollectionBoxComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/cris-layout-collection-box/cris-layout-collection-box.component';
import { HierarchyComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/hierarchy/hierarchy.component';
import { CrisLayoutIIIFToolbarBoxComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/iiif-toolbar/cris-layout-iiif-toolbar-box.component';
import { CrisLayoutIIIFViewerBoxComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/iiif-viewer/cris-layout-iiif-viewer-box.component';
import { CrisLayoutMediaBoxComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/media-box/cris-layout-media-box.component';
import { CrisLayoutMetadataBoxComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metadata/cris-layout-metadata-box.component';
import { AdvancedAttachmentComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metadata/rendering-types/advanced-attachment/advanced-attachment.component';
import { AttachmentRenderComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metadata/rendering-types/advanced-attachment/bitstream-attachment/attachment-render/attachment-render.component';
import { AttachmentRenderingModule } from './cris-layout-matrix/cris-layout-box-container/boxes/metadata/rendering-types/advanced-attachment/bitstream-attachment/attachment-render/attachment-rendering.module';
import { BitstreamAttachmentComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metadata/rendering-types/advanced-attachment/bitstream-attachment/bitstream-attachment.component';
import { AttachmentComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metadata/rendering-types/attachment/attachment.component';
import { BrowseComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metadata/rendering-types/browse/browse.component';
import { CrisrefComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metadata/rendering-types/crisref/crisref.component';
import { DateComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metadata/rendering-types/date/date.component';
import { GmapComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metadata/rendering-types/gmap/gmap.component';
import { HeadingComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metadata/rendering-types/heading/heading.component';
import { HtmlComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metadata/rendering-types/html/html.component';
import { IdentifierComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metadata/rendering-types/identifier/identifier.component';
import { LinkComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metadata/rendering-types/link/link.component';
import { LinkAuthorityComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metadata/rendering-types/link-authority/link-authority.component';
import { LongtextComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metadata/rendering-types/longtext/longtext.component';
import { MarkdownComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metadata/rendering-types/markdown/markdown.component';
import { InlineComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metadata/rendering-types/metadataGroup/inline/inline.component';
import { TableComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metadata/rendering-types/metadataGroup/table/table.component';
import { OpenStreetMapRenderingComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metadata/rendering-types/open-street-map/open-street-map-rendering.component';
import { OrcidComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metadata/rendering-types/orcid/orcid.component';
import { SearchComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metadata/rendering-types/search/search.component';
import { TagComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metadata/rendering-types/tag/tag.component';
import { TagBrowseComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metadata/rendering-types/tag-browse/tag-browse.component';
import { TagSearchComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metadata/rendering-types/tag-search/tag-search.component';
import { TextComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metadata/rendering-types/text/text.component';
import { ThumbnailComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metadata/rendering-types/thumbnail/thumbnail.component';
import { ValuepairComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metadata/rendering-types/valuepair/valuepair.component';
import { MetadataContainerComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metadata/row/metadata-container/metadata-container.component';
import { MetadataRenderComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metadata/row/metadata-container/metadata-render/metadata-render.component';
import { RowComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metadata/row/row.component';
import { CrisLayoutMetricsBoxComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metrics/cris-layout-metrics-box.component';
import { MetricRowComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metrics/metric-row/metric-row.component';
import { CrisLayoutRelationBoxComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/relation/cris-layout-relation-box.component';
import { CrisLayoutBoxContainerComponent } from './cris-layout-matrix/cris-layout-box-container/cris-layout-box-container.component';
import { CrisLayoutMatrixComponent } from './cris-layout-matrix/cris-layout-matrix.component';
import { CrisLayoutLoaderDirective } from './directives/cris-layout-loader.directive';
import { DsDatePipe } from './pipes/ds-date.pipe';
import { LoadMoreService } from './services/load-more.service';

const ENTRY_COMPONENTS = [
  // put only entry components that use custom decorator
  CrisLayoutVerticalComponent,
  CrisLayoutHorizontalComponent,
  CrisLayoutMetadataBoxComponent,
  CrisLayoutCollectionBoxComponent,
  TextComponent,
  HtmlComponent,
  HeadingComponent,
  CrisLayoutRelationBoxComponent,
  CrisLayoutIIIFViewerBoxComponent,
  CrisLayoutIIIFToolbarBoxComponent,
  LongtextComponent,
  DateComponent,
  LinkComponent,
  IdentifierComponent,
  CrisrefComponent,
  ThumbnailComponent,
  AttachmentComponent,
  HierarchyComponent,
  CrisLayoutMetricsBoxComponent,
  TableComponent,
  InlineComponent,
  OrcidComponent,
  ValuepairComponent,
  TagComponent,
  AdvancedAttachmentComponent,
  LinkAuthorityComponent,
  GmapComponent,
  OpenStreetMapRenderingComponent,
  BrowseComponent,
  TagBrowseComponent,
  MarkdownComponent,
  SearchComponent,
  TagSearchComponent,
  AdvancedAttachmentComponent,
  CrisLayoutMediaBoxComponent,
];

@NgModule({
  declarations: [
    ...ENTRY_COMPONENTS,
    CrisLayoutLoaderDirective,
    CrisLayoutComponent,
    CrisLayoutLeadingComponent,
    CrisLayoutLoaderComponent,
    CrisLayoutMatrixComponent,
    CrisLayoutSidebarComponent,
    CrisLayoutNavbarComponent,
    CrisLayoutSidebarItemComponent,
    CrisLayoutBoxContainerComponent,
    MetricRowComponent,
    TableComponent,
    InlineComponent,
    OrcidComponent,
    ValuepairComponent,
    TagComponent,
    DsDatePipe,
    RowComponent,
    MetadataContainerComponent,
    MetadataRenderComponent,
    MarkdownComponent,
    BitstreamAttachmentComponent,
    AttachmentRenderComponent,
  ],
  providers:[ LoadMoreService, NgbActiveModal ],
  imports: [
    CommonModule,
    SharedModule,
    SearchModule.withEntryComponents(),
    GooglemapsModule,
    OpenStreetMapModule,
    MyDSpacePageModule,
    ContextMenuModule.withEntryComponents(),
    NgbAccordionModule,
    ComcolModule,
    MiradorViewerModule,
    MarkdownViewerModule,
    ItemSharedModule,
    ViewersSharedModule,
    MetricsModule,
    AttachmentRenderingModule,
    FormModule,
    MediaPlayerModule,
  ],
  exports: [
    CrisLayoutComponent,
    CrisrefComponent,
  ],
})
export class CrisLayoutModule {
  /**
   * NOTE: this method allows to resolve issue with components that using a custom decorator
   * which are not loaded during CSR otherwise
   */
  static withEntryComponents() {
    return {
      ngModule: CrisLayoutModule,
      providers: ENTRY_COMPONENTS.map((component) => ({ provide: component })),
    };
  }
}
