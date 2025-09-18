// types/user.ts

export interface User {
  uid: string;
  namePage: string;
  username: string;
  name?: string;
  email?: string;
  image?: string;
  bio?: string;
  latitude: number | null;
  longitude: number | null;
  visible?: boolean;
  createdAt?: Date;
}
