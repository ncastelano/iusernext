// types/user.ts

export interface User {
  uid: string;
  username: string;
  namePage: string;
  name: string;
  email: string;
  image: string;
  latitude: number | null;
  longitude: number | null;
  visible: boolean;
  viewedBy?: string[]; // UIDs de usuários (logados ou anônimos) que visualizaram o perfil
}
