export type Post = {
  // 🔹 Comum a todos os tipos

  withPerson?: string[];
  viewed: string[];
  wantIt: string[];
  userID?: string;
  userName?: string;
  userProfileImage: string;
  thumbnailUrl?: string;
  postID?: string;
  postUrl?: string;
  latitude?: number;
  longitude?: number;
  originalTime?: number;
  editedOriginalTime?: number;
  showOriginalTime?: boolean;

  // ⚡ Flash
  isFlash?: boolean;
  titleFlash?: string;

  // 📍 Place
  isPlace?: boolean;
  titlePlace?: string;

  // 🏬 Store
  isStore?: boolean;
  titleStore?: string;

  // 🛍️ Product
  isProduct?: boolean;
  titleProduct?: string;
  free?: boolean;
  price?: number;
  acquired: string[];
};
