import { TestBed } from '@angular/core/testing';

import { CollectionDataService } from '../../../core/data/collection-data.service';
import { ItemDataService } from '../../../core/data/item-data.service';
import { Collection } from '../../../core/shared/collection.model';
import { Item } from '../../../core/shared/item.model';
import { TemplateItem } from '../../../core/shared/template-item.model';
import { ITEM_TEMPLATE } from '../../../core/shared/template-item.resource-type';
import { Vocabulary } from '../../../core/submission/vocabularies/models/vocabulary.model';
import { VocabularyService } from '../../../core/submission/vocabularies/vocabulary.service';
import { createSuccessfulRemoteDataObject$ } from '../../../shared/remote-data.utils';
import { ItemDataServiceStub } from '../../../shared/testing/item-data.service.stub';
import { VocabularyServiceStub } from '../../../shared/testing/vocabulary-service.stub';
import { followLink } from '../../../shared/utils/follow-link-config.model';
import { DsoEditMetadataFieldService } from './dso-edit-metadata-field.service';

describe('DsoEditMetadataFieldService', () => {
  let service: DsoEditMetadataFieldService;

  let itemService: ItemDataServiceStub;
  let collectionService: CollectionDataService;
  let vocabularyService: VocabularyServiceStub;

  const mdField = 'dc.subject';

  const collection: Collection = Object.assign(new Collection(), {
    uuid: 'collection-uuid',
  });

  const vocabulary: Vocabulary = Object.assign(new Vocabulary(), {
    id: 'srsc',
    name: 'srsc',
  });

  const item: Item = Object.assign(new Item(), {
    type: 'item',
    _links: {
      self: { href: 'https://rest.api/core/items/item-uuid' },
      owningCollection: { href: 'https://rest.api/core/items/item-uuid/owningCollection' },
    },
    owningCollection: createSuccessfulRemoteDataObject$(collection),
  });

  const templateItem: TemplateItem = Object.assign(new TemplateItem(), {
    type: ITEM_TEMPLATE.value,
    _links: {
      self: { href: 'https://rest.api/core/itemtemplates/template-uuid' },
      templateItemOf: { href: 'https://rest.api/core/itemtemplates/template-uuid/templateItemOf' },
    },
  });

  beforeEach(() => {
    itemService = new ItemDataServiceStub();
    collectionService = jasmine.createSpyObj('collectionService', {
      findByHref: createSuccessfulRemoteDataObject$(collection),
    });
    vocabularyService = new VocabularyServiceStub();

    spyOn(itemService, 'findByHref').and.returnValue(createSuccessfulRemoteDataObject$(item));
    spyOn(vocabularyService, 'getVocabularyByMetadataAndCollection').and.returnValue(createSuccessfulRemoteDataObject$(vocabulary));

    TestBed.configureTestingModule({
      providers: [
        { provide: ItemDataService, useValue: itemService },
        { provide: CollectionDataService, useValue: collectionService },
        { provide: VocabularyService, useValue: vocabularyService },
      ],
    });
    service = TestBed.inject(DsoEditMetadataFieldService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('findDsoFieldVocabulary', () => {
    describe('when the metadata field is empty', () => {
      it('should emit undefined without resolving any Collection', () => {
        let result;
        service.findDsoFieldVocabulary(item, '').subscribe((vocab) => result = vocab);

        expect(result).toBeUndefined();
        expect(itemService.findByHref).not.toHaveBeenCalled();
        expect(collectionService.findByHref).not.toHaveBeenCalled();
        expect(vocabularyService.getVocabularyByMetadataAndCollection).not.toHaveBeenCalled();
      });
    });

    describe('when the DSpaceObject is a regular Item', () => {
      let result: Vocabulary;

      beforeEach(() => {
        service.findDsoFieldVocabulary(item, mdField).subscribe((vocab: Vocabulary) => result = vocab);
      });

      it('should resolve the Collection through its owningCollection', () => {
        expect(itemService.findByHref).toHaveBeenCalledWith(item._links.self.href, true, true, followLink('owningCollection'));
        expect(collectionService.findByHref).not.toHaveBeenCalled();
      });

      it('should retrieve the vocabulary for the owning Collection', () => {
        expect(vocabularyService.getVocabularyByMetadataAndCollection).toHaveBeenCalledWith(mdField, collection.uuid);
        expect(result).toBe(vocabulary);
      });
    });

    describe('when the DSpaceObject is a template Item', () => {
      let result: Vocabulary;

      beforeEach(() => {
        service.findDsoFieldVocabulary(templateItem, mdField).subscribe((vocab: Vocabulary) => result = vocab);
      });

      it('should resolve the Collection through its templateItemOf link', () => {
        expect(collectionService.findByHref).toHaveBeenCalledWith(templateItem._links.templateItemOf.href, true, true);
        expect(itemService.findByHref).not.toHaveBeenCalled();
      });

      it('should retrieve the vocabulary for the related Collection', () => {
        expect(vocabularyService.getVocabularyByMetadataAndCollection).toHaveBeenCalledWith(mdField, collection.uuid);
        expect(result).toBe(vocabulary);
      });
    });

    describe('when the DSpaceObject is a template Item without a templateItemOf link', () => {
      let emitted: boolean;
      let completed: boolean;

      beforeEach(() => {
        const templateItemWithoutLink: TemplateItem = Object.assign(new TemplateItem(), {
          type: ITEM_TEMPLATE.value,
          _links: {
            self: { href: 'https://rest.api/core/itemtemplates/template-uuid' },
          },
        });

        emitted = false;
        completed = false;
        service.findDsoFieldVocabulary(templateItemWithoutLink, mdField).subscribe({
          next: () => emitted = true,
          complete: () => completed = true,
        });
      });

      it('should complete without emitting and without sending any request', () => {
        expect(emitted).toBe(false);
        expect(completed).toBe(true);
        expect(collectionService.findByHref).not.toHaveBeenCalled();
        expect(itemService.findByHref).not.toHaveBeenCalled();
        expect(vocabularyService.getVocabularyByMetadataAndCollection).not.toHaveBeenCalled();
      });
    });
  });
});
