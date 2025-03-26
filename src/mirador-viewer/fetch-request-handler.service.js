self.addEventListener("install", (event) => {
  self.skipWaiting(); // Make sure the SW activates immediately
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim()); // Take control of open pages immediately
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    (async () => {
      const authHeader = new URL(location).searchParams.get('accessToken');
      const url = event.request.url;
      const headers = new Headers(event.request.headers); // Clone headers (allows modification)

      // We modify only the requests directed to the image server.
      // This is needed to prevent missing headers in requests done automatically by the browser, e.g. request done for src in img tag.
      if(authHeader && url.includes('iiif-server') && !headers.get("Authorization")) {
        headers.set("Authorization", authHeader);
        try {
          let modifiedRequest = new Request(event.request, {
            mode: 'cors', // Modify the request mode
            credentials: "include", // Ensures cookies & auth headers are sent
            headers
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
