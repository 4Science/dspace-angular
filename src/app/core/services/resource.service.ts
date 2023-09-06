import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HALEndpointService } from '../shared/hal-endpoint.service';

/**
 * Service for downloading resources from external sources.
 */
@Injectable({
  providedIn: 'root'
})
export class ResourceService {

  constructor(private httpClient: HttpClient,
              private halService: HALEndpointService) {
  }

  public download(resourceUrl: string): Observable<Blob> {
    const baseUrl = this.halService.getRootHref();
    return this.httpClient.get(`${baseUrl}/resource-proxy`, {
      params: {externalSourceUrl: encodeURIComponent(resourceUrl)},
      responseType: 'blob'
    });
  }
}
