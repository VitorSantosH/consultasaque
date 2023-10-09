const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const http = require('http');
const https = require('https');
const app = express();
const fgtsRote = require('./src/rotes/fgtsRote');
const { routesUsers } = require('./src/rotes/newUser');


var certificade
try {
    certificade = {
        key: fs.readFileSync("/etc/letsencrypt/live/consultasaque.com.br/privkey.pem", 'utf8'),
        cert: fs.readFileSync("/etc/letsencrypt/live/consultasaque.com.br/fullchain.pem", 'utf8')
    };

} catch (error) {
    console.log(error)
}


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('common'));
app.use('/user', routesUsers);
app.use('/fgts', fgtsRote);
app.use('/fgts', express.static("dist"));
app.use('/home', express.static("dist"));
app.use('/manage/users', express.static("dist"));
app.use('/', express.static("dist"));


const portHttp = 8009;
const portHttpS = 8003;
const httpsServer = https.createServer(certificade, app);
const httpServer = http.createServer(app);


httpServer.listen(portHttp, function () {
    console.log("JSON Server is running on " + portHttp);
});

try {
    httpsServer.listen(portHttpS, function () {
        console.log('Second site is running on port ' + portHttpS);
    });
} catch (error) {
    console.log(error)
}


/**
 * 
Certificate is saved at: /etc/letsencrypt/live/consultasaque.com.br/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/consultasaque.com.br/privkey.pem
 */
