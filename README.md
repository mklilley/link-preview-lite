# link-preview-lite

This is a NodeJS server that generates a link preview based on information in the head of the link html.

The server expects a post request with a JSON body in the form:

```
{url : "https://example.com"}
```

It returns json with the link preview data in the form:

```
{
title: "Example page",
description "This is an example page",
image: "https://example.com/img/image.png",
domain: "example.com"

}
```

Note, this is a simple http server. If you want it to respond to https requests, then you'll either need to modify the server code, see e.g. [How to create an https server?](https://nodejs.org/en/knowledge/HTTP/servers/how-to-create-a-HTTPS-server/), or put the node server behind a reverse proxy, see e.g. [NGINX Reverse Proxy](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/).
