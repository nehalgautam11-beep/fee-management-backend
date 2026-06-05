const app = require("../index");

module.exports = (req, res) => {
  req.url = "/";
  return app(req, res);
};
