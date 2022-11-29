import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ViewerProviderComponent } from './viewer-provider.component';
import { BitstreamViewerResolver } from './resolvers/bitstream-viewer.resolver';
import { LinkService } from '../../core/cache/builders/link.service';
import { I18nBreadcrumbsService } from '../../core/breadcrumbs/i18n-breadcrumbs.service';
import { ItemResolver } from '../item.resolver';
import { ComponentProviderResolver } from './resolvers/component-provider.resolver';
import { I18nBreadcrumbComponentProviderResolver } from './resolvers/i18n-breadcrumb-component-provider.resolver';
import { I18nBreadcrumbResolver } from '../../core/breadcrumbs/i18n-breadcrumb.resolver';
import { ResourcePolicyResolver } from '../../shared/resource-policies/resolvers/resource-policy.resolver';
import { ResourcePolicyTargetResolver } from '../../shared/resource-policies/resolvers/resource-policy-target.resolver';
import { ItemPageReinstateGuard } from '../edit-item-page/item-page-reinstate.guard';
import { ItemPageWithdrawGuard } from '../edit-item-page/item-page-withdraw.guard';
import { ItemPageAdministratorGuard } from '../item-page-administrator.guard';
import { ItemPageMetadataGuard } from '../edit-item-page/item-page-metadata.guard';
import { ItemPageStatusGuard } from '../edit-item-page/item-page-status.guard';
import { ItemPageBitstreamsGuard } from '../edit-item-page/item-page-bitstreams.guard';
import { ItemPageRelationshipsGuard } from '../edit-item-page/item-page-relationships.guard';
import { ItemPageVersionHistoryGuard } from '../edit-item-page/item-page-version-history.guard';
import { ItemPageCollectionMapperGuard } from '../edit-item-page/item-page-collection-mapper.guard';
import { ItemPageUnlinkOrcidGuard } from '../edit-item-page/item-page-unlink-orcid.guard';
import { EditItemResolver } from '../../core/shared/resolvers/edit-item.resolver';

const routes: Routes = [
  {
    path: ':viewer',
    component: ViewerProviderComponent,
    resolve: {
      item: ItemResolver,
      breadcrumb: I18nBreadcrumbComponentProviderResolver,
      viewer: ComponentProviderResolver
    },
    data: { title: 'viewer.provider.title', breadcrumbKey: 'viewer.provider', custom_params: ['viewer'] },
    // data: { title: 'viewer.provider.iiif.title', breadcrumbKey: 'viewer.provider.iiif' },
  },
  {
    path: ':bitstream_id/:viewer',
    component: ViewerProviderComponent,
    resolve: {
      breadcrumb: I18nBreadcrumbComponentProviderResolver,
      bitstream: BitstreamViewerResolver,
      item: ItemResolver,
      viewer: ComponentProviderResolver
    },
    data: { title: 'viewer.provider.title', breadcrumbKey: 'viewer.provider', custom_params: ['viewer'] },
    children: [
      { path: 'pdf', component: ViewerProviderComponent },
      { path: 'audio', component: ViewerProviderComponent },
      { path: 'video', component: ViewerProviderComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  providers: [
    I18nBreadcrumbComponentProviderResolver,
    I18nBreadcrumbsService,
    LinkService,
    ItemResolver,
    BitstreamViewerResolver,
    ComponentProviderResolver,
    I18nBreadcrumbResolver,
    I18nBreadcrumbsService,
    ResourcePolicyResolver,
    ResourcePolicyTargetResolver,
    ItemPageReinstateGuard,
    ItemPageWithdrawGuard,
    ItemPageAdministratorGuard,
    ItemPageMetadataGuard,
    ItemPageStatusGuard,
    ItemPageBitstreamsGuard,
    ItemPageRelationshipsGuard,
    ItemPageVersionHistoryGuard,
    ItemPageCollectionMapperGuard,
    ItemPageUnlinkOrcidGuard,
    EditItemResolver
  ]
})
export class ViewerProviderRoutingModule {
}
