export type MarkerData = {
  id: string; // ← ADICIONADO
  uid: string;
  username: string;
  namePage: string;
  name: string;
  email: string;
  image: string;
  latitude: number;
  longitude: number;
  visible: boolean;
  viewedBy?: string[];
};

export type VideoData = MarkerData & {
  videoID: string;
  userProfileImage: string;
  userName: string;
  thumbnailUrl: string;
  publishedDateTime?: number;
  artistSongName?: string;
  isFlash?: boolean;
  isPlace?: boolean;
  isStore?: boolean;
  isProduct?: boolean;
  videoUrl?: string;
  visaID?: string[];
};
