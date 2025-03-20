import SimpleAnnotationServerV2Adapter from 'mirador-annotations/es/SimpleAnnotationServerV2Adapter';
import CookieService from "./cookie-service";


export default class DspaceAnnotationServerAdapter extends SimpleAnnotationServerV2Adapter {

  async create(annotation) {
    const headers = this.getHeaders();
    annotation.target.source = {id: annotation.target.source};
    return fetch(`${this.endpointUrl}/create`, {
      body: JSON.stringify(SimpleAnnotationServerV2Adapter.createV2Anno(annotation)),
      headers: headers,
      method: 'POST'
    })
      .then((response) => this.all())
      .catch(() => this.all());
  }

  async update(annotation) {
    const headers = this.getHeaders();
    annotation.target.source = {id: annotation.target.source};
    return fetch(`${this.endpointUrl}/update`, {
      body: JSON.stringify(SimpleAnnotationServerV2Adapter.createV2Anno(annotation)),
      headers: headers,
      method: 'POST'
    })
      .then((response) => this.all())
      .catch(() => this.all());
  }

  async delete(annoId) {
    const headers = this.getHeaders();
    return fetch(`${this.endpointUrl}/destroy?uri=${encodeURIComponent(annoId)}`, {
      headers: headers,
      method: 'DELETE'
    })
      .then((response) => this.all())
      .catch(() => this.all());
  }

  getHeaders() {
    const authToken = this.getAuthToken();
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    };
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }
    return headers;
  }

  getAuthToken() {
    const tokenCookie = CookieService.getCookie('dsAuthInfo');
    if (!tokenCookie) {
      console.warn('Authentication token not found in cookies');
      return "";
    }
    const token = JSON.parse(decodeURIComponent(tokenCookie.value))?.accessToken;
    if (!token) {
      console.warn('Invalid or empty authentication token');
    }
    return token;
  }

}
