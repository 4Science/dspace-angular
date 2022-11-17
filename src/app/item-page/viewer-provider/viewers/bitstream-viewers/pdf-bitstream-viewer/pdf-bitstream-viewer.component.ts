import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BaseBitstreamViewerComponent } from '../base-bitstream-viewer.component';
import { filter, map, switchMap } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { FileService } from '../../../../../core/shared/file.service';

@Component({
  selector: 'ds-pdf-bitstream-viewer',
  templateUrl: './pdf-bitstream-viewer.component.html',
  styleUrls: ['./pdf-bitstream-viewer.component.scss']
})
export class PdfBitstreamViewerComponent extends BaseBitstreamViewerComponent implements OnInit, OnDestroy {

  @ViewChild('pdfViewer') pdfViewer;

  private subscription: Subscription;

  constructor(private readonly fileService: FileService) {
    super();
  }

  pdfSrc$: Observable<Blob>;

  ngOnInit(): void {
    this.pdfSrc$ = this.bitstream$.pipe(
      map(bitstream => bitstream?._links?.content?.href),
      filter(Object),
      switchMap(href => this.fileService.downloadFile(href))
    );
    this.subscription =
      this.pdfSrc$
        .subscribe(blob => this.refreshViewer(blob));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  refreshViewer(blob: Blob) {
    this.pdfViewer.pdfSrc = blob;
    this.pdfViewer.refresh();
  }

}
