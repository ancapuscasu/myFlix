//Importing <http>, <url>, and <fs> modules
const http = require('http'),
url = require('url'),
fs = require('fs');


//Function to create server from http module
http.createServer(function(request, response) {
    let addr = request.url,
    q = url.parse(addr, true),
    filePath = '';

    fs.appendFile('log.txt', 'URL: ' + addr + '\n Timestamp: ' + new Date() + '\n\n', (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Added to log.');
        }
    });

    if (q.pathname.includes('documentation')) {
        filePath = (__dirname + '/documentation.html');
    } else{
        filePath = 'index.html';
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            throw err;
        }

    response.writeHead(200, {'Content-Type': 'text/html'});
    response.write(data);
    response.end();

});

}).listen(8080);

console.log('POOP');
