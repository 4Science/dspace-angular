// Todo: To reintroduce once library is fixed or find alternatve
//import 'videojs-hls-quality-selector'
//import 'videojs-contrib-quality-levels'

//import videojs from 'video.js';
//import Wavesurfer from 'videojs-wavesurfer/dist/videojs.wavesurfer.js';

import { MediaViewerItem } from '../../../core/shared/media-viewer-item.model';
import { VideojsService } from './videojs.service';

export class BrowserVideojsService implements VideojsService {

  plugin ;

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
      },
    },
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
    with: 600,
    height: 480,
    responsive: true,
    fluid: true,
  };

  /**
   * Return an instance of videojs player for video media
   */
  initAudioPlayer(element: HTMLElement, mediaItem: MediaViewerItem): any {

  }

  /**
   * Return an instance of videojs player for video media
   */
  initVideoPlayer(element: HTMLElement, mediaItem: MediaViewerItem): any {


    return ;
  }

}
