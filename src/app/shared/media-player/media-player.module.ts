import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared.module';
import { MediaPlayerComponent } from './media-player.component';
import { MediaPlayerPlaylistComponent } from './media-player-playlist/media-player-playlist.component';

const COMPONENTS = [
  MediaPlayerComponent,
  MediaPlayerPlaylistComponent
];

@NgModule({
  imports: [CommonModule, SharedModule],
  declarations: [...COMPONENTS],
  exports: [...COMPONENTS]
})

export class MediaPlayerModule {}
