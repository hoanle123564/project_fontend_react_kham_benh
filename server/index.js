const express = require("express");
const path = require("path");

const app = express();

const buildDir = path.join(__dirname, "../build");
console.log("Using files in " + buildDir);

const subDir = "/";
const logRequests = false;

// Serve the static files from the React app
// app.use(subDir, express.static(buildDir));
// Handles any requests that don't match the ones above
app.get("/", (req, res) => {
  //   if (logRequests) {
  //     console.log(req.method + " " + req.url);
  //   }
  res.sendFile(path.join(buildDir, "index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port);

console.log("React.JS App is running on the port " + port);
