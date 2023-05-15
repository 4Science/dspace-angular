import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { SearchRangeFilterComponent } from '../search-range-filter.component';
import { BehaviorSubject, Subject } from 'rxjs';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { hasValue } from '../../../../../../empty.util';
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
import * as moment from 'moment/moment';
import { unitOfTime } from 'moment/moment';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import { isEqual } from 'lodash';


@Component({
  selector: 'ds-search-range-datepicker-filter',
  templateUrl: './search-range-datepicker-filter.component.html',
  styleUrls: ['./search-range-datepicker-filter.component.scss']
})
@renderFacetForEnvironment(FilterType.range, 'layout.search.filters.datepicker')
export class SearchRangeDatepickerFilterComponent extends SearchRangeFilterComponent implements OnInit, OnDestroy {

  /**
   * Defines the last popolated field of the {@link dateFormats}.
   */
  readonly lastElementFormats: unitOfTime.StartOf[] = ['year', 'month'];

  /**
   * range of two dates, first element is starting date and last element is ending date
   */
  range: [NgbDate | null, NgbDate | null] = [null, null];

  /**
   * The hovered date
   * @type {(NgbDate | null)}
   */
  hoveredDate: NgbDate | null = null;

  /**
   * The date to begin the range
   * @type {(NgbDate | null)}
   */
  set fromDate(fromDate: NgbDate | null) {
    this.range[0] = fromDate;
    this.scheduleSearch$.next(Object.assign([], this.range));
  }

  get fromDate(): NgbDate | null {
    return this.range[0];
  }

  /**
   * The date to end the range
   * @type {(NgbDate | null)}
   */
  set toDate(toDate: NgbDate | null) {
    this.range[1] = toDate;
    this.scheduleSearch$.next(Object.assign([], this.range));
  }

  get toDate(): NgbDate | null {
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
  private readonly scheduleSearch$ = new Subject<[NgbDate, NgbDate]>();

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

  public ngOnInit() {
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

  public ngOnDestroy() {
    super.ngOnDestroy();
    this.scheduleSearch$.complete();
  }

  protected initMin() {
    this.min = null;
  }

  protected initMax() {
    this.max = null;
  }

  protected initRange(minmax: [string, string]) {
    this.range[0] = this.mapFromDate(minmax[0]);
    this.range[1] = this.mapToDate(minmax[1]);
  }

  /**
   * maps the {@param date} as starting date
   * @param date string that represents a date, its format can be one of these {@link dateFormats}
   * @private
   */
  private mapToDate(date: string): NgbDate | null {
    return this.formatMoment(this.toMoment(date, (m, unit) => m.endOf(unit)));
  }

  /**
   * maps the {@param date} as ending date
   * @param date string that represents a date, its format can be one of these {@link dateFormats}
   * @private
   */
  private mapFromDate(date: string): NgbDate | null {
    return this.formatMoment(this.toMoment(date, (m, unit) => m.startOf(unit)));
  }

  /**
   * formats the {@param m} {@link moment.Moment} to {@link NgbDate} used by the range input
   * @param m
   * @private
   */
  private formatMoment(m: moment.Moment): NgbDate | null {
    return NgbDate.from(
      this.formatter.parse(
        m.format('yyyy-MM-DD')
      )
    );
  }

  /**
   * Maps a target {@param date} to a {@link moment.Moment} by using the mapping {@param func} if the date is not
   * fully populated (doesn't respect the format `YYYY-MM-DD`)
   * @param date string representing a date
   * @param func mapping function to adequate a non-complete date
   * @private
   */
  private toMoment(date: string, func: (m: moment.Moment, unitOfTime: unitOfTime.StartOf) => moment.Moment): moment.Moment {
    let momentDate: moment.Moment | null = null;
    const index = this.lastElementFormats
      .findIndex((lastElem, i) => {
        momentDate = moment(date, this.dateFormats[i], true);
        return momentDate.isValid();
      });
    if (index !== -1) {
      momentDate = func(momentDate, this.lastElementFormats[index]);
    } else {
      momentDate = moment(date, this.dateFormats);
    }
    return momentDate;
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
  validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
    const parsed = this.formatter.parse(input);
    return parsed && this.calendar.isValid(NgbDate.from(parsed)) ? NgbDate.from(parsed) : currentValue;
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

  protected search(fromDate: NgbDate, toDate: NgbDate) {
    super.search(this.formatter.format(fromDate), this.formatter.format(toDate));
  }

}
