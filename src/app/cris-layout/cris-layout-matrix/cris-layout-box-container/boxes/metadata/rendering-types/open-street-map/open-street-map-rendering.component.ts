import {
  AsyncPipe,
  NgIf,
} from '@angular/common';
import {
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import {
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import {
  BehaviorSubject,
  Observable,
} from 'rxjs';
import { map } from 'rxjs/operators';

import { LayoutField } from '../../../../../../../core/layout/models/box.model';
import {
  LocationCoordinates,
  LocationErrorCodes,
  LocationPlace,
  LocationService,
} from '../../../../../../../core/services/location.service';
import { Item } from '../../../../../../../core/shared/item.model';
import { MetadataValue } from '../../../../../../../core/shared/metadata.models';
import {
  OpenStreetMapComponent,
  OpenStreetMapPointer,
} from '../../../../../../../shared/open-street-map/open-street-map.component';
import { FieldRenderingType } from '../field-rendering-type';
import { RenderingTypeValueModelComponent } from '../rendering-type-value.model';

@Component({
  selector: 'ds-open-street-map-rendering',
  templateUrl: './open-street-map-rendering.component.html',
  styleUrls: ['./open-street-map-rendering.component.scss'],
  imports: [
    OpenStreetMapComponent,
    AsyncPipe,
    NgIf,
    TranslateModule,
  ],
  standalone: true,
})
export class OpenStreetMapRenderingComponent extends RenderingTypeValueModelComponent implements OnInit {

  place = new BehaviorSubject<LocationPlace>(undefined);

  coordinates$: Observable<LocationCoordinates>;
  pointers$: Observable<OpenStreetMapPointer[]>;
  displayName$: Observable<string>;

  invalidLocationErrorCode: BehaviorSubject<string> = new BehaviorSubject(undefined);

  constructor(
    @Inject('fieldProvider') public fieldProvider: LayoutField,
    @Inject('itemProvider') public itemProvider: Item,
    @Inject('metadataValueProvider') public metadataValueProvider: MetadataValue,
    @Inject('renderingSubTypeProvider') public renderingSubTypeProvider: string,
    @Inject('tabNameProvider') public tabNameProvider: string,
    protected translateService: TranslateService,
    private locationService: LocationService,
  ) {
    super(fieldProvider, itemProvider, metadataValueProvider, tabNameProvider, renderingSubTypeProvider, translateService);
  }

  ngOnInit(): void {

    this.coordinates$ = this.place.asObservable().pipe(
      map((place) => place.coordinates),
    );

    this.pointers$ = this.place.asObservable().pipe(
      map((place) => {
        const pointer: OpenStreetMapPointer = {
          coordinates: place.coordinates,
          color: 'green',
        };
        return [pointer];
      }),
    );

    this.displayName$ = this.place.asObservable().pipe(
      map((place) => place.displayName),
    );

    const position = this.metadataValue.value; // this may contain a pair or coordinate, a POI, or an address

    if (this.locationService.isCoordinateString(position)) {

      // Validate the coordinates, then retrieve the location name

      if (this.locationService.isValidCoordinateString(position)) {
        const coordinates = this.locationService.parseCoordinates(position);
        this.locationService.searchCoordinates(coordinates).subscribe({
          next: (displayName) => {
            const place: LocationPlace = {
              coordinates: coordinates,
              displayName: displayName, // Show the name retrieved from Nominatim
            };
            this.place.next(place);
          },
          error: (err: unknown) => {
            // show the map centered on provided coordinates despite the possibility to retrieve a description for the place
            const place: LocationPlace = {
              coordinates: coordinates,
            };
            this.place.next(place);
            if (((err as Error)?.message as LocationErrorCodes) === LocationErrorCodes.API_ERROR) {
              console.error((err as Error).message);
            } else {
              console.warn((err as Error).message);
            }
          },
        });
      } else {
        console.error(`Invalid coordinates: "${position}"`);
        this.invalidLocationErrorCode.next(LocationErrorCodes.INVALID_COORDINATES);
      }

    } else {

      // Retrieve the coordinates for the provided POI or address

      this.locationService.searchPlace(position).subscribe({
        next: (place) => {
          place.displayName = position; // Show the name stored in metadata (comment out to show name retrieved from Nominatim)
          this.place.next(place);
        },
        error: (err: unknown) => {
          this.invalidLocationErrorCode.next((err as Error)?.message); // either LOCATION_NOT_FOUND or API_ERROR
          if ((err as Error)?.message === LocationErrorCodes.API_ERROR) {
            console.error((err as Error).message);
          } else {
            console.warn((err as Error).message);
          }
        },
      });
    }

  }

}
