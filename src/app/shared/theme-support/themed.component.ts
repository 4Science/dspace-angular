import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ComponentRef,
  ElementRef,
  HostBinding,
  inject,
  Injector,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  Type,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  from as fromPromise,
  Observable,
  of as observableOf,
  Subscription,
} from 'rxjs';
import {
  catchError,
  map,
  switchMap,
  tap,
} from 'rxjs/operators';

import {
  hasNoValue,
  hasValue,
  isNotEmpty,
} from '../empty.util';
import { BASE_THEME_NAME } from './theme.constants';
import { ThemeService } from './theme.service';

@Component({
  selector: 'ds-themed',
  styleUrls: ['./themed.component.scss'],
  templateUrl: './themed.component.html',
  standalone: true,
})
export abstract class ThemedComponent<T extends object> implements AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('vcr', { read: ViewContainerRef }) vcr: ViewContainerRef;
  @ViewChild('content') themedElementContent: ElementRef;
  compRef: ComponentRef<T>;

  /**
   * A reference to the themed component. Will start as undefined and emit every time the themed
   * component is rendered
   */
  public compRef$: BehaviorSubject<ComponentRef<T>> = new BehaviorSubject(undefined);

  protected lazyLoadObs: Observable<any>;
  protected lazyLoadSub: Subscription;
  protected themeSub: Subscription;

  protected inAndOutputNames: (keyof T & keyof this)[] = [];

  protected injector = inject(Injector);

  /**
   * A data attribute on the ThemedComponent to indicate which theme the rendered component came from.
   */
  @HostBinding('attr.data-used-theme') usedTheme: string;

  constructor(
    protected cdr: ChangeDetectorRef,
    protected themeService: ThemeService,
  ) {
  }

  protected abstract getComponentName(): string;

  protected abstract importThemedComponent(themeName: string): Promise<any>;
  protected abstract importUnthemedComponent(): Promise<any>;

  ngOnChanges(changes: SimpleChanges): void {
    if (hasNoValue(this.compRef)) {
      // sometimes the component has not been initialized yet, so it first needs to be initialized
      // before being called again
      this.initComponentInstance(changes);
    } else {
      // if an input or output has changed
      if (this.inAndOutputNames.some((name: any) => hasValue(changes[name]))) {
        this.connectInputsAndOutputs();
        if (this.compRef?.instance && 'ngOnChanges' in this.compRef.instance) {
          (this.compRef.instance as any).ngOnChanges(changes);
        }
      }
    }
  }

  ngAfterViewInit(): void {
    this.initComponentInstance();
  }

  ngOnDestroy(): void {
    [this.themeSub, this.lazyLoadSub].filter((sub) => hasValue(sub)).forEach((sub) => sub.unsubscribe());
    this.destroyComponentInstance();
  }

  initComponentInstance(changes?: SimpleChanges) {
    if (hasValue(this.themeSub)) {
      this.themeSub.unsubscribe();
    }
    this.themeSub = this.themeService?.getThemeName$().subscribe(() => {
      this.renderComponentInstance(changes);
    });
  }

  protected renderComponentInstance(changes?: SimpleChanges): void {
    if (hasValue(this.lazyLoadSub)) {
      this.lazyLoadSub.unsubscribe();
    }

    if (hasNoValue(this.lazyLoadObs)) {
      this.lazyLoadObs = combineLatest([
        observableOf(changes),
        this.resolveThemedComponent(this.themeService.getThemeName()).pipe(
          switchMap((themedFile: any) => {
            if (hasValue(themedFile) && hasValue(themedFile[this.getComponentName()])) {
              // if the file is not null, and exports a component with the specified name,
              // return that component
              return [themedFile[this.getComponentName()]];
            } else {
              // otherwise import and return the default component
              return fromPromise(this.importUnthemedComponent()).pipe(
                tap(() => this.usedTheme = BASE_THEME_NAME),
                map((unthemedFile: any) => {
                  return unthemedFile[this.getComponentName()];
                }),
              );
            }
          })),
      ]);
    }

    this.lazyLoadSub = this.lazyLoadObs.subscribe(([simpleChanges, componentType]: [SimpleChanges, Type<T>]) => {
      this.destroyComponentInstance();

      // Get the ng-content selectors from the component metadata
      const ngContentSelectors = this.getComponentNgContentSelectors(componentType);
      const projectableNodes = this.getNgContent(this.themedElementContent.nativeElement, ngContentSelectors);

      // Create component without using ComponentFactoryResolver
      this.compRef = this.vcr.createComponent(componentType, {
        injector: this.injector,
        projectableNodes: projectableNodes,
      });

      if (hasValue(simpleChanges)) {
        this.ngOnChanges(simpleChanges);
      } else {
        this.connectInputsAndOutputs();
      }
      this.compRef$.next(this.compRef);
      this.cdr.markForCheck();
      this.themedElementContent.nativeElement.remove();
    });
  }

  /**
   * Retrieves ng-content selectors from a component type
   */
  private getComponentNgContentSelectors(componentType: Type<any>): string[] {
    const componentDef = (componentType as any).ɵcmp;
    if (componentDef && componentDef.ngContentSelectors) {
      return componentDef.ngContentSelectors;
    }
    return ['*']; // Default fallback
  }

  protected destroyComponentInstance(): void {
    if (hasValue(this.compRef)) {
      this.compRef.destroy();
      this.compRef = null;
    }
    if (hasValue(this.vcr)) {
      this.vcr.clear();
    }
  }

  /**
   * Extracts and returns the content nodes from the given element based on the provided ng-content selectors.
   *
   * @param {Element} element - The DOM element from which to extract content nodes.
   * @param {string[]} ngSelectors - An array of ng-content selectors to match against the element's children.
   * @returns {Node[][]} - A 2D array where each sub-array contains the nodes matching a specific selector.
   */
  protected getNgContent(element: Element, ngSelectors: string[]): Node[][] {
    return ngSelectors.map(selector => {
      if (selector === '*') {
        // If the selector is '*', return all child nodes of the element.
        return Array.from(element.childNodes);
      } else {
        // Otherwise, select and return the nodes matching the specific selector.
        const selectedElements = Array.from(element.querySelectorAll(selector));
        // Remove the selected elements from the DOM.
        selectedElements.forEach(e => e.remove());
        return selectedElements;
      }
    });
  }

  protected connectInputsAndOutputs(): void {
    if (isNotEmpty(this.inAndOutputNames) && hasValue(this.compRef) && hasValue(this.compRef.instance)) {
      this.inAndOutputNames.filter((name: any) => this[name] !== undefined).forEach((name: any) => {
        this.compRef.instance[name] = this[name];
      });
    }
  }

  /**
   * Attempt to import this component from the current theme or a theme it {@link NamedThemeConfig.extends}.
   * Recurse until we succeed or when until we run out of themes to fall back to.
   *
   * @param themeName The name of the theme to check
   * @param checkedThemeNames The list of theme names that are already checked
   * @private
   */
  private resolveThemedComponent(themeName?: string, checkedThemeNames: string[] = []): Observable<any> {
    if (isNotEmpty(themeName)) {
      return fromPromise(this.importThemedComponent(themeName)).pipe(
        tap(() => this.usedTheme = themeName),
        catchError(() => {
          // Try the next ancestor theme instead
          const nextTheme = this.themeService.getThemeConfigFor(themeName)?.extends;
          const nextCheckedThemeNames = [...checkedThemeNames, themeName];
          if (checkedThemeNames.includes(nextTheme)) {
            throw new Error('Theme extension cycle detected: ' + [...nextCheckedThemeNames, nextTheme].join(' -> '));
          } else {
            return this.resolveThemedComponent(nextTheme, nextCheckedThemeNames);
          }
        }),
      );
    } else {
      // If we got here, we've failed to import this component from any ancestor theme → fall back to unthemed
      return observableOf(null);
    }
  }
}
