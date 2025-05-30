import { Item } from '../core/shared/item.model';
import { URLCombiner } from '../core/url-combiner/url-combiner';
import { isNotEmpty } from '../shared/empty.util';

export const ITEM_MODULE_PATH = 'items';

export function getItemModuleRoute() {
  return `/${ITEM_MODULE_PATH}`;
}

/**
 * Get the route to an item's page
 * Depending on the item's entity type and custom url, the route will either start /entities
 * @param item  The item to retrieve the route for
 */
export function getItemPageRoute(item: Item) {
  const type = item.firstMetadataValue('dspace.entity.type');
  let url = item.uuid;

  if (isNotEmpty(item.metadata) && isNotEmpty(item.metadata['cris.customurl'])) {
    url = item.metadata['cris.customurl'][0].value;
  }

  return getEntityPageRoute(type, url);
}

export function getItemEditRoute(item: Item) {
  return new URLCombiner(getItemPageRoute(item), ITEM_EDIT_PATH).toString();
}

export function getItemFullPageRoute(item: Item) {
  return new URLCombiner(getItemPageRoute(item), ITEM_FULL_PATH).toString();
}

export function getItemEditVersionhistoryRoute(item: Item) {
  return new URLCombiner(getItemPageRoute(item), ITEM_EDIT_PATH, ITEM_EDIT_VERSIONHISTORY_PATH).toString();
}

export function getEntityPageRoute(entityType: string, itemId: string) {
  if (isNotEmpty(entityType)) {
    return new URLCombiner('/entities', encodeURIComponent(entityType.toLowerCase()), itemId).toString();
  } else {
    return new URLCombiner(getItemModuleRoute(), itemId).toString();
  }
}

export function getEntityEditRoute(entityType: string, itemId: string) {
  return new URLCombiner(getEntityPageRoute(entityType, itemId), ITEM_EDIT_PATH).toString();
}

/**
 * Get the route to an item's version
 * @param versionId the ID of the version for which the route will be retrieved
 */
export function getItemVersionRoute(versionId: string) {
  return new URLCombiner(getItemModuleRoute(), ITEM_VERSION_PATH, versionId).toString();
}


export const ITEM_EDIT_PATH = 'edit';
export const ITEM_EDIT_VERSIONHISTORY_PATH = 'versionhistory';
export const ITEM_VERSION_PATH = 'version';
export const UPLOAD_BITSTREAM_PATH = 'bitstreams/new';
export const ORCID_PATH = 'orcid';
export const ITEM_FULL_PATH = 'full';
