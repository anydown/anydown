var connect = require("connect");
var http = require("http");

var app = connect();

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(function(req, res) {
  res.end("Hello from Connect!\n");
});
http.createServer(app).listen(3000);
