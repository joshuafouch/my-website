export type MusicCatalogKind = 'artist' | 'album' | 'track';

export type MusicCatalogHit = {
  id: string;
  name: string;
  artistName: string;
  albumName: string;
  url: string;
  imageUrl: string;
};
