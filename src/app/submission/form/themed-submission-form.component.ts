import {
  Component,
  Input,
} from '@angular/core';
import { MetadataSecurityConfiguration } from 'src/app/core/submission/models/metadata-security-configuration';

import { SubmissionDefinitionsModel } from '../../core/config/models/config-submission-definitions.model';
import { Item } from '../../core/shared/item.model';
import { WorkspaceitemSectionsObject } from '../../core/submission/models/workspaceitem-sections.model';
import { ThemedComponent } from '../../shared/theme-support/themed.component';
import { SubmissionError } from '../objects/submission-error.model';
import { SubmissionFormComponent } from './submission-form.component';

@Component({
  selector: 'ds-submission-form',
  templateUrl: '../../shared/theme-support/themed.component.html',
})
export class ThemedSubmissionFormComponent extends ThemedComponent<SubmissionFormComponent> {
  @Input() collectionId: string;

  @Input() entityType: string;

  @Input() item: Item;

  @Input() collectionModifiable: boolean | null;

  @Input() metadataSecurityConfiguration: MetadataSecurityConfiguration;

  @Input() sections: WorkspaceitemSectionsObject;

  @Input() submissionErrors: SubmissionError;

  @Input() selfUrl: string;

  @Input() submissionDefinition: SubmissionDefinitionsModel;

  @Input() submissionId: string;

  protected inAndOutputNames: (keyof SubmissionFormComponent & keyof this)[] = ['collectionId', 'entityType', 'item', 'collectionModifiable', 'metadataSecurityConfiguration', 'sections', 'submissionErrors', 'selfUrl', 'submissionDefinition', 'submissionId'];

  protected getComponentName(): string {
    return 'SubmissionFormComponent';
  }

  protected importThemedComponent(themeName: string): Promise<any> {
    return import(`../../../themes/${themeName}/app/submission/form/submission-form.component`);
  }

  protected importUnthemedComponent(): Promise<any> {
    return import(`./submission-form.component`);
  }
}
