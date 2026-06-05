const app = require("../index");

function getQueryString(req) {
  const queryIndex = req.url.indexOf("?");
  return queryIndex === -1 ? "" : req.url.slice(queryIndex);
}

function getPathTail(req) {
  const path = req.query?.path;
  if (Array.isArray(path)) return path.join("/");
  if (typeof path === "string") return path;
  return "";
}

function bridge(req, res, basePath) {
  const tail = getPathTail(req);
  const suffix = tail ? `/${tail}` : "";
  req.url = `/${basePath}${suffix}${getQueryString(req)}`;
  return app(req, res);
}

module.exports = bridge;
