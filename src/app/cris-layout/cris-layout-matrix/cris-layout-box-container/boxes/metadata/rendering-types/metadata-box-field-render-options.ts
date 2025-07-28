import { Component } from '@angular/core';

import { GenericConstructor } from '../../../../../../core/shared/generic-constructor';

export interface MetadataBoxFieldRenderOptions {
  componentRef: GenericConstructor<Component>;
  structured: boolean;
}
