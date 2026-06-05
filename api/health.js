const app = require("../index");

module.exports = (req, res) => {
  req.url = "/health";
  return app(req, res);
};
