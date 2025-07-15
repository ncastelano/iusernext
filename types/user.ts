//types/user.ts

export interface User {
  uid: string;
  username: string;
  name: string;
  email: string;
  image: string;
  latitude: number | null;
  longitude: number | null;
  visible: boolean;
}
