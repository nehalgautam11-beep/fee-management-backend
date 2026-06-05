const bridge = require("../_bridge");

module.exports = (req, res) => bridge(req, res, "auth");
