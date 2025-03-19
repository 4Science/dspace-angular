import SimpleAnnotationServerV2Adapter from 'mirador-annotations/es/SimpleAnnotationServerV2Adapter';


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
    const tokenCookie = this.getCookie('dsAuthInfo');
    if (!tokenCookie) {
      return "";
    }
    return JSON.parse(decodeURIComponent(tokenCookie.value))?.accessToken;
  }

  getCookies() {
    const cookieStrings = document.cookie.split(';');
    const cookies = [];
    const regex = new RegExp('^\\s*([^=]+)\\s*=\\s*(.*?)$');
    for (let i = 0; i < cookieStrings.length; i++) {
      const cookieStr = cookieStrings[i];
      const match = regex.exec(cookieStr);
      if (match === null) continue;
      cookies.push({
        name: match[1],
        value: match[2],
      });
    }
    return cookies;
  }

  getCookie(name) {
    const cookies = this.getCookies();
    for (let i = 0; i < cookies.length; i++) {
      if (cookies[i].name === name) return cookies[i];
    }
    return null;
  }

}
