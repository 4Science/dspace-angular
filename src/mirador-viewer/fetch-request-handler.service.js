
self.addEventListener("fetch", (event) => {
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
          console.error('Fetch interception failed:', error);
          return new Response('Error fetching resource', { status: 500 });
        }
      } else {
        return await fetch(event.request);
      }

    })()
  );
});
