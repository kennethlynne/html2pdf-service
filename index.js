var express = require('express'),
    http = require('http'),
    path = require('path'),
    //phantom = require('phantom'),
    config = require('./config.json');

var app = module.exports = express();

app.set('port', process.env.PORT || 80);
app.use(express.logger('dev'));
app.use(express.methodOverride());
app.use(app.router);

if (app.get('env') === 'development') {
    app.use(express.errorHandler());
}

app.get('/download', function (req, res) {

    var params = req.query;

    if (!params.targetUrl) {
        res.status(400);
        res.json({message: 'Missing targetUrl!'});
        return;
    }
    
    var secretIsValid = (params.secret == config.secret);
    var hostIsAllowed = (config.allowedHosts.indexOf("*") >= 0 || config.allowedHosts.indexOf(req.host) >= 0); //TODO: Validate using regex
    var targetIsAllowed = (config.allowedTargets.indexOf("*") >= 0 || config.allowedTargets.indexOf(params.targetUrl) >= 0); //TODO: Validate using regex

    if (!secretIsValid || !hostIsAllowed || !targetIsAllowed ) {
        res.status(403);
        res.json({message: 'Not allowed!'});
        return;
    }

    var filename = params.filename || new Date().toISOString().split('T')[0] + '.pdf';
    var targetUrl = params.targetUrl;

    console.log('Creating PDF ' + filename + ' from ' + targetUrl);
    phantom.create(function (phantomClient) {

        phantomClient.createPage(function (page) {
            page.open(targetUrl, function (status) {
                page.render('temp/' + filename, function () {
                    res.sendfile('temp/' + filename);
                });
            });
        });

    });

});

app.get('*', function(req, res){
    res.send('Not found', 404);
});

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

app.use(function(err, req, res, next){
    console.log(err, req);
    res.send(500)
});
