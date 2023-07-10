import { MediaViewerItem } from '../../../core/shared/media-viewer-item.model';

export interface VideojsService {

  /**
   * Return an instance of videojs player for video media
   */
  initAudioPlayer(element: HTMLElement, mediaItem: MediaViewerItem): any;

  /**
   * Return an instance of videojs player for video media
   */
  initVideoPlayer(element: HTMLElement, mediaItem: MediaViewerItem): any;
}
