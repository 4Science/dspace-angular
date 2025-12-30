import {
  Pipe,
  PipeTransform,
} from '@angular/core';

@Pipe({
  name: 'dsEscapeHtml',
  standalone: true,
})
export class EscapeHtmlPipe implements PipeTransform {
  /**
   * Escape HTML special characters and convert newlines to <br>
   * @param text
   */
  transform(text: string): string {
    const newlineRegex = /\n/g;
    return text.replace(/>/g, '&gt;').replace(/</g, '&lt;').replace(newlineRegex, '<br>');
  }
}
