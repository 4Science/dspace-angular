import {
  NgComponentOutlet,
  NgIf,
} from '@angular/common';
import {
  Component,
  ComponentFactoryResolver,
  Injector,
  Input,
  OnInit,
} from '@angular/core';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import {
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';

import { CrisLayoutBox } from '../../../core/layout/models/box.model';
import { GenericConstructor } from '../../../core/shared/generic-constructor';
import { Item } from '../../../core/shared/item.model';
import { hasNoValue } from '../../../shared/empty.util';
import { ThemedLoadingComponent } from '../../../shared/loading/themed-loading.component';
import {
  CrisLayoutBoxRenderOptions,
  getCrisLayoutBox,
} from '../../decorators/cris-layout-box.decorator';
import { LayoutBox } from '../../enums/layout-box.enum';

@Component({
  selector: 'ds-cris-layout-box-container',
  templateUrl: './cris-layout-box-container.component.html',
  styleUrls: ['./cris-layout-box-container.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgbAccordionModule,
    NgComponentOutlet,
    ThemedLoadingComponent,
    TranslateModule,
  ],
})
export class CrisLayoutBoxContainerComponent implements OnInit {

  @Input() box: CrisLayoutBox;

  /**
   * Item that is being viewed
   */
  @Input() item: Item;

  /**
   * The tab name
   */
  @Input() tabName: string;

  /**
   * CrisLayoutBoxRenderOptions reference of the box that will be created
   */
  componentLoader: CrisLayoutBoxRenderOptions;

  /**
   * The prefix used for box header's i18n key
   */
  boxI18nPrefix = 'layout.box.header.';

  /**
   * The i18n key used for box's header
   */
  boxHeaderI18nKey: string;

  /**
   * A generic i18n key used as fallback
   */
  boxHeaderGenericI18nKey: string;

  /**
   * Active tab utilized by accordion
   */
  activeIds: string[] = [];

  /**
   * Injector to inject a section component with the @Input parameters
   * @type {Injector}
   */
  public objectInjector: Injector;

  constructor(
    private injector: Injector,
    protected translateService: TranslateService,
    protected componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit(): void {

    this.objectInjector = Injector.create({
      providers: [
        { provide: 'boxProvider', useFactory: () => (this.box), deps: [] },
        { provide: 'itemProvider', useFactory: () => (this.item), deps: [] },
        { provide: 'tabNameProvider', useFactory: () => (this.tabName), deps: [] },
      ],
      parent: this.injector,
    });

    this.componentLoader = this.getComponent();

    this.boxHeaderI18nKey = this.boxI18nPrefix + this.box.entityType + '.' + this.box.shortname;
    this.boxHeaderGenericI18nKey = this.boxI18nPrefix + this.box.shortname;

    if (hasNoValue(this.box.collapsed) || !this.box.collapsed) {
      this.activeIds.push(this.box.shortname);
    }
  }

  /**
   * Active tab utilized by accordion
   */
  getComponent(): CrisLayoutBoxRenderOptions {
    return getCrisLayoutBox(this.box.boxType as LayoutBox);
  }
  /**
   * Get component reference to be inserted in the ngComponentOutlet
   */
  getComponentRef(): GenericConstructor<Component> {
    return this.componentLoader?.componentRef;
  }

  /**
   * get the translation for the i18n key
   * @param key the i18n key
   */
  getTranslation(key: string): string {
    const value = this.translateService.instant(key);
    return value === key ? null : value;
  }

  /**
   * Get box header to be inserted inside the accordion
   */
  getBoxHeader(): string {
    return this.getTranslation(this.boxHeaderI18nKey) ??
      this.getTranslation(this.boxHeaderGenericI18nKey) ??
      this.getTranslation(this.box.header) ??
      this.box.header ??
      '';
  }


}
