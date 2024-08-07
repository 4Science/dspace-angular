import { Component } from '@angular/core';

import { GenericConstructor } from '../../core/shared/generic-constructor';
import { hasNoValue } from '../../shared/empty.util';
import { LayoutBox } from '../enums/layout-box.enum';

const layoutBoxesMap = new Map<LayoutBox, CrisLayoutBoxRenderOptions>();

export interface CrisLayoutBoxRenderOptions {
  componentRef: GenericConstructor<Component>;
  hasOwnContainer: boolean;
}

export function RenderCrisLayoutBoxFor(boxType: LayoutBox, hasOwnContainer = false) {
  return function decorator(component: any) {
    if (hasNoValue(boxType)) {
      return;
    }
    if (hasNoValue(layoutBoxesMap.get(boxType))) {
      layoutBoxesMap.set(boxType, {
        componentRef: component,
        hasOwnContainer: hasOwnContainer,
      } as CrisLayoutBoxRenderOptions);
    }
  };
}

export function getCrisLayoutBox(boxType: LayoutBox): CrisLayoutBoxRenderOptions {
  return layoutBoxesMap.get(boxType);
}
