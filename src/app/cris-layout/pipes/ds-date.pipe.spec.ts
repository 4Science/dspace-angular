import { DsDatePipe } from './ds-date.pipe';
import { waitForAsync } from '@angular/core/testing';

describe('DsDatePipe', () => {

  const cdrInstance = Object.assign({
    detectChanges: () => { /***/ },
    markForCheck: () => { /***/ },
  });

  const localeServiceInstance = Object.assign({
    getCurrentLanguageCode: () => 'en',
  });

  const date = '2020-08-24';
  const parsedDate = 'August 24, 2020';

  let pipe: DsDatePipe;

  beforeEach(() => {
    pipe = new DsDatePipe(cdrInstance, localeServiceInstance);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('Should transform the given date and time', waitForAsync(() => {
    pipe.transform(`${date}T11:22:33Z`).subscribe(value => {
      expect(value).toEqual(parsedDate);
    });
  }));

  it('Should transform the given date (YYYY-MM-DD)', waitForAsync(() => {
    pipe.transform(date).subscribe(value => {
      expect(value).toEqual(parsedDate);
    });
  }));

  it('Should transform the given date (YYYY-MM)', waitForAsync(() => {
    pipe.transform('2020-08').subscribe(value => {
      expect(value).toEqual('August 2020');
    });
  }));

  it('Should transform the given date (YYYY)', waitForAsync(() => {
    pipe.transform('2020').subscribe(value => {
      expect(value).toEqual('2020');
    });
  }));

  it('Should not transform invalid dates', waitForAsync(() => {
    pipe.transform('ABCDE').subscribe(value => {
      expect(value).toEqual('ABCDE');
    });
  }));
});
