import { SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import isObject from 'lodash/isObject';

import { Item } from '../../../shared/item.model';
import { isNotEmpty } from '../../../../shared/empty.util';

export abstract class SchemaType {
  constructor(protected sanitizer: DomSanitizer) {}

  protected abstract createSchema(item: Item): Record<string, any>;
  protected abstract createSchema(item: Item): Record<string, any>;

  static getMetadataValue(item: Item, metadataName:  string): string|string[] {
    const values = item.allMetadataValues(metadataName);
    if (isNotEmpty(values)) {
      return values.length > 1 ? values : values[0];
    } else {
      return null;
    }
  }

  static removeEmpty(obj) {
    if (Array.isArray(obj)) {
      return obj
        .filter((v) => isNotEmpty(v))
        .map((v)  => isObject(v) ? SchemaType.removeEmpty(v) : v);
    } else {
      return Object.entries(obj)
        .filter(([_, v]) => isNotEmpty(v))
        .reduce(
          (acc, [k, v]) => ({ ...acc, [k]: v === Object(v) ? SchemaType.removeEmpty(v) : v }),
          {}
        );
    }
  }

  protected sanitizeSchema(obj: any):  Record<string, any> {
    if (Array.isArray(obj)) {
      return obj.map(v =>
        typeof v === 'string'
          ? this.sanitizer.sanitize(SecurityContext.HTML, v)
          : this.sanitizeSchema(v),
      );
    }

    if (typeof obj === 'object' && obj !== null) {
      const sanitized: Record<string, any> = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const value = obj[key];
          sanitized[key] =
            typeof value === 'string'
              ? this.sanitizer.sanitize(SecurityContext.HTML, value)
              : this.sanitizeSchema(value);
        }
      }
      return sanitized;
    }

    return obj;
  }


  getSchema(item: Item): Record<string, any> {
    return SchemaType.removeEmpty(this.createSchema(item));
    const sanitizedRaw = this.sanitizeSchema(this.createSchema(item));
    return SchemaType.removeEmpty(sanitizedRaw);
  }
}
