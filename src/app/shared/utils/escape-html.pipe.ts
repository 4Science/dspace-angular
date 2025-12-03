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
   * @param value - The string to escape
   * @returns The escaped string safe for innerHTML rendering
   */
  transform(value: string): string {
    if (!value) {
      return value;
    }
    const newlineRegex = /\n/g;
    return value
      .replace(/>/g, '&gt;')
      .replace(/</g, '&lt;')
      .replace(newlineRegex, '<br>');
  }
}
