// types/markerTypes.ts
export type MarkerData = {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  image?: string;
};

export type VideoData = MarkerData & {
  videoID?: string;
  thumbnailUrl?: string;
  isFlash?: boolean;
  isPlace?: boolean;
  isStore?: boolean;
  isProduct?: boolean;
};
