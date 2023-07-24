import { Component, Inject, Input, OnDestroy, OnInit, PLATFORM_ID, ViewEncapsulation } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

import { BehaviorSubject } from 'rxjs';

import { MediaViewerItem } from '../../core/shared/media-viewer-item.model';
import { VideojsService } from './services/videojs.service';

@Component({
  selector: 'ds-media-player',
  templateUrl: './media-player.component.html',
  styleUrls: ['./media-player.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MediaPlayerComponent implements OnInit, OnDestroy {

  /**
   * The item uuid
   */
  @Input() itemUUID: string;

  /**
   * If given, the uuid of the bitstream to start playing
   */
  @Input() startUUID: string;

  /**
   * A boolean representing whether audio player is initialized or not
   */
  public isAudioPlayerInitialized$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /**
   * A boolean representing whether video player is initialized or not
   */
  public isVideoPlayerInitialized$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /**
   * A boolean representing whether the playing media is a video or not
   */
  public isVideo$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  /**
   * The instance of videojs for video media
   */
  public videoPlayer: any;

  /**
   * The instance of videojs for video media
   */
  public audioPlayer: any;

  /**
   * A boolean representing whether if is CSR or not
   */
  public isPlatformBrowser: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /**
   * The playing media item
   */
  public currentItem$: BehaviorSubject<MediaViewerItem> = new BehaviorSubject<MediaViewerItem>(null);

  /**
   * The instance for the VideojsService
   */
  public videojsService: VideojsService;

  constructor(@Inject(DOCUMENT) private _document: Document,
              @Inject(PLATFORM_ID) protected platformId: string) {
  }

  ngOnInit() {
    this.videoPlayer = false;
    this.audioPlayer = false;
    console.log('startUUID - Pl' , this.startUUID);
    console.log('itemUUID - Pl' , this.itemUUID);
    /* IMPORTANT
       Due to a problem occurring on SSR with the Videojs dependency, which use window object, the service can't be injected.
       So we need to instantiate the class directly based on current the platform */
    if (isPlatformBrowser(this.platformId)) {
      import('./services/browser-videojs.service').then((s) => {
        this.videojsService = new s.BrowserVideojsService();
        this.isPlatformBrowser.next(true);
      });
    } else {
      import('./services/server-videojs.service').then((s) => {
        this.videojsService = new s.ServerVideojsService();
        this.isPlatformBrowser.next(false);
      });
    }
  }

  /**
   * Handle the selected item given by the playlist
   * @param item
   */
  setNewMediaItem(item: MediaViewerItem) {
    this.currentItem$.next(item);
    this.isVideo$.next(this.mediaIsVideo(item));
    if (this.isVideo$.value) {
      if (this.isVideoPlayerInitialized$.value) {
        this.changePlayingItem(item);
      } else {
        this.initPlayer(item);
      }
    } else {
      if (this.isAudioPlayerInitialized$.value) {
        this.changePlayingItem(item);
      } else {
        this.initPlayer(item);
      }
    }
  }
  /**
   * Handle the selected timestamp by selection bar
   * @param timestamp
   */
  setNewTimestamp(timestamp: number) {
    if (this.isVideoPlayerInitialized$.value) {
      this.videoPlayer.currentTime(timestamp);
      }
    }

  /**
   * Init videojs player with the given item as source
   *
   * @param item
   * @private
   */
  private initPlayer(item: MediaViewerItem): void {
    if (this.isVideo$.value) {
      this.isVideoPlayerInitialized$.next(true);
      // stop audio player when switching from audio to video
      this.disposeAudioPlayer();
      setTimeout(() => {
        this.videoPlayer = this.videojsService.initVideoPlayer(
          this._document.getElementById('video_player'),
          this.currentItem$?.value
        );
      }, 100);

    } else {
      this.isAudioPlayerInitialized$.next(true);
      // stop audio player when switching from video to audio
      this.disposeVideoPlayer();
      setTimeout(() => {
        this.audioPlayer = this.videojsService.initAudioPlayer(
          this._document.getElementById('audio_player'),
          this.currentItem$?.value
        );
      }, 100);

    }
  }

  private mediaIsVideo(currentMedia: MediaViewerItem) {
    const bitstreamVideoFormat = currentMedia?.bitstream?.firstMetadataValue('bitstream.viewer.provider');
    return bitstreamVideoFormat === 'video-streaming';
  }

  /**
   * Change the source according to the given item
   *
   * @param item
   * @private
   */
  private changePlayingItem(item: MediaViewerItem) {
    if (this.isVideo$.value) {
      // stop audio player when switching from audio to video
      this.disposeAudioPlayer();
      this.videoPlayer.pause();
      this.videoPlayer.reset();
      this.videoPlayer.src({ src: this.currentItem$?.value?.manifestUrl, type: 'application/dash+xml' });
    } else {
      // stop audio player when switching from video to audio
      this.disposeVideoPlayer();
      this.audioPlayer.pause();
      this.audioPlayer.reset();
      this.audioPlayer.src({
        src: this.currentItem$?.value?.manifestUrl,
        type: 'application/dash+xml',
        peaks: this.currentItem$?.value?.bitstream.allMetadata('bitstream.audio.peaks')[0].value
      });
    }
  }


  /**
   * Dispose player on destroy
   */
  ngOnDestroy() {
    this.currentItem$.next(null);
    this.disposeAudioPlayer();
    this.disposeVideoPlayer();
  }

  /**
   * Dispose audio player
   */
  private disposeAudioPlayer() {
    if (this.audioPlayer) {
      this.audioPlayer.dispose();
      this.audioPlayer = false;
      this.isAudioPlayerInitialized$.next(false);
    }
  }

  /**
   * Dispose video player
   */
  private disposeVideoPlayer() {
    if (this.videoPlayer) {
      this.videoPlayer.dispose();
      this.videoPlayer = false;
      this.isVideoPlayerInitialized$.next(false);
    }
  }
}
