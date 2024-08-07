import {
  ChangeDetectionStrategy,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { MetadatumRepresentation } from '../../../../core/shared/metadata-representation/metadatum/metadatum-representation.model';
import { mockData } from '../../../testing/browse-definition-data-service.stub';
import { PlainTextMetadataListElementComponent } from './plain-text-metadata-list-element.component';

// Render the mock representation with the default mock author browse definition so it is also rendered as a link
// without affecting other tests
const mockMetadataRepresentation = Object.assign(new MetadatumRepresentation('type', mockData[1]), {
  key: 'dc.contributor.author',
  value: 'Test Author',
});

describe('PlainTextMetadataListElementComponent', () => {
  let comp: PlainTextMetadataListElementComponent;
  let fixture: ComponentFixture<PlainTextMetadataListElementComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [PlainTextMetadataListElementComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).overrideComponent(PlainTextMetadataListElementComponent, {
      set: { changeDetection: ChangeDetectionStrategy.Default },
    }).compileComponents();
  }));

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(PlainTextMetadataListElementComponent);
    comp = fixture.componentInstance;
    comp.mdRepresentation = mockMetadataRepresentation;
    fixture.detectChanges();
  }));

  it('should contain the value as plain text', () => {
    expect(fixture.debugElement.nativeElement.textContent).toContain(mockMetadataRepresentation.value);
  });

  it('should contain the browse link as plain text', () => {
    expect(fixture.debugElement.query(By.css('a.ds-browse-link')).nativeElement.innerHTML).toContain(mockMetadataRepresentation.value);
  });

});
