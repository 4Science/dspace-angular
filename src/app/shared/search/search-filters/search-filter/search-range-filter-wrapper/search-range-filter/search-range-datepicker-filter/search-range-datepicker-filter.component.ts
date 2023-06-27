import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { SearchRangeFilterComponent } from '../search-range-filter.component';
import { BehaviorSubject, Subject } from 'rxjs';
import {
  NgbCalendar,
  NgbDate,
  NgbDateParserFormatter,
  NgbDateStruct,
  NgbInputDatepicker,
} from '@ng-bootstrap/ng-bootstrap';
import { hasValue, isNotEmpty } from '../../../../../../empty.util';
import { SearchService } from '../../../../../../../core/shared/search/search.service';
import {
  FILTER_CONFIG,
  IN_PLACE_SEARCH,
  REFRESH_FILTER,
  SearchFilterService
} from '../../../../../../../core/shared/search/search-filter.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RemoteDataBuildService } from '../../../../../../../core/cache/builders/remote-data-build.service';
import { SEARCH_CONFIG_SERVICE } from '../../../../../../../my-dspace-page/my-dspace-page.component';
import { SearchConfigurationService } from '../../../../../../../core/shared/search/search-configuration.service';
import { SearchFilterConfig } from '../../../../../models/search-filter-config.model';
import { renderFacetForEnvironment } from '../../../search-filter-type-decorator';
import { FilterType } from '../../../../../models/filter-type.model';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import isEqual from 'lodash/isEqual';
import { dateToNgbDateStruct } from '../../../../../../date.util';


@Component({
  selector: 'ds-search-range-datepicker-filter',
  templateUrl: './search-range-datepicker-filter.component.html',
  styleUrls: ['./search-range-datepicker-filter.component.scss']
})
@renderFacetForEnvironment(FilterType.range, 'layout.search.filters.datepicker')
export class SearchRangeDatepickerFilterComponent extends SearchRangeFilterComponent implements OnInit, OnDestroy {

  /**
   * range of two dates, first element is starting date and last element is ending date
   */
  range: [NgbDateStruct | null, NgbDateStruct | null] = [null, null];

  /**
   * The hovered date
   * @type {(NgbDateStruct | null)}
   */
  hoveredDate: NgbDateStruct | null = null;

  /**
   * The date to begin the range
   * @type {(NgbDateStruct | null)}
   */
  set fromDate(fromDate: NgbDateStruct | null) {
    this.range[0] = fromDate;
    this.scheduleSearch$.next(Object.assign([], this.range));
  }

  get fromDate(): NgbDateStruct | null {
    return this.range[0];
  }

  /**
   * The date to end the range
   * @type {(NgbDateStruct | null)}
   */
  set toDate(toDate: NgbDateStruct | null) {
    this.range[1] = toDate;
    this.scheduleSearch$.next(Object.assign([], this.range));
  }

  get toDate(): NgbDateStruct | null {
    return this.range[1];
  }

  /**
   * ngbDatepicker ref to close after dates selection
   * @type {NgbInputDatepicker}
   */
  @ViewChild('datepicker') ngbDatepicker: NgbInputDatepicker;

  /**
   * {@link Subject} used to schedule search when editing date directly on input
   * @private
   */
  private readonly scheduleSearch$ = new Subject<[NgbDateStruct, NgbDateStruct]>();

  constructor(
    protected readonly calendar: NgbCalendar,
    public readonly formatter: NgbDateParserFormatter,
    protected readonly searchService: SearchService,
    protected readonly filterService: SearchFilterService,
    protected readonly router: Router,
    protected readonly rdbs: RemoteDataBuildService,
    protected readonly route: ActivatedRoute,
    @Inject(SEARCH_CONFIG_SERVICE) public searchConfigService: SearchConfigurationService,
    @Inject(IN_PLACE_SEARCH) public inPlaceSearch: boolean,
    @Inject(FILTER_CONFIG) public filterConfig: SearchFilterConfig,
    @Inject(PLATFORM_ID) protected platformId: any,
    @Inject(REFRESH_FILTER) public refreshFilters: BehaviorSubject<boolean>
  ) {
    super(searchService, filterService, router, rdbs, route, searchConfigService, inPlaceSearch, filterConfig, platformId, refreshFilters);
  }

