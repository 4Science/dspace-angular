import Mirador from 'mirador/dist/es/src/index';
import miradorShareDialogPlugin from 'mirador-share-plugin/es/MiradorShareDialog';
import miradorSharePlugin from 'mirador-share-plugin/es/miradorSharePlugin';
import miradorDownloadPlugin from 'mirador-dl-plugin/es/miradorDownloadPlugin';
import miradorDownloadDialog from 'mirador-dl-plugin/es/MiradorDownloadDialog';
import miradorAnnotationPlugins from 'mirador-annotations/es/index';
import LocalStorageAdapter from 'mirador-annotations/es/LocalStorageAdapter';
import miradorImageToolsPlugin from 'mirador-image-tools/es/plugins/miradorImageToolsPlugin';

const embedURL = location.href;
const params = new URLSearchParams(location.search);
const manifest = params.get('manifest');
const searchOption = params.get('searchable');
const query = params.get('query');
const multi = params.get('multi');
const notMobile = params.get('notMobile');

let windowSettings = {};
let sideBarPanel = 'info';
let defaultView = 'single';
let multipleItems = false;
let thumbNavigation = 'off';

windowSettings.manifestId = manifest;

(() => {
  if (searchOption) {
    defaultView = 'book';
    sideBarPanel = 'search';
    multipleItems = true;
    if (notMobile) {
      thumbNavigation = 'far-right';
    }
    if (query !== 'null') {
      windowSettings.defaultSearchQuery = query;
    }
  } else {
    if (multi) {
      multipleItems = multi;
      if (notMobile) {
        thumbNavigation = 'far-right';
      }
    }
  }
})();

const miradorConfiguration = {
  annotation: {
    adapter: (canvasId) => new LocalStorageAdapter(`localStorage://?canvasId=${canvasId}`),
  },
  id: 'mirador',
  mainMenuSettings: {
    show: true
  },
  thumbnailNavigation: {
    defaultPosition: thumbNavigation, // Which position for the thumbnail navigation to be displayed. Other possible values are "far-bottom" or "far-right"
    displaySettings: true, // Display the settings for this in WindowTopMenu
    height: 120, // height of entire ThumbnailNavigation area when position is "far-bottom"
    width: 100, // width of one canvas (doubled for book view) in ThumbnailNavigation area when position is "far-right"
  },
  themes: {
    light: {
      palette: {
        type: 'light',
        primary: {
          main: '#266883',
        },
        secondary: {
          main: '#b03727',
        },
        shades: { // Shades that can be used to offset color areas of the Workspace / Window
          dark: '#eeeeee',
          main: '#ffffff',
          light: '#ffffff',
        },
        highlights: {
          primary: '#ffff00',
          secondary: '#00BFFF',
        },
        search: {
          default: {fillStyle: '#00BFFF', globalAlpha: 0.3},
          hovered: {fillStyle: '#00FFFF', globalAlpha: 0.3},
          selected: {fillStyle: '#ff0900', globalAlpha: 0.3},
        },
      },
    },
    dark: {
      palette: {
        type: 'dark',
        primary: {
          main: '#2790b0',
        },
        secondary: {
          main: '#eeeeee',
        },
        highlights: {
          primary: '#ffff00',
          secondary: '#00BFFF',
        },
      },
    },
  },
  selectedTheme: 'light',
  data: [manifest],
  windows: [
    windowSettings
  ],
  miradorSharePlugin: {
    dragAndDropInfoLink: 'https://iiif.io',
    embedOption: {
      enabled: true,
      embedUrlReplacePattern: [
        /.*/,
        embedURL
      ],
      syncIframeDimensions: {
        height: {param: 'maxheight'},
      },
    },
    shareLink: {
      enabled: true,
      manifestIdReplacePattern: [
        /\/iiif\/manifest/,
        '',
      ],
    },
  },
  miradorDownloadPlugin: {
    restrictDownloadOnSizeDefinition: false
  },
  window: {
    allowClose: !0,
    // sideBarOpenByDefault: false,
    allowFullscreen: true,
    allowMaximize: false,
    defaultView: defaultView,
    sideBarOpen: notMobile,
    allowTopMenuButton: true,
    defaultSidebarPanelWidth: 230,
    switchCanvasOnSearch: true,
    views: [
      {key: 'single', behaviors: ['individuals']},
      {key: 'book', behaviors: ['paged']},
      {key: 'scroll', behaviors: ['continuous']},
      {key: 'gallery'},
    ],
    panels: {
      info: true,
      attribution: false,
      canvas: true,
      search: searchOption,
      layers: false,
    },
    sideBarPanel: sideBarPanel,
    imageToolsEnabled: true
  },
  workspace: {
    allowNewWindows: !0,
    showZoomControls: true,
    type: 'mosaic'
  },
  workspaceControlPanel: {
    enabled: !0
  }
};

const miradorPlugins = [
  miradorShareDialogPlugin,
  miradorSharePlugin,
  miradorDownloadDialog,
  miradorDownloadPlugin,
  ...miradorImageToolsPlugin,
  ...miradorAnnotationPlugins,
];

Mirador.viewer(miradorConfiguration, miradorPlugins);
