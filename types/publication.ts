import { GeoPoint } from "firebase/firestore";

export type Publication = {
  // -----------------------------
  // Campos obrigatórios principais
  // -----------------------------
  position: GeoPoint; // posição nativa do Firebase (latitude/longitude)
  geohash: string; // geohash para buscas geográficas rápidas
  ranking: number; // ranking/score da publicação
  publicationType: string; // tipo principal: "video", "image", "pdf", "song", "text", etc.
  ownerType: string; // dono da publicação: "user", "store", "product"
  userID: string; // id do usuário que postou
  createdDateTime: Date; // data de criação do registro
  publishedDateTime?: Date; // data de publicação
  updatedAt?: Date; // data de última atualização
  expiresAt?: Date; // data de expiração (opcional)

  // -----------------------------
  // Campos booleanos opcionais
  // -----------------------------
  free?: boolean;
  active?: boolean;
  visibleOnMap?: boolean;
  deleted?: boolean;

  // -----------------------------
  // Informações do usuário
  // -----------------------------
  userProfileImage?: string;
  namePage?: string;

  // -----------------------------
  // Informações de loja/produto
  // -----------------------------
  storeID?: string;
  storePage?: string;
  storeName?: string;
  productID?: string;
  productName?: string;

  // -----------------------------
  // Links de mídia
  // -----------------------------
  imageID?: string;
  imageUrl?: string;
  imageName?: string;
  videoID?: string;
  videoUrl?: string;
  videoDuration?: number;
  videoName?: string;
  pdfID?: string;
  pdfUrl?: string;
  pdfName?: string;
  songID?: string;
  songUrl?: string;
  songDuration?: number;
  songName?: string;

  // -----------------------------
  // Campos de texto
  // -----------------------------
  textID?: string; // id único do texto
  textTitle?: string; // título do texto (opcional)
  textContent?: string; // conteúdo principal do texto
  textExcerpt?: string; // resumo ou primeira linha do texto (opcional)
  textLanguage?: string; // idioma do texto, ex: "pt", "en" (opcional)

  // -----------------------------
  // Preço e moeda (se for produto/loja)
  // -----------------------------
  priceInCents?: number;
  currency?: string;

  // -----------------------------
  // Hashtags e categorias
  // -----------------------------
  hashtags?: string[];
  categorie?: string;

  // -----------------------------
  // Interações sociais
  // -----------------------------
  likes?: number;
  totalComments?: number;
  shares?: number;
  views?: number;
};