  public override ngOnInit() {
    super.ngOnInit();
    this.sub.add(
      this.scheduleSearch$
        .asObservable()
        .pipe(
          filter(() => !this.ngbDatepicker?.isOpen()),
          debounceTime(500),
          distinctUntilChanged(isEqual)
        )
        .subscribe(([fromDate, toDate]) => this.search(fromDate, toDate))
    );
  }

  public override ngOnDestroy() {
    super.ngOnDestroy();
    this.scheduleSearch$.complete();
  }

  protected override initMin() {
    this.min = null;
  }

  protected override initMax() {
    this.max = null;
  }

  /**
   * Check if the string representing the date is in the 'yyyy' format
   * @param date the string representing the date
   * @returns true if the date is a year
   */
  private isStringDateYear(date: string): boolean {
    return /^\d{4}$/.test(date);
  }

  private parseFromDate(date: string) {
    return this.isStringDateYear(date) ? `${date}-01-01` : date;
  }

  private parseToDate(date: string) {
    return this.isStringDateYear(date) ? `${date}-12-31` : date;
  }

  protected override initRange(minmax: [string | null, string | null]) {
    const fromDate = this.parseFromDate(minmax[0]);
    const toDate = this.parseToDate(minmax[1]);

    if (isNotEmpty(fromDate) && fromDate !== 'null') {
      this.range[0] = this.stringToNgbDateStruct(fromDate);
    }
    if (isNotEmpty(toDate) && toDate !== 'null') {
      this.range[1] = this.stringToNgbDateStruct(toDate);
    }
  }

  private stringToNgbDateStruct(stringDate: string): NgbDateStruct {
    const date = new Date(stringDate);
    const ngbDateStruct = dateToNgbDateStruct(date);
    console.log('stringToNgbDateStruct', date, ngbDateStruct);
    return ngbDateStruct;
  }

  /**
   * Returns if the date is valid and after fromDate when toDate is not selected yet
   * @param date the hovered date
   * @returns a validity flag
   */
  isHovered(date: NgbDate): boolean {
    return (
      this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate)
    );
  }

  /**
   * Returns if the date is valid and inside the range (fromDate - toDate)
   * @param date the selected date
   * @returns a validity flag
   */
  isInside(date: NgbDate): boolean {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  /**
   * Returns if the date is inside the range ([fromDate - toDate])
   * @param date the selected date
   * @returns a validity flag
   */
  isRange(date: NgbDate): boolean {
    return (
      date.equals(this.fromDate) ||
      (this.toDate && date.equals(this.toDate)) ||
      this.isInside(date) ||
      this.isHovered(date)
    );
  }

  /**
   * Returns if the selected value is a valid calendar date
   * @param currentValue the selected value | invalid input
   * @param input date farmated in string
   * @returns the valid date or null otherwise
   */
  validateInput(currentValue: NgbDateStruct | null, input: string): NgbDateStruct | null { // TODO NgbDateStruct?
    const parsed = this.formatter.parse(input);
    if (
      parsed == null &&
      (
        currentValue === this.fromDate && this.toDate != null ||
        currentValue === this.toDate && this.fromDate != null
      )
    ) {
      return null;
    }
    const ngbDate = NgbDate.from(parsed);
    return this.calendar.isValid(ngbDate) ? ngbDate : currentValue;
  }

  /**
   * Filter the date based on dates selections
   * @param date the selected date
   */
  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date && date.after(this.fromDate)) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }

    if (hasValue(this.fromDate) && hasValue(this.toDate)) {
      this.ngbDatepicker?.close();
      this.search(this.fromDate, this.toDate);
    }
  }

  protected override search(fromDate: NgbDateStruct, toDate: NgbDateStruct) {
    super.search(this.formatter.format(fromDate), this.formatter.format(toDate));
  }

}
