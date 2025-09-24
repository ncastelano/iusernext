class GeoHashHelper {
  private static _base32 = "0123456789bcdefghjkmnpqrstuvwxyz";

  static encode(latitude: number, longitude: number, precision = 9): string {
    const latInterval = [-90.0, 90.0];
    const lonInterval = [-180.0, 180.0];

    let geohash = "";
    let isEven = true;
    let bit = 0;
    let ch = 0;

    while (geohash.length < precision) {
      let mid: number;
      if (isEven) {
        mid = (lonInterval[0] + lonInterval[1]) / 2;
        if (longitude > mid) {
          ch |= 1 << (4 - bit);
          lonInterval[0] = mid;
        } else {
          lonInterval[1] = mid;
        }
      } else {
        mid = (latInterval[0] + latInterval[1]) / 2;
        if (latitude > mid) {
          ch |= 1 << (4 - bit);
          latInterval[0] = mid;
        } else {
          latInterval[1] = mid;
        }
      }

      isEven = !isEven;
      if (bit < 4) {
        bit++;
      } else {
        geohash += GeoHashHelper._base32[ch];
        bit = 0;
        ch = 0;
      }
    }

    return geohash;
  }
}
