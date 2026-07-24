import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
  waitForAsync,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  TranslateLoader,
  TranslateModule,
} from '@ngx-translate/core';

import { ConfigurationDataService } from '../../../../../../../core/data/configuration-data.service';
import { LayoutField } from '../../../../../../../core/layout/models/box.model';
import { Item } from '../../../../../../../core/shared/item.model';
import { MetadataValue } from '../../../../../../../core/shared/metadata.models';
import { TranslateLoaderMock } from '../../../../../../../shared/mocks/translate-loader.mock';
import { OrcidBadgeAndTooltipComponent } from '../../../../../../../shared/orcid-badge-and-tooltip/orcid-badge-and-tooltip.component';
import { createSuccessfulRemoteDataObject$ } from '../../../../../../../shared/remote-data.utils';
import { DsDatePipe } from '../../../../../../pipes/ds-date.pipe';
import { FieldRenderingType } from '../field-rendering-type';
import { OrcidComponent } from './orcid.component';

describe('OrcidComponent', () => {
  let component: OrcidComponent;
  let fixture: ComponentFixture<OrcidComponent>;

  const configurationDataService = jasmine.createSpyObj('configurationDataService', {
    findByPropertyName: createSuccessfulRemoteDataObject$({ values: ['https://sandbox.orcid.org'] }),
  });

  const metadataValue = Object.assign(new MetadataValue(), {
    'value': '0000-0001-8918-3592',
    'language': 'en_US',
    'authority': null,
    'confidence': -1,
    'place': 0,
  });

  const authenticatedTimestamp = Object.assign(new MetadataValue(), {
    'value': '2026-01-26T15:20:27.524758999',
    'language': null,
    'authority': null,
    'confidence': -1,
    'place': 0,
  });

  const mockField: LayoutField = {
    'metadata': 'person.identifier.orcid',
    'label': 'ORCID',
    'rendering': FieldRenderingType.ORCID,
    'fieldType': 'METADATA',
    'style': null,
    'styleLabel': 'test-style-label',
    'styleValue': 'test-style-value',
    'labelAsHeading': false,
    'valuesInline': true,
  };

  /**
   * Build a Person item optionally containing the `dspace.orcid.authenticated` metadata.
   */
  function buildItem(authenticated: boolean): Item {
    const metadata: { [key: string]: MetadataValue[] } = {
      'person.identifier.orcid': [metadataValue],
    };
    if (authenticated) {
      metadata['dspace.orcid.authenticated'] = [authenticatedTimestamp];
    }
    return Object.assign(new Item(), {
      type: 'item',
      metadata,
      uuid: 'test-item-uuid',
    });
  }

  /**
   * Configure the TestBed and create the component with the given item.
   */
  function setup(item: Item): void {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: TranslateLoaderMock,
        },
      }), BrowserAnimationsModule, OrcidComponent, DsDatePipe],
      providers: [
        { provide: 'fieldProvider', useValue: mockField },
        { provide: 'itemProvider', useValue: item },
        { provide: 'metadataValueProvider', useValue: metadataValue },
        { provide: 'renderingSubTypeProvider', useValue: '' },
        { provide: 'tabNameProvider', useValue: '' },
        { provide: ConfigurationDataService, useValue: configurationDataService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrcidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  describe('when the ORCID is authenticated', () => {
    beforeEach(waitForAsync(() => {
      setup(buildItem(true));
    }));

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('check metadata rendering', fakeAsync(() => {
      tick();
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const spanValueFound = fixture.debugElement.queryAll(By.css('span.txt-value'));
        expect(spanValueFound.length).toBe(1);
        expect(spanValueFound[0].nativeElement.textContent).toContain('0000-0001-8918-3592');

        const orcidLinkFound = fixture.debugElement.queryAll(By.css('a'));
        expect(orcidLinkFound.length).toBe(2);
        expect(orcidLinkFound[0].nativeElement.href).toBe('https://sandbox.orcid.org/0000-0001-8918-3592');

        const orcidIconFound = fixture.debugElement.queryAll(By.css('.orcid-icon'));
        expect(orcidIconFound.length).toBe(1);
        expect(orcidIconFound[0].nativeElement.src).toContain('assets/images/orcid.logo.icon.svg');
      });
    }));

    it('check value style', (done) => {
      const spanValueFound = fixture.debugElement.queryAll(By.css('.test-style-value'));
      expect(spanValueFound.length).toBe(1);
      done();
    });

    it('should render the ds-orcid-badge-and-tooltip component with the correct inputs', () => {
      const badge = fixture.debugElement.query(By.directive(OrcidBadgeAndTooltipComponent));
      expect(badge).toBeTruthy();
      const badgeInstance = badge.componentInstance as OrcidBadgeAndTooltipComponent;
      expect(badgeInstance.orcid).toBe(metadataValue);
      expect(badgeInstance.authenticatedTimestamp).toBe(authenticatedTimestamp);
    });

    it('should expose the authenticated timestamp through orcidAuthenticatedTimestamp', () => {
      expect(component.orcidAuthenticatedTimestamp).toBe(authenticatedTimestamp);
      expect(component.hasOrcidBadge()).toBeTrue();
    });

    it('should render the badge icon in full color (not greyed out)', () => {
      const orcidIcon = fixture.debugElement.query(By.css('.orcid-icon'));
      expect(orcidIcon).toBeTruthy();
      expect(orcidIcon.nativeElement.classList).not.toContain('not-authenticated');
    });
  });

  describe('when the ORCID is not authenticated', () => {
    beforeEach(waitForAsync(() => {
      setup(buildItem(false));
    }));

    it('should still render the badge, without an authenticated timestamp', () => {
      const badge = fixture.debugElement.query(By.directive(OrcidBadgeAndTooltipComponent));
      expect(badge).toBeTruthy();
      const badgeInstance = badge.componentInstance as OrcidBadgeAndTooltipComponent;
      expect(badgeInstance.orcid).toBe(metadataValue);
      expect(badgeInstance.authenticatedTimestamp).toBeUndefined();
    });

    it('should not expose an authenticated timestamp', () => {
      expect(component.orcidAuthenticatedTimestamp).toBeUndefined();
      expect(component.hasOrcidBadge()).toBeFalse();
    });

    it('should render the badge icon greyed out (not-authenticated) but still visible', () => {
      const orcidIcon = fixture.debugElement.query(By.css('.orcid-icon'));
      expect(orcidIcon).toBeTruthy();
      expect(orcidIcon.nativeElement.classList).toContain('not-authenticated');
    });
  });
});
