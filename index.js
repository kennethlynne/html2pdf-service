var express = require('express'),
    http = require('http'),
    path = require('path'),
    phantom = require('phantom');

var app = module.exports = express();

app.set('port', process.env.PORT || 3000);
app.use(express.logger('dev'));
app.use(express.methodOverride());
app.use(app.router);

if (app.get('env') === 'development') {
    app.use(express.errorHandler());
};

if (app.get('env') === 'production') {
};

app.get('*', function (req, res) {
    res.send('HELLO');

    //TODO: Verify token
    //TODO: Only allow generation from whitelisted domain

    phantom.create(function (phantomClient) {

        phantomClient.createPage(function (page) {
            page.open('http://www.google.com', function (status) {
                page.render('export.pdf', function () {

                })
            });
        });
    });

});

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
