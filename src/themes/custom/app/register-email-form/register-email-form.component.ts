import { Component } from '@angular/core';

import {
  RegisterEmailFormComponent as BaseComponent
} from '../../../../app/register-email-form/register-email-form.component';
import { TranslateModule } from '@ngx-translate/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { GoogleRecaptchaComponent } from 'src/app/shared/google-recaptcha/google-recaptcha.component';
import { AlertComponent } from 'src/app/shared/alert/alert.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'ds-register-email-form',
  // templateUrl: './register-email-form.component.html',
  templateUrl: '../../../../app/register-email-form/register-email-form.component.html',
  standalone: true,
  imports: [NgIf, FormsModule, ReactiveFormsModule, AlertComponent, GoogleRecaptchaComponent, AsyncPipe, TranslateModule]
})
export class RegisterEmailFormComponent extends BaseComponent {
}
