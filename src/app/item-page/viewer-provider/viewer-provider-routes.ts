import { Route } from '@angular/router';

import { itemResolver } from '../item.resolver';
import { bitstreamViewerProviderResolver } from './resolvers/bitstream-viewer.resolver';
import { componentProviderResolver } from './resolvers/component-provider.resolver';
import { i18nBreadcrumbComponentProviderResolver } from './resolvers/i18n-breadcrumb-component-provider.resolver';
import { ViewerProviderComponent } from './viewer-provider.component';

export const ROUTES: Route[] = [
  {
    path: ':viewer',
    component: ViewerProviderComponent,
    resolve: {
      item: itemResolver,
      breadcrumb: i18nBreadcrumbComponentProviderResolver,
      viewer: componentProviderResolver,
    },
    data: { title: 'viewer.provider.title', breadcrumbKey: 'viewer.provider', custom_params: ['viewer'] },
    // data: { title: 'viewer.provider.iiif.title', breadcrumbKey: 'viewer.provider.iiif' },
  },
  {
    path: ':bitstream_id/:viewer',
    component: ViewerProviderComponent,
    resolve: {
      breadcrumb: i18nBreadcrumbComponentProviderResolver,
      bitstream: bitstreamViewerProviderResolver,
      item: itemResolver,
      viewer: componentProviderResolver,
    },
    data: { title: 'viewer.provider.title', breadcrumbKey: 'viewer.provider', custom_params: ['viewer'] },
    children: [
      { path: 'pdf', component: ViewerProviderComponent },
      { path: 'audio', component: ViewerProviderComponent },
      { path: 'video', component: ViewerProviderComponent },
      { path: 'media', component: ViewerProviderComponent },
    ],
  },
];
