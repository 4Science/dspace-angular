import {
  Component,
  Injector,
  Input,
  OnInit,
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { GenericConstructor } from '../../../../../core/shared/generic-constructor';
import {
  FILTER_CONFIG,
  IN_PLACE_SEARCH,
  REFRESH_FILTER,
  SCOPE,
} from '../../../../../core/shared/search/search-filter.service';
import { AbstractComponentLoaderComponent } from '../../../../abstract-component-loader/abstract-component-loader.component';
import { DynamicComponentLoaderDirective } from '../../../../abstract-component-loader/dynamic-component-loader.directive';
import { ThemeService } from '../../../../theme-support/theme.service';
import { SearchFilterConfig } from '../../../models/search-filter-config.model';
import { renderFilterType } from '../search-filter-type-decorator';

@Component({
  selector: 'ds-search-facet-filter-wrapper',
  templateUrl: '../../../../abstract-component-loader/abstract-component-loader.component.html',
  standalone: true,
  imports: [
    DynamicComponentLoaderDirective,
  ],
})

/**
 * Wrapper component that renders a specific facet filter based on the filter config's type
 */
export class SearchFacetFilterWrapperComponent extends AbstractComponentLoaderComponent<Component> implements OnInit {

  /**
   * Configuration for the filter of this wrapper component
   */
  @Input() filterConfig: SearchFilterConfig;

  /**
   * True when the search component should show results on the current page
   */
  @Input() inPlaceSearch: boolean;

  /**
   * Emits when the search filters values may be stale, and so they must be refreshed.
   */
  @Input() refreshFilters: BehaviorSubject<boolean>;

  /**
   * The current scope
   */
  @Input() scope: string;

  /**
   * Injector to inject a child component with the @Input parameters
   */
  objectInjector: Injector;

  protected inputNamesDependentForComponent: (keyof this & string)[] = [
    'filterConfig',
  ];

  protected inputNames: (keyof this & string)[] = [
    'filterConfig',
    'inPlaceSearch',
    'refreshFilters',
    'scope',
  ];

  constructor(private injector: Injector, themeService: ThemeService) {
    super(themeService);
  }

  /**
   * Initialize and add the filter config to the injector
   */
  ngOnInit(): void {
    this.objectInjector = Injector.create({
      providers: [
        { provide: FILTER_CONFIG, useFactory: () => (this.filterConfig), deps: [] },
        { provide: IN_PLACE_SEARCH, useFactory: () => (this.inPlaceSearch), deps: [] },
        { provide: REFRESH_FILTER, useFactory: () => (this.refreshFilters), deps: [] },
        { provide: SCOPE, useFactory: () => (this.scope), deps: [] },
      ],
      parent: this.injector,
    });
    super.ngOnInit();
  }

  public getComponent(): [GenericConstructor<Component>, Injector] {
    return [renderFilterType(this.filterConfig.filterType), this.objectInjector];
  }

}
