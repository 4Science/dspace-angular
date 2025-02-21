import { ListableObject } from '@dspace/core';

export const createAccessControlInitialFormState = (): AccessControlFormState => ({
  item: {
    toggleStatus: false,
    accessMode: 'replace',
  },
  bitstream: {
    toggleStatus: false,
    accessMode: 'replace',
    changesLimit: 'all', // 'all' | 'selected'
    selectedBitstreams: [] as ListableObject[],
  },
});

export interface AccessControlFormState {
  item: {
    toggleStatus: boolean,
    accessMode: 'add' | 'replace',
  },
  bitstream: {
    toggleStatus: boolean,
    accessMode: 'add' | 'replace',
    changesLimit: string,
    selectedBitstreams: ListableObject[],
  }
}
