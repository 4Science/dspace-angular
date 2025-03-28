import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { BitstreamImagesService } from './bitstream-images.service';
import { Item } from '../shared/item.model';
import { Bitstream } from '../shared/bitstream.model';
import { createSuccessfulRemoteDataObject } from '../../shared/remote-data.utils';
import { createPaginatedList } from '../../shared/testing/utils.test';
import { BitstreamDataService } from '../data/bitstream-data.service';

describe('BitstreamImagesService', () => {
  let service: BitstreamImagesService;
  let bitstreamDataService: jasmine.SpyObj<BitstreamDataService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('BitstreamDataService', ['showableByItem']);
    TestBed.configureTestingModule({
      providers: [
        BitstreamImagesService,
        { provide: BitstreamDataService, useValue: spy }
      ]
    });
    service = TestBed.inject(BitstreamImagesService);
    bitstreamDataService = TestBed.inject(BitstreamDataService) as jasmine.SpyObj<BitstreamDataService>;
  });

  it('Should return a map of item UUIDs to image hrefs for original bundle', (done) => {
    const items = [{ uuid: 'item1' } as Item];
    const bitstream = { _links: { content: { href: 'image1.jpg' } }, format: of(createSuccessfulRemoteDataObject({ mimetype: 'image/jpeg' })) } as Bitstream;
    bitstreamDataService.showableByItem.and.returnValue(of(createSuccessfulRemoteDataObject(createPaginatedList([bitstream]))));

    service.getItemToImageMap(items).subscribe(result => {
      expect(result.get('item1')).toBe('image1.jpg');
      done();
    });
  });

  it('Should return a map of item UUIDs to image hrefs for non-original bundle', (done) => {
    const items = [{ uuid: 'item1' } as Item];
    const bitstream = { _links: { content: { href: 'image1.jpg' } }, format: of(createSuccessfulRemoteDataObject({ mimetype: 'image/jpeg' })) } as Bitstream;
    bitstreamDataService.showableByItem.and.returnValue(of(createSuccessfulRemoteDataObject(createPaginatedList([bitstream]))));

    service.getPrimaryBitstreamInNonOriginalBundleItemToImageMap(items, 'THUMBNAIL').subscribe(result => {
      expect(result.get('item1')).toBe('image1.jpg');
      done();
    });
  });

  it('Should handle empty items array correctly', (done) => {
    const items: Item[] = [];
    service.getItemToImageMap(items).subscribe(result => {
      expect(result.size).toBe(0);
      done();
    });
  });

  it('Should handle null bundle correctly', (done) => {
    const items = [{ uuid: 'item1' } as Item];
    const bitstream = { _links: { content: { href: 'image1.jpg' } }, format: of(createSuccessfulRemoteDataObject({ mimetype: 'image/jpeg' })) } as Bitstream;
    bitstreamDataService.showableByItem.and.returnValue(of(createSuccessfulRemoteDataObject(createPaginatedList([bitstream]))));

    service.getItemToImageMap(items, null).subscribe(result => {
      expect(result.get('item1')).toBe('image1.jpg');
      done();
    });
  });
});
