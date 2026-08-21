import { Component } from '@angular/core';

import { GenericConstructor } from '../../core/shared/generic-constructor';
import { ItemVersionsComponent } from '../../item-page/versions/item-versions.component';
import { CrisLayoutCollectionBoxComponent } from '../cris-layout-matrix/cris-layout-box-container/boxes/cris-layout-collection-box/cris-layout-collection-box.component';
import { CrisLayoutIIIFViewerBoxComponent } from '../cris-layout-matrix/cris-layout-box-container/boxes/iiif-viewer/cris-layout-iiif-viewer-box.component';
import { CrisLayoutMetadataBoxComponent } from '../cris-layout-matrix/cris-layout-box-container/boxes/metadata/cris-layout-metadata-box.component';
import { CrisLayoutMetricsBoxComponent } from '../cris-layout-matrix/cris-layout-box-container/boxes/metrics/cris-layout-metrics-box.component';
import { CrisLayoutRelationBoxComponent } from '../cris-layout-matrix/cris-layout-box-container/boxes/relation/cris-layout-relation-box.component';
import { LayoutBox } from '../enums/layout-box.enum';

export interface CrisLayoutBoxRenderOptions {
  componentRef: GenericConstructor<Component> & { hasOwnContainer: boolean };
}

const layoutBoxesMap = new Map<LayoutBox, CrisLayoutBoxRenderOptions>([
  [ LayoutBox.COLLECTIONS, { componentRef: CrisLayoutCollectionBoxComponent } ],
  [ LayoutBox.IIIFVIEWER, { componentRef: CrisLayoutIIIFViewerBoxComponent } ],
  [ LayoutBox.METADATA, { componentRef: CrisLayoutMetadataBoxComponent } ],
  [ LayoutBox.METRICS, { componentRef: CrisLayoutMetricsBoxComponent } ],
  [ LayoutBox.RELATION, { componentRef: CrisLayoutRelationBoxComponent } ],
  [ LayoutBox.VERSIONING, { componentRef: ItemVersionsComponent } ],
]);

export function getCrisLayoutBox(boxType: LayoutBox): CrisLayoutBoxRenderOptions {
  return layoutBoxesMap.get(boxType);
}
