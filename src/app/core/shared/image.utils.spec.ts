import { getDefaultImageUrlByEntityType } from './image.utils';

describe('Image utils', () => {
  describe('getDefaultImageUrlByEntityType', () => {
    const fallbackImage = 'assets/images/file-placeholder.svg';

    it('should return fallback image when entityType is null', (done) => {
      getDefaultImageUrlByEntityType(null).subscribe((url) => {
        expect(url).toBe(fallbackImage);
        done();
      });
    });

    it('should return fallback image when entityType is undefined', (done) => {
      getDefaultImageUrlByEntityType(undefined).subscribe((url) => {
        expect(url).toBe(fallbackImage);
        done();
      });
    });

    it('should return fallback image when entityType is empty string', (done) => {
      getDefaultImageUrlByEntityType('').subscribe((url) => {
        expect(url).toBe(fallbackImage);
        done();
      });
    });

    it('should return the entity-specific placeholder when the image exists', (done) => {
      spyOn(window, 'Image').and.returnValue({
        set src(_url: string) {
          this.onload();
        },
        onload: null,
        onerror: null,
      } as any);

      getDefaultImageUrlByEntityType('Person').subscribe((url) => {
        expect(url).toBe('assets/images/person-placeholder.svg');
        done();
      });
    });

    it('should return fallback image when the entity-specific image does not exist', (done) => {
      spyOn(window, 'Image').and.returnValue({
        set src(_url: string) {
          this.onerror();
        },
        onload: null,
        onerror: null,
      } as any);

      getDefaultImageUrlByEntityType('Person').subscribe((url) => {
        expect(url).toBe(fallbackImage);
        done();
      });
    });

    it('should lowercase the entityType when building the image path', (done) => {
      spyOn(window, 'Image').and.returnValue({
        set src(_url: string) {
          this.onload();
        },
        onload: null,
        onerror: null,
      } as any);

      getDefaultImageUrlByEntityType('PUBLICATION').subscribe((url) => {
        expect(url).toBe('assets/images/publication-placeholder.svg');
        done();
      });
    });

    it('should return fallback image when Image is not defined (SSR)', (done) => {
      const originalImage = (window as any).Image;
      delete (window as any).Image;

      getDefaultImageUrlByEntityType('Person').subscribe((url) => {
        expect(url).toBe(fallbackImage);
        (window as any).Image = originalImage;
        done();
      });
    });
  });
});

