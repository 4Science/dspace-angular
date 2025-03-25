self.addEventListener("install", (event) => {
  self.skipWaiting(); // Make sure the SW activates immediately
});

self.addEventListener("fetch", (event) => {
  event.waitUntil(self.clients.claim()); // Take control of page immediately
  event.respondWith(
    (async () => {
      const authHeader = new URL(location).searchParams.get('accessToken');
      const url = event.request.url;
      const headers = event.request.headers;

      // We modify only the requests directed to the image server.
      // This is needed to prevent missing headers in requests done automatically by the browser, e.g. request done for src in img tag.
      if(authHeader && url.includes('iiif-server') && !headers.has("Authorization")) {
        try {
          let modifiedRequest = new Request(event.request, {
            mode: 'cors', // Modify the request mode
            headers: new Headers({
              ...Object.fromEntries(event.request.headers.entries()),
              Authorization: authHeader
            }),
          });

          return await fetch(modifiedRequest);
        } catch (error) {
          const errorMessage = `Fetch interception failed for URL ${url}: ${error.message}`;
          console.error(errorMessage, error);
          return new Response(errorMessage, {
            status: 500,
            headers: { 'Content-Type': 'text/plain' }
          });
        }
      } else {
        return await fetch(event.request);
      }
    })()
  );
});
