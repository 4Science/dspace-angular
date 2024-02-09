import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'ds-markdown-viewer',
  templateUrl: './markdown-viewer.component.html',
  styleUrls: ['./markdown-viewer.component.scss']
})
export class MarkdownViewerComponent implements OnInit {
  @Input() value: string;

  formattedValue: string;

  ngOnInit(): void {
    const isHtml = /<.*?>/.test(this.value) && /<\/.*?>/.test(this.value);
    this.formattedValue = isHtml ? this.value : this.value.replace(/\n/, '<br/>');
  }

}
