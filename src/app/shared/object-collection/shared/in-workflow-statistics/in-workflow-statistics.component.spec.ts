import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { AuthorizationDataService } from '../../../../core/data/feature-authorization/authorization-data.service';
import { ItemDataService } from '../../../../core/data/item-data.service';
import { Item } from '../../../../core/shared/item.model';
import { InWorkflowStatisticsComponent } from './in-workflow-statistics.component';

describe('InWorkflowStatisticsComponent', () => {
  let component: InWorkflowStatisticsComponent;
  let fixture: ComponentFixture<InWorkflowStatisticsComponent>;
  let authorizationService: jasmine.SpyObj<AuthorizationDataService>;
  let itemDataService: jasmine.SpyObj<ItemDataService>;

  beforeEach(async () => {
    const authorizationServiceSpy = jasmine.createSpyObj('AuthorizationDataService', ['isAuthorized']);
    const itemDataServiceSpy = jasmine.createSpyObj('ItemDataService', ['findById']);

    await TestBed.configureTestingModule({
      imports: [InWorkflowStatisticsComponent, TranslateModule.forRoot()],
      providers: [
        { provide: AuthorizationDataService, useValue: authorizationServiceSpy },
        { provide: ItemDataService, useValue: itemDataServiceSpy },
      ],
    }).compileComponents();

    authorizationService = TestBed.inject(AuthorizationDataService) as jasmine.SpyObj<AuthorizationDataService>;
    itemDataService = TestBed.inject(ItemDataService) as jasmine.SpyObj<ItemDataService>;
    fixture = TestBed.createComponent(InWorkflowStatisticsComponent);
    component = fixture.componentInstance;
  });

  describe('initWorkflowDates', () => {
    it('should not initialize workflow dates if item is archived', () => {
      const mockItem = createMockItem({
        isArchived: true,
        hasMetadata: true,
      });

      component.item = mockItem;
      component.initWorkflowDates();

      expect(component.canViewInWorkflowSinceDate$.getValue()).toBe(false);
      expect(component.inWorkflowSince$.getValue()).toBeNull();
    });

    it('should not initialize workflow dates if item does not have dspace.workflow.startDateTime metadata', () => {
      const mockItem = createMockItem({
        isArchived: false,
        hasMetadata: false,
      });

      component.item = mockItem;
      component.initWorkflowDates();

      expect(component.canViewInWorkflowSinceDate$.getValue()).toBe(false);
      expect(component.inWorkflowSince$.getValue()).toBeNull();
    });

    it('should initialize workflow dates if item has workflow start date and is not archived', () => {
      const mockItem = createMockItem({
        isArchived: false,
        hasMetadata: true,
        metadataValue: '2026-05-10T10:30:00Z',
      });

      component.item = mockItem;
      component.initWorkflowDates();

      expect(component.canViewInWorkflowSinceDate$.getValue()).toBe(true);
      expect(component.inWorkflowSince$.getValue()).toBeTruthy();
      expect(component.inWorkflowSince$.getValue()).toMatch(/\d+ d \d+ h/);
    });

    it('should not process if item is null', () => {
      component.item = null;
      component.initWorkflowDates();

      expect(component.canViewInWorkflowSinceDate$.getValue()).toBe(false);
      expect(component.inWorkflowSince$.getValue()).toBeNull();
    });

    it('should not process if item is undefined', () => {
      component.item = undefined;
      component.initWorkflowDates();

      expect(component.canViewInWorkflowSinceDate$.getValue()).toBe(false);
      expect(component.inWorkflowSince$.getValue()).toBeNull();
    });

    it('should format workflow start date correctly using getDateForItem', () => {
      const mockItem = createMockItem({
        isArchived: false,
        hasMetadata: true,
        metadataValue: '2026-05-13T00:00:00Z', // Yesterday (assuming today is 2026-05-14)
      });

      component.item = mockItem;
      component.initWorkflowDates();

      const formattedDate = component.inWorkflowSince$.getValue();
      expect(formattedDate).toContain('d');
      expect(formattedDate).toContain('h');
    });
  });

  describe('getDateForItem', () => {
    it('should calculate days and hours correctly', () => {
      const pastDate = '2026-05-10T10:30:00Z'; // 4 days ago
      const result = component.getDateForItem(pastDate);

      expect(result).toMatch(/\d+ d \d+ h/);
      expect(result).toContain('d');
      expect(result).toContain('h');
    });

    it('should return 0 days and 0 hours for current timestamp', () => {
      const now = new Date().toISOString();
      const result = component.getDateForItem(now);

      expect(result).toMatch(/^0 d 0 h$/);
    });

    it('should return positive values only', () => {
      const futureDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(); // 10 days in future
      const result = component.getDateForItem(futureDate);

      const match = result.match(/(\d+) d (\d+) h/);
      expect(match).toBeTruthy();
      const days = parseInt(match[1], 10);
      const hours = parseInt(match[2], 10);
      expect(days).toBeGreaterThanOrEqual(0);
      expect(hours).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getDateForArchivedItem', () => {
    it('should calculate days and hours between two dates', () => {
      const startDate = '2026-05-10T10:30:00Z';
      const accessionedDate = '2026-05-14T14:30:00Z'; // 4 days, 4 hours later
      const result = component.getDateForArchivedItem(startDate, accessionedDate);

      expect(result).toMatch(/\d+ d \d+ h/);
    });

    it('should return 0 days and 0 hours for same timestamp', () => {
      const date = '2026-05-14T10:30:00Z';
      const result = component.getDateForArchivedItem(date, date);

      expect(result).toMatch(/^0 d 0 h$/);
    });

    it('should return positive values only', () => {
      const startDate = '2026-05-12T08:00:00Z';
      const accessionedDate = '2026-05-10T10:30:00Z'; // before start date
      const result = component.getDateForArchivedItem(startDate, accessionedDate);

      // Since accessionedDate is before startDate, the difference should be negative,
      // but the Math.max(0, ...) should ensure 0 as minimum
      expect(result).toMatch(/^0 d 0 h$/);
    });
  });

  // Helper function to create mock Item
  function createMockItem(options: {
    isArchived: boolean;
    hasMetadata: boolean;
    metadataValue?: string;
  }): Item {
    const mockItem = {
      isArchived: options.isArchived,
      hasMetadata: (metadata: string) => options.hasMetadata,
      firstMetadataValue: (metadata: string) => options.metadataValue || '2026-05-10T10:30:00Z',
      id: 'test-item-id',
      self: 'http://test.com/item/test-item-id',
    } as unknown as Item;

    return mockItem;
  }
});
