import { clip } from './common.js';

/** Only add or remove images when the editor's text is actually about images. */
export const IMAGE_WORDS = /\b(images?|photos?|pictures?|placeholders?|dummy|banners?|illustrations?|graphics?|thumbnails?)\b/i;

/** Dummy image address. The model never supplies URLs. */
export function dummyImageUrl(alt) {
  const label = clip(alt, 40) || 'Image';
  return `https://placehold.co/1200x600/png?text=${encodeURIComponent(label)}`;
}
