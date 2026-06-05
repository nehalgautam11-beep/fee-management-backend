const app = require("../../index");

module.exports = (req, res) => {
  req.url = "/auth/login";
  return app(req, res);
};
