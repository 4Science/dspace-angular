import videojs from 'video.js';
import 'videojs-hls-quality-selector';
import 'videojs-contrib-quality-levels';
import Wavesurfer from 'videojs-wavesurfer/dist/videojs.wavesurfer.js';

import { VideojsService } from './videojs.service';
import { MediaViewerItem } from '../../../core/shared/media-viewer-item.model';

export class BrowserVideojsService implements VideojsService {

  plugin = Wavesurfer;

  /**
   * The config object for audio player
   * @private
   */
  configAudio = {
    controls: true,
    bigPlayButton: false,
    autoplay: false,
    responsive: true,
    fluid: true,
    loop: false,
    plugins: {
      wavesurfer: {
        backend: 'MediaElement',
        debug: true,
        waveColor: 'green',
        progressColor: 'grey',
        cursorColor: 'grey',
        hideScrollbar: true,
        barHeight: 0.00002,
      }
    }
  };

  /**
   * The config object for video player
   * @private
   */
  configVideo = {
    controls: true,
    bigPlayButton: true,
    autoplay: false,
    loop: false,
    responsive: true,
    fluid: true,
    aspectRatio: undefined
  };

  /**
   * Return an instance of videojs player for video media
   */
  initAudioPlayer(element: HTMLElement, mediaItem: MediaViewerItem): any {
    const audioPlayer: any = videojs(element, this.configAudio, () => {
      audioPlayer.src({
        src: mediaItem?.manifestUrl,
        type: 'application/dash+xml',
        peaks: mediaItem?.bitstream?.firstMetadataValue('bitstream.audio.peaks')
      });
    });

    return audioPlayer;
  }

  /**
   * Return an instance of videojs player for video media
   */
  initVideoPlayer(element: HTMLElement, mediaItem: MediaViewerItem): any {
    const currentVideoRatio =  parseInt(mediaItem.bitstream.firstMetadataValue('bitstream.video.width'), 10) /
      parseInt(mediaItem.bitstream.firstMetadataValue('bitstream.video.height'), 10);

    if (currentVideoRatio < 1) {
      // videojs available ratios are '16:9', '9:16', '4:3', we set it only for portrait mode since the width would be off for those
      this.configVideo = {
        ...this.configVideo,
        aspectRatio: '9:16'
      };
    }

    const videoPlayer = videojs(element, this.configVideo, () => {
      videoPlayer.src({ src: mediaItem?.manifestUrl, type: 'application/dash+xml' });
      (videoPlayer as any).hlsQualitySelector();
    });

    return videoPlayer;
  }

}
