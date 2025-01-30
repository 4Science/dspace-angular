import SimpleAnnotationServerV2Adapter from 'mirador-annotations/es/SimpleAnnotationServerV2Adapter';


export default class DspaceAnnotationServerAdapter extends SimpleAnnotationServerV2Adapter {
    create(annotation) {
        annotation.target.source = {id: annotation.target.source};
        return super.create(annotation);
    }

    update(annotation) {
        annotation.target.source = {id: annotation.target.source};
        return super.update(annotation);
    }
}
