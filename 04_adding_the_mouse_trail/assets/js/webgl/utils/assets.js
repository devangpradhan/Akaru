import { TextureLoader } from 'three';

export function loadTexture(url, { minFilter } = {}) {
  const texture = new TextureLoader().load(url);

  if (minFilter) {
    texture.minFilter = minFilter;
  }

  return texture;
}
