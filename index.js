var express = require('express'),
    http = require('http'),
    path = require('path'),
    phantom = require('phantom'),
    config = require('./config.json');

var app = module.exports = express();

app.set('port', process.env.PORT || 3000);
app.use(express.logger('dev'));
app.use(express.methodOverride());
app.use(app.router);

if (app.get('env') === 'development') {
    app.use(express.errorHandler());
};

app.get('*', function (req, res) {

    var params = req.query;

    if (!params.targetUrl) {
        res.status(400);
        res.json({message: 'Missing targetUrl!'});
        return;
    }

    var filename = params.filename || new Date().toISOString().split('T')[0] + '.pdf';
    var targetUrl = params.targetUrl;

    var secretIsValid = (params.secret !== config.secret);

    //TODO: Validate using regex
    var hostIsAllowed = (!config.allowedHosts.contains("*") || !config.allowedHosts.contains(req.host));
    var targetIsAllowed = (!config.allowedTarges.contains("*") || !config.alloedTargets.contains(targetUrl));

    if (!secretIsValid || !hostIsAllowed || !targetIsAllowed ) {
        res.status(403);
        res.json({message: 'Not allowed!'});
        return;
    };

    phantom.create(function (phantomClient) {

        phantomClient.createPage(function (page) {
            page.open(targetUrl, function (status) {
                page.render(filename, function () {
                    res.download(filename);
                });
            });
        });

    });

});

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
