import { ItemVersionsComponent } from '../../item-page/versions/item-versions.component';
import { CrisLayoutCollectionBoxComponent } from '../cris-layout-matrix/cris-layout-box-container/boxes/cris-layout-collection-box/cris-layout-collection-box.component';
import { CrisLayoutIIIFViewerBoxComponent } from '../cris-layout-matrix/cris-layout-box-container/boxes/iiif-viewer/cris-layout-iiif-viewer-box.component';
import { CrisLayoutMetadataBoxComponent } from '../cris-layout-matrix/cris-layout-box-container/boxes/metadata/cris-layout-metadata-box.component';
import { CrisLayoutMetricsBoxComponent } from '../cris-layout-matrix/cris-layout-box-container/boxes/metrics/cris-layout-metrics-box.component';
import { CrisLayoutRelationBoxComponent } from '../cris-layout-matrix/cris-layout-box-container/boxes/relation/cris-layout-relation-box.component';
import { LayoutBox } from '../enums/layout-box.enum';
import { getCrisLayoutBox } from './cris-layout-box.decorator';

describe('cris-layout-box.decorator', () => {

  describe('static hasOwnContainer property on components', () => {
    const components: Array<{ name: string; component: any; expected: boolean }> = [
      { name: 'CrisLayoutCollectionBoxComponent', component: CrisLayoutCollectionBoxComponent, expected: false },
      { name: 'CrisLayoutIIIFViewerBoxComponent', component: CrisLayoutIIIFViewerBoxComponent, expected: false },
      { name: 'CrisLayoutMetadataBoxComponent', component: CrisLayoutMetadataBoxComponent, expected: false },
      { name: 'CrisLayoutMetricsBoxComponent', component: CrisLayoutMetricsBoxComponent, expected: true },
      { name: 'CrisLayoutRelationBoxComponent', component: CrisLayoutRelationBoxComponent, expected: false },
      { name: 'ItemVersionsComponent', component: ItemVersionsComponent, expected: false },
    ];

    components.forEach(({ name, component, expected }) => {
      it(`${name} should have static hasOwnContainer = ${expected}`, () => {
        expect(component.hasOwnContainer).toBeDefined();
        expect(component.hasOwnContainer).toBe(expected);
      });
    });
  });

  describe('layoutBoxesMap consistency', () => {
    it('should have entries for all expected layout box types', () => {
      const expectedTypes: LayoutBox[] = [
        LayoutBox.COLLECTIONS,
        LayoutBox.IIIFVIEWER,
        LayoutBox.METADATA,
        LayoutBox.METRICS,
        LayoutBox.RELATION,
        LayoutBox.VERSIONING,
      ];

      expectedTypes.forEach(type => {
        const options = getCrisLayoutBox(type);
        expect(options).toBeDefined();
      });
    });

    it('every component in the map should have a static hasOwnContainer property', () => {
      const allTypes: LayoutBox[] = [
        LayoutBox.COLLECTIONS,
        LayoutBox.IIIFVIEWER,
        LayoutBox.METADATA,
        LayoutBox.METRICS,
        LayoutBox.RELATION,
        LayoutBox.VERSIONING,
      ];

      allTypes.forEach(type => {
        const options = getCrisLayoutBox(type);
        const componentRef = options.componentRef as any;
        expect(componentRef.hasOwnContainer).toBeDefined(
          `Component for ${type} is missing static hasOwnContainer property`,
        );
        expect(typeof componentRef.hasOwnContainer).toBe('boolean',
          `Component for ${type} has non-boolean static hasOwnContainer property`,
        );
      });
    });

    it('only CrisLayoutMetricsBoxComponent should have hasOwnContainer = true', () => {
      const options = getCrisLayoutBox(LayoutBox.METRICS);
      expect((options.componentRef as any).hasOwnContainer).toBeTrue();
    });

    it('all other box components should have hasOwnContainer = false', () => {
      const nonOwnContainerTypes = [
        LayoutBox.COLLECTIONS,
        LayoutBox.IIIFVIEWER,
        LayoutBox.METADATA,
        LayoutBox.RELATION,
        LayoutBox.VERSIONING,
      ];

      nonOwnContainerTypes.forEach(type => {
        const options = getCrisLayoutBox(type);
        expect((options.componentRef as any).hasOwnContainer).toBeFalse();
      });
    });
  });
});
