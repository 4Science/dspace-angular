export interface CarouselOptions {
  /**
   * The title of the item
   */
  title: string;

  /**
   * The caption of the item
   */
  description: string;

  /**
   * The (optional) link of the item. It can be either relative (starting with "/") or absolute.
   */
  link: string;

  /**
   * If true, external links will be opened in a new tab
   */
  targetBlank: boolean;

  /**
   * Stretch the image to fit carousel width
   */
  fitWidth: boolean;

  /**
   * Stretch the image to fit carousel height
   */
  fitHeight: boolean;

  /**
   * Adapt the height of the carousel to its width
   */
  keepAspectRatio: boolean;

  /**
   * Set a fixed width/height ratio (when keepAspectRatio is true)
   */
  aspectRatio: number;

  /**
   * Set the height of the carousel in pixels. This will be ignored if keepAspectRatio is true.
   */
  carouselHeightPx: number;

  /**
   * Classes to be applied to the caption
   */
  captionStyle: string;

  /**
   * Classes to be applied to the title
   */
  titleStyle: string;

  /**
   * Applies a blurred backdrop
   */
  showBlurryBackdrop: boolean;
}
