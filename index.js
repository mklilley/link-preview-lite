// Created by : Matt Lilley
// Created on : 07/02/2021
// Purpose    : To make it easier to deploy a link preview server
// References : https://github.com/microlinkhq/metascraper
//              https://github.com/mklilley/snippets/blob/master/node_api_server.js
//              https://nodejs.dev/learn/build-an-http-server

const metascraper = require("metascraper")([
  require("metascraper-description")(),
  require("metascraper-image")(),
  require("metascraper-title")(),
]);
const got = require("got");
const http = require("http");
const port = process.env.PORT || 7000;

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods":
    "HEAD, GET, POST, PUT, DELETE, OPTIONS, TRACE",
  "Access-Control-Max-Age": 2592000, // 30 days
  "Content-Type": "application/json",
};

const requestHandler = (req, res) => {
  let data = [];

  if (req.method === "OPTIONS") {
    res.writeHead(204, headers);
    res.end();
    return;
  } else {
    req.on("data", (chunk) => {
      data.push(chunk);
    });

    req.on("end", async () => {
      let url;
      try {
        const jsonBody = JSON.parse(data);
        url = jsonBody.url;
      } catch (error) {
        console.log("ERROR: Request body not JSON");
        res.writeHead(400, headers);
        res.end(JSON.stringify({ error: "Request body not JSON" }));
      }
      if (url === undefined) {
        console.log("ERROR: There is no url key in the json body");
        res.writeHead(400, headers);
        res.end(
          JSON.stringify({
            error: "Request body does not contain url key, i.e. {'url': ...}",
          })
        );
      } else {
        // This regex pattern will recognise most standard links. Improvements are welcome 🙏.
        const urlRegex = /(\b(https?):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/gi;

        const urls = url.match(urlRegex);

        if (urls !== null) {
          // SUCCESS There is at least one value URL in the json body
          let previewData;
          const nodeUrl = new URL(urls[0]);
          try {
            const gotResponse = await got(urls[0]);
            previewData = await metascraper({
              html: gotResponse.body,
              url: urls[0],
            });
            // In case of any null values, replace with fallback preview values
            previewData.description = previewData.description || urls[0];
            previewData.title = previewData.title || nodeUrl.hostname;
            previewData.image =
              previewData.image ||
              "http://www.globaltrack.in/assets/testimonial_images/no-image-800x800.jpg";

            // Add domain to preview.
            previewData.domain = nodeUrl.hostname;
          } catch (error) {
            console.log(error);
            console.log(
              "ERROR: metascraper couldn't retrieve any meta tags. Generating fallback preview."
            );
            previewData = {
              title: nodeUrl.hostname,
              description: urls[0],
              domain: nodeUrl.hostname,
              image:
                "http://www.globaltrack.in/assets/testimonial_images/no-image-800x800.jpg",
            };
          }
          res.writeHead(200, headers);
          res.end(JSON.stringify(previewData));
        } else {
          console.log("ERROR: There is no URL in the json body");
          res.writeHead(400, headers);
          res.end(
            JSON.stringify({
              error: "Request body does not contain a valid URL",
            })
          );
        }
      }
    });
  }
};

const server = http.createServer(requestHandler);

server.listen(port, (err) => {
  if (err) {
    return console.log("something bad happened", err);
  }

  console.log(`server is listening on ${port}`);
});
