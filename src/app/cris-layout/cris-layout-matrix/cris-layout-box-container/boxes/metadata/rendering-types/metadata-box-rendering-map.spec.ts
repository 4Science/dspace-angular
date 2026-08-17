import { AdvancedAttachmentComponent } from './advanced-attachment/advanced-attachment.component';
import { AttachmentComponent } from './attachment/attachment.component';
import { CcLicenseLargeComponent } from './cc-license-large/cc-license-large.component';
import { CcLicenseSmallComponent } from './cc-license-small/cc-license-small.component';
import { CrisrefComponent } from './crisref/crisref.component';
import { DateComponent } from './date/date.component';
import { FieldRenderingType } from './field-rendering-type';
import { HeadingComponent } from './heading/heading.component';
import { HtmlComponent } from './html/html.component';
import { IdentifierComponent } from './identifier/identifier.component';
import { LinkComponent } from './link/link.component';
import { LinkAuthorityComponent } from './link-authority/link-authority.component';
import { LonghtmlComponent } from './longhtml/longhtml.component';
import { LongtextComponent } from './longtext/longtext.component';
import { layoutBoxesMap } from './metadata-box-rendering-map';
import { InlineComponent } from './metadataGroup/inline/inline.component';
import { TableComponent } from './metadataGroup/table/table.component';
import { OrcidComponent } from './orcid/orcid.component';
import { TagComponent } from './tag/tag.component';
import { TextComponent } from './text/text.component';
import { ThumbnailRenderingComponent } from './thumbnail/thumbnail.component';
import { ValuepairComponent } from './valuepair/valuepair.component';

describe('metadata-box-rendering-map', () => {

  describe('static structured property on components', () => {
    const structuredComponents: Array<{ name: string; component: any; expected: boolean }> = [
      { name: 'ThumbnailRenderingComponent', component: ThumbnailRenderingComponent, expected: true },
      { name: 'AttachmentComponent', component: AttachmentComponent, expected: true },
      { name: 'AdvancedAttachmentComponent', component: AdvancedAttachmentComponent, expected: true },
      { name: 'TableComponent', component: TableComponent, expected: true },
      { name: 'InlineComponent', component: InlineComponent, expected: true },
      { name: 'TagComponent', component: TagComponent, expected: true },
    ];

    const nonStructuredComponents: Array<{ name: string; component: any; expected: boolean }> = [
      { name: 'TextComponent', component: TextComponent, expected: false },
      { name: 'HeadingComponent', component: HeadingComponent, expected: false },
      { name: 'LongtextComponent', component: LongtextComponent, expected: false },
      { name: 'DateComponent', component: DateComponent, expected: false },
      { name: 'LinkComponent', component: LinkComponent, expected: false },
      { name: 'IdentifierComponent', component: IdentifierComponent, expected: false },
      { name: 'CrisrefComponent', component: CrisrefComponent, expected: false },
      { name: 'OrcidComponent', component: OrcidComponent, expected: false },
      { name: 'ValuepairComponent', component: ValuepairComponent, expected: false },
      { name: 'LinkAuthorityComponent', component: LinkAuthorityComponent, expected: false },
      { name: 'HtmlComponent', component: HtmlComponent, expected: false },
      { name: 'LonghtmlComponent', component: LonghtmlComponent, expected: false },
      { name: 'CcLicenseLargeComponent', component: CcLicenseLargeComponent, expected: false },
      { name: 'CcLicenseSmallComponent', component: CcLicenseSmallComponent, expected: false },
    ];

    const allComponents = [...structuredComponents, ...nonStructuredComponents];

    allComponents.forEach(({ name, component, expected }) => {
      it(`${name} should have static structured = ${expected}`, () => {
        expect(component.structured).toBeDefined();
        expect(component.structured).toBe(expected);
      });
    });
  });

  describe('layoutBoxesMap consistency', () => {
    it('should derive structured from component static property for every entry', () => {
      layoutBoxesMap.forEach((options, renderingType) => {
        const componentRef = options.componentRef as any;
        expect(componentRef.structured).toBeDefined(
          `Component for ${renderingType} is missing static structured property`,
        );
        expect(typeof componentRef.structured).toBe('boolean',
          `Component for ${renderingType} has non-boolean static structured property`,
        );
      });
    });

    it('should have entries for all expected rendering types', () => {
      const expectedTypes: FieldRenderingType[] = [
        FieldRenderingType.TEXT,
        FieldRenderingType.HEADING,
        FieldRenderingType.LONGTEXT,
        FieldRenderingType.DATE,
        FieldRenderingType.LINK,
        FieldRenderingType.IDENTIFIER,
        FieldRenderingType.CRISREF,
        FieldRenderingType.THUMBNAIL,
        FieldRenderingType.ATTACHMENT,
        FieldRenderingType.TABLE,
        FieldRenderingType.INLINE,
        FieldRenderingType.ORCID,
        FieldRenderingType.TAG,
        FieldRenderingType.VALUEPAIR,
        FieldRenderingType.ADVANCEDATTACHMENT,
        FieldRenderingType.AUTHORITYLINK,
        FieldRenderingType.HTML,
        FieldRenderingType.LONGHTML,
        FieldRenderingType.CCLICENSEFULL,
        FieldRenderingType.CCLICENSE,
      ];

      expectedTypes.forEach(type => {
        expect(layoutBoxesMap.has(type)).toBeTrue();
      });
    });

    it('structured components should have structured = true', () => {
      const structuredTypes = [
        FieldRenderingType.THUMBNAIL,
        FieldRenderingType.ATTACHMENT,
        FieldRenderingType.ADVANCEDATTACHMENT,
        FieldRenderingType.TABLE,
        FieldRenderingType.INLINE,
        FieldRenderingType.TAG,
      ];

      structuredTypes.forEach(type => {
        const componentRef = layoutBoxesMap.get(type).componentRef as any;
        expect(componentRef.structured).toBeTrue();
      });
    });

    it('non-structured components should have structured = false', () => {
      const nonStructuredTypes = [
        FieldRenderingType.TEXT,
        FieldRenderingType.HEADING,
        FieldRenderingType.LONGTEXT,
        FieldRenderingType.DATE,
        FieldRenderingType.LINK,
        FieldRenderingType.IDENTIFIER,
        FieldRenderingType.CRISREF,
        FieldRenderingType.ORCID,
        FieldRenderingType.VALUEPAIR,
        FieldRenderingType.AUTHORITYLINK,
        FieldRenderingType.HTML,
        FieldRenderingType.LONGHTML,
        FieldRenderingType.CCLICENSEFULL,
        FieldRenderingType.CCLICENSE,
      ];

      nonStructuredTypes.forEach(type => {
        const componentRef = layoutBoxesMap.get(type).componentRef as any;
        expect(componentRef.structured).toBeFalse();
      });
    });
  });
});
