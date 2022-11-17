import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseBitstreamViewerComponent } from '../base-bitstream-viewer.component';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { FileService } from '../../../../../core/shared/file.service';

@Component({
  selector: 'ds-pdf-bitstream-viewer',
  templateUrl: './pdf-bitstream-viewer.component.html',
  styleUrls: ['./pdf-bitstream-viewer.component.scss']
})
export class PdfBitstreamViewerComponent extends BaseBitstreamViewerComponent implements OnInit {

  @ViewChild('pdfViewer') pdfViewer;
  pdfSrc$: Observable<Blob>;
  private subscription: Subscription;

  constructor(private readonly fileService: FileService) {
    super();
  }

  ngOnInit(): void {
    this.pdfSrc$ = this.bitstream$.pipe(
      map(bitstream => bitstream?._links?.content?.href),
      filter(Object),
      switchMap(href => this.fileService.downloadFile(href)),
      filter(Object),
      tap(_ => this.refreshViewer())
    );
  }

  refreshViewer() {
    this.pdfViewer.refresh();
  }

}
