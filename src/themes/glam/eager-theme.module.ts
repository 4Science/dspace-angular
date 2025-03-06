import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../app/shared/shared.module';
import { HomeNewsComponent } from './app/home-page/home-news/home-news.component';
import { NavbarComponent } from './app/navbar/navbar.component';
import { HeaderComponent } from './app/header/header.component';
import { FooterComponent } from './app/footer/footer.component';
import { HeaderNavbarWrapperComponent } from './app/header-nav-wrapper/header-navbar-wrapper.component';
import { SearchModule } from '../../app/shared/search/search.module';
import { RootModule } from '../../app/root.module';
import { NavbarModule } from '../../app/navbar/navbar.module';
import { ExploreModule } from '../../app/shared/explore/explore.module';
import { ExplorePageComponent } from './app/explore-page/explore-page.component';
import { HomePageComponent } from './app/home-page/home-page.component';
import { HomePageModule } from '../../app/home-page/home-page.module';
import { StatisticsModule } from '../../app/statistics/statistics.module';
import { OpenaireModule } from '../../app/openaire/openaire.module';
import { SearchComponent } from './app/shared/search/search.component';
import {
  CountersSectionComponent
} from './app/shared/explore/section-component/counters-section/counters-section.component';
import { TextSectionComponent } from './app/shared/explore/section-component/text-section/text-section.component';
import { MarkdownViewerModule } from 'src/app/shared/markdown-viewer/markdown-viewer.module';
import { LangSwitchComponent } from './app/shared/lang-switch/lang-switch.component';
import { AuthNavMenuComponent } from './app/shared/auth-nav-menu/auth-nav-menu.component';
import { SearchNavbarComponent } from './app/search-navbar/search-navbar.component';
import { CarouselModule } from '../../app/shared/carousel/carousel.module';
import {
  CarouselSectionComponent
} from './app/shared/explore/section-component/carousel-section/carousel-section.component';
import { GridSectionComponent } from './app/shared/explore/section-component/grid-section/grid-section.component';
import { CarouselComponent } from './app/shared/carousel/carousel.component';
import { CarouselWithThumbnailsModule } from 'src/app/shared/carousel-with-thumbnails/carousel-with-thumbnails.module';
import {
  ImagesBrowseElementsComponent
} from './app/shared/browse-most-elements/images-browse-elements/images-browse-elements.component';
import { MobileSearchNavbarComponent } from "./app/search-navbar/mobile-search-navbar/mobile-search-navbar.component";

/**
 * Add components that use a custom decorator to ENTRY_COMPONENTS as well as DECLARATIONS.
 * This will ensure that decorator gets picked up when the app loads
 */
const ENTRY_COMPONENTS = [];

const DECLARATIONS = [
  ...ENTRY_COMPONENTS,
  HomeNewsComponent,
  FooterComponent,
  HeaderComponent,
  HeaderNavbarWrapperComponent,
  NavbarComponent,
  ExplorePageComponent,
  HomePageComponent,
  SearchComponent,
  CountersSectionComponent,
  TextSectionComponent,
  LangSwitchComponent,
  AuthNavMenuComponent,
  SearchNavbarComponent,
  CarouselComponent,
  CarouselSectionComponent,
  GridSectionComponent,
  ImagesBrowseElementsComponent,
  MobileSearchNavbarComponent
];

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    SearchModule,
    FormsModule,
    RootModule,
    NavbarModule,
    ExploreModule,
    HomePageModule,
    StatisticsModule,
    OpenaireModule,
    CarouselModule,
    MarkdownViewerModule,
    CarouselWithThumbnailsModule
  ],
  declarations: DECLARATIONS,
  providers: [
    ...ENTRY_COMPONENTS.map((component) => ({ provide: component }))
  ],
})
/**
 * This module is included in the main bundle that gets downloaded at first page load. So it should
 * contain only the themed components that have to be available immediately for the first page load,
 * and the minimal set of imports required to make them work. Anything you can cut from it will make
 * the initial page load faster, but may cause the page to flicker as components that were already
 * rendered server side need to be lazy-loaded again client side
 *
 * Themed EntryComponents should also be added here
 */
export class EagerThemeModule {
}
