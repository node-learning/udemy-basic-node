var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var config = require('./config');
var mongoose = require('mongoose');

mongoose.connect(config.database, function(err) {
    if (err) {
        console.log(err);
    } else {
        console.log('Connected to the DB');
    }
})

var app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(morgan('dev'));

var api = require('./app/routes/api')(app, express);
app.use('/api', api);

app.get('*', function mainRoute(req, res) {
    res.sendFile(__dirname + '/public/views/index.html');
})

app.listen(config.port, function server(err) {
    if (err) {
        console.log(err);
    } else {
        console.log('Listening on port 3000');
    }
})
