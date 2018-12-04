/*
 *  Main server for the API app
 *
 */

 //Dependencies
var httpLib = require('http');
var httpsLib = require('https');
var urlLib = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config.js');
var fs = require('fs');

var httpPortNum = config.httpPort;
var httpsPortNum = config.httpsPort;

var environment = config.envName;

 //Instanciating the HTTP server
var httpServer = httpLib.createServer(function(req,res){
  unifiedServer(req,res);
});

//Setting https server httpsServerOptions
var httpsServerOptions = {
  'key' : fs.readFileSync('./https/key.pem'),
  'cert': fs.readFileSync('./https/cert.pem')
};

 //Instanciating the HTTPS server
 var httpsServer = httpsLib.createServer(httpsServerOptions, function(req,res){
   unifiedServer(req,res);
 });


//Server start (listen on port 'portNum' (3030))
httpServer.listen(httpPortNum,function(){
  console.log("The HTTP server is listening on port: "+httpPortNum+" now ("+environment+" mode)");
});

httpsServer.listen(httpsPortNum,function(){
  console.log("The HTTPS server is listening on port: "+httpsPortNum+" now ("+environment+" mode)");
});


// Unified server (http+https) logic / main-function
// Define whwat the server does
var unifiedServer = function(req, res){

    //Get url and parse it
    var parsedUrl = urlLib.parse(req.url, true); //true - also call quiry string module

    //Get the path
    var path = parsedUrl.pathname;//The untrimmed path the user requested
    var trimmedPath = path.replace(/^\/+|\/+$/g,'');

    //Get the query string as an object
    var query = parsedUrl.query; //Get a JSON key-value list

    //Get http method
    var httpMethod = req.method.toLowerCase();

    //Get the http headers as an object
    var httpHeaders = req.headers;

    //Get payload
    var decoder = new StringDecoder('utf-8');
    var buffer  = '';

    //Payload comes as a stream !!!
    req.on('data', function(data){
      buffer += decoder.write(data);
    });

    req.on('end', function(){
      buffer += decoder.end();

      //Choose the handler this request should go to
      //If none is fount use notFound handler
      var chosenHandler = ( typeof(router[trimmedPath]) !== 'undefined' ) ? router[trimmedPath] : handlers.notFound;

      //Construct data object to send to the handlers
      var data = {
        'trimmedPath' : trimmedPath,
        'query'       : query,
        'method'      : httpMethod,
        'headers'     : httpHeaders,
        'Payload'     : buffer
      };

      //Route the request to the handler specified in the router
      chosenHandler(data, function(statusCode,payload){
        //Use the status code given or use 200 as default
        statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

        //Use the payload given by the user, or use an empty object
        payload = typeof(payload) == 'object' ? payload : {};

        //Convert payload to string
        var payloadString = JSON.stringify(payload);

        //Send user that the content type is JSON
        res.setHeader('Content-Type',"application/json");
        //Send statusCode to user
        res.writeHead(statusCode);

        //Send user payload - Perform on the end event
        res.end(payloadString);

        //Send the proper response
        res.end('Hello Yo..\n'+req.statusCode+"\nReq method: "+req.method+"\nHeaders:\n" + req.rawHeaders+'\n');

        //Log what path the user was asting for
        console.log('Request receives on path: '+trimmedPath + ' with method: ' + httpMethod + ' with query: ',query);
        console.log('\nReturning this respond: ', statusCode, payloadString);

      });
    });
};


//Define the handlers
var handlers = {};

//Sample handler
handlers.hello = function(data, callback){
    //Callback http status-code and  payload (an object)
    callback(200, {'message' : 'Hi world..'});
};

//Handler for ping
handlers.ping = function(data, callback){
    //Callback http status-code and  payload (an object)
    callback(200);
};


//Define not found handlers
handlers.notFound = function(data, callback){
  callback(404);
};


//Define a request router
var router = {
  'hello' : handlers.hello,
  'ping' : handlers.ping,
};
