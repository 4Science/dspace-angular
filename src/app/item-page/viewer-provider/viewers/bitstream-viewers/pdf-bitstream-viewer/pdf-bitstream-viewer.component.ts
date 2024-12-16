import {
  AsyncPipe,
  NgClass,
  NgIf,
} from '@angular/common';
import {
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer';
import {
  Observable,
  Subscription,
} from 'rxjs';
import {
  filter,
  map,
  switchMap,
  tap,
} from 'rxjs/operators';

import { FileService } from '../../../../../core/shared/file.service';
import { VarDirective } from '../../../../../shared/utils/var.directive';
import { BaseBitstreamViewerComponent } from '../base-bitstream-viewer.component';

@Component({
  selector: 'ds-pdf-bitstream-viewer',
  templateUrl: './pdf-bitstream-viewer.component.html',
  styleUrls: ['./pdf-bitstream-viewer.component.scss'],
  imports: [
    NgIf,
    VarDirective,
    AsyncPipe,
    NgClass,
    PdfJsViewerModule,
  ],
  standalone: true,
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
      tap(_ => this.refreshViewer()),
    );
  }

  refreshViewer() {
    this.pdfViewer.refresh();
  }

}
