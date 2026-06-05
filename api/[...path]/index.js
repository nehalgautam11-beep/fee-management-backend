const app = require("../../index");

module.exports = (req, res) => {
  req.url = req.url.replace(/^\/api(?=\/|$)/, "") || "/";
  return app(req, res);
};
