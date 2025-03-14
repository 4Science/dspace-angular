import SimpleAnnotationServerV2Adapter from 'mirador-annotations/es/SimpleAnnotationServerV2Adapter';


export default class DspaceAnnotationServerAdapter extends SimpleAnnotationServerV2Adapter {

  async create(annotation) {
    const authToken = JSON.parse(localStorage.getItem('dspace-auth-token'))?.accessToken;
    if (annotation.target != null) {
      annotation.target.source = {id: annotation.target.source};
    }
    console.log(`Creating annotation ${annotation.target} - ${authToken}`);
    return fetch(`${this.endpointUrl}/create`, {
      body: JSON.stringify(SimpleAnnotationServerV2Adapter.createV2Anno(annotation)),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      method: 'POST',
      credentials: 'include'
    })
      .then((response) => this.all())
      .catch(() => this.all());
  }

  async update(annotation) {
    const authToken = JSON.parse(localStorage.getItem('dspace-auth-token'))?.accessToken;
    if (annotation.target != null) {
      annotation.target.source = {id: annotation.target.source};
    }
    console.log(`Updating annotation ${annotation.target} - ${authToken}`);
    return fetch(`${this.endpointUrl}/update`, {
      body: JSON.stringify(SimpleAnnotationServerV2Adapter.createV2Anno(annotation)),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      method: 'POST',
      credentials: 'include'
    })
      .then((response) => this.all())
      .catch(() => this.all());
  }

  async delete(annoId) {
    const authToken = JSON.parse(localStorage.getItem('dspace-auth-token'))?.accessToken;
    console.log(`Deleting annotation ${annoId} - ${authToken}`);
    return fetch(`${this.endpointUrl}/destroy?uri=${encodeURIComponent(annoId)}`, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      method: 'DELETE',
      credentials: 'include'
    })
      .then((response) => this.all())
      .catch(() => this.all());
  }

  async get(annoId) {
    // SAS does not have GET for a single annotation
    const annotationPage = await this.all();
    if (annotationPage) {
      return annotationPage.items.find((item) => item.id === annoId);
    }
    return null;
  }
}
