if (!self.define) {
  let e,
    i = {};
  const s = (s, n) => (
    (s = new URL(s + ".js", n).href),
    i[s] ||
      new Promise((i) => {
        if ("document" in self) {
          const e = document.createElement("script");
          (e.src = s), (e.onload = i), document.head.appendChild(e);
        } else (e = s), importScripts(s), i();
      }).then(() => {
        let e = i[s];
        if (!e) throw new Error(`Module ${s} didn’t register its module`);
        return e;
      })
  );
  self.define = (n, a) => {
    const t =
      e ||
      ("document" in self ? document.currentScript.src : "") ||
      location.href;
    if (i[t]) return;
    let c = {};
    const r = (e) => s(e, t),
      o = { module: { uri: t }, exports: c, require: r };
    i[t] = Promise.all(n.map((e) => o[e] || r(e))).then((e) => (a(...e), c));
  };
}
define(["./workbox-4754cb34"], function (e) {
  "use strict";
  importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        {
          url: "/_next/app-build-manifest.json",
          revision: "d9079a63204fa8e8a5087b21f2bc9844",
        },
        {
          url: "/_next/static/bFHwTiHd--LxBiyJwUfi-/_buildManifest.js",
          revision: "960ef9972e329eb1fb0cdcdca54adfb9",
        },
        {
          url: "/_next/static/bFHwTiHd--LxBiyJwUfi-/_ssgManifest.js",
          revision: "b6652df95db52feb4daf4eca35380933",
        },
        {
          url: "/_next/static/chunks/254-470e744269e3f373.js",
          revision: "bFHwTiHd--LxBiyJwUfi-",
        },
        {
          url: "/_next/static/chunks/288-881af77b887e7e9f.js",
          revision: "bFHwTiHd--LxBiyJwUfi-",
        },
        {
          url: "/_next/static/chunks/341.df3329d77a5faa19.js",
          revision: "df3329d77a5faa19",
        },
        {
          url: "/_next/static/chunks/472.a3826d29d6854395.js",
          revision: "a3826d29d6854395",
        },
        {
          url: "/_next/static/chunks/4bd1b696-f89fa0f571e7b4f1.js",
          revision: "bFHwTiHd--LxBiyJwUfi-",
        },
        {
          url: "/_next/static/chunks/4e6af11a-c795ac2e6d3abf32.js",
          revision: "bFHwTiHd--LxBiyJwUfi-",
        },
        {
          url: "/_next/static/chunks/684-6e5a85ebb84faf03.js",
          revision: "bFHwTiHd--LxBiyJwUfi-",
        },
        {
          url: "/_next/static/chunks/766-c8005604943abe61.js",
          revision: "bFHwTiHd--LxBiyJwUfi-",
        },
        {
          url: "/_next/static/chunks/874-d0276fb8e4d68278.js",
          revision: "bFHwTiHd--LxBiyJwUfi-",
        },
        {
          url: "/_next/static/chunks/app/_not-found/page-bc55e04ebf514960.js",
          revision: "bFHwTiHd--LxBiyJwUfi-",
        },
        {
          url: "/_next/static/chunks/app/amarelo/page-2466270d2d5d0f94.js",
          revision: "bFHwTiHd--LxBiyJwUfi-",
        },
        {
          url: "/_next/static/chunks/app/azul/page-dc4b8784884714a6.js",
          revision: "bFHwTiHd--LxBiyJwUfi-",
        },
        {
          url: "/_next/static/chunks/app/cadastro/page-c64bd6707d97b343.js",
          revision: "bFHwTiHd--LxBiyJwUfi-",
        },
        {
          url: "/_next/static/chunks/app/home/page-9f1b080503e66775.js",
          revision: "bFHwTiHd--LxBiyJwUfi-",
        },
        {
          url: "/_next/static/chunks/app/inicio/page-0a20c4af5fbe3d88.js",
          revision: "bFHwTiHd--LxBiyJwUfi-",
        },
        {
          url: "/_next/static/chunks/app/layout-3b2ceca5671f0aea.js",
          revision: "bFHwTiHd--LxBiyJwUfi-",
        },
        {
          url: "/_next/static/chunks/app/login/page-b9e03cfa92a26cc8.js",
          revision: "bFHwTiHd--LxBiyJwUfi-",
        },
        {
          url: "/_next/static/chunks/app/mapa/page-da506188185c793b.js",
          revision: "bFHwTiHd--LxBiyJwUfi-",
        },
        {
          url: "/_next/static/chunks/app/page-1666e4f00205115a.js",
          revision: "bFHwTiHd--LxBiyJwUfi-",
        },
        {
          url: "/_next/static/chunks/app/todos-videos/page-a14b57c49495fad4.js",
          revision: "bFHwTiHd--LxBiyJwUfi-",
        },
        {
          url: "/_next/static/chunks/app/tudo/page-1c72591337396986.js",
          revision: "bFHwTiHd--LxBiyJwUfi-",
        },
        {
          url: "/_next/static/chunks/bc9e92e6-2ab29b0bc1bf2f36.js",
          revision: "bFHwTiHd--LxBiyJwUfi-",
        },
        {
          url: "/_next/static/chunks/f01af2bd-2415ef5c43c4fe73.js",
          revision: "bFHwTiHd--LxBiyJwUfi-",
        },
        {
          url: "/_next/static/chunks/framework-f593a28cde54158e.js",
          revision: "bFHwTiHd--LxBiyJwUfi-",
        },
        {
          url: "/_next/static/chunks/main-6d68312ec24357d8.js",
          revision: "bFHwTiHd--LxBiyJwUfi-",
        },
        {
          url: "/_next/static/chunks/main-app-a84da89058069937.js",
          revision: "bFHwTiHd--LxBiyJwUfi-",
        },
        {
          url: "/_next/static/chunks/pages/_app-92f2aae776f86b9c.js",
          revision: "bFHwTiHd--LxBiyJwUfi-",
        },
        {
          url: "/_next/static/chunks/pages/_error-71d2b6a7b832d02a.js",
          revision: "bFHwTiHd--LxBiyJwUfi-",
        },
        {
          url: "/_next/static/chunks/polyfills-42372ed130431b0a.js",
          revision: "846118c33b2c0e922d7b3a7676f81f6f",
        },
        {
          url: "/_next/static/chunks/webpack-af78f5c2c11af041.js",
          revision: "bFHwTiHd--LxBiyJwUfi-",
        },
        {
          url: "/_next/static/css/2f5fc0f79aeb806b.css",
          revision: "2f5fc0f79aeb806b",
        },
        {
          url: "/icon/icon_blackbg_512x512.png",
          revision: "79e9a68392e8bf92cac7daab7a0d84cd",
        },
        {
          url: "/icon/icon_blackbg_512x512.png",
          revision: "0ffba9c123706c3119d015c01425bdd0",
        },
        {
          url: "/icon/icon_blackbg_512x512.png",
          revision: "b7822b767b78c041976984a0a2dd7916",
        },
        { url: "/manifest.json", revision: "0e1e705c4d1ed55d41bffd7052635665" },
      ],
      { ignoreURLParametersMatching: [] }
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      "/",
      new e.NetworkFirst({
        cacheName: "start-url",
        plugins: [
          {
            cacheWillUpdate: async ({
              request: e,
              response: i,
              event: s,
              state: n,
            }) =>
              i && "opaqueredirect" === i.type
                ? new Response(i.body, {
                    status: 200,
                    statusText: "OK",
                    headers: i.headers,
                  })
                : i,
          },
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      new e.CacheFirst({
        cacheName: "google-fonts-webfonts",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      new e.StaleWhileRevalidate({
        cacheName: "google-fonts-stylesheets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-font-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-image-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new e.StaleWhileRevalidate({
        cacheName: "next-image",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:mp3|wav|ogg)$/i,
      new e.CacheFirst({
        cacheName: "static-audio-assets",
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:mp4)$/i,
      new e.CacheFirst({
        cacheName: "static-video-assets",
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:js)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-js-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:css|less)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-style-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\/_next\/data\/.+\/.+\.json$/i,
      new e.StaleWhileRevalidate({
        cacheName: "next-data",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:json|xml|csv)$/i,
      new e.NetworkFirst({
        cacheName: "static-data-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        const i = e.pathname;
        return !i.startsWith("/api/auth/") && !!i.startsWith("/api/");
      },
      new e.NetworkFirst({
        cacheName: "apis",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        return !e.pathname.startsWith("/api/");
      },
      new e.NetworkFirst({
        cacheName: "others",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      ({ url: e }) => !(self.origin === e.origin),
      new e.NetworkFirst({
        cacheName: "cross-origin",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 3600 }),
        ],
      }),
      "GET"
    );
});
