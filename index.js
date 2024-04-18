/*
Title: Uptime Monitoring Application
Description: A RESTFul API to monitor up or down time of user defined links
Author: Samiul Karim Prodhan
Date: 22.01.2024
*/

// dependencies
// for making a server we need http module

const http = require('http');
const { handleReqRes } = require('./helpers/handleReqRes');
const environment = require('./helpers/environment');
const data = require('./lib/data');

// app object - module scaffolding
const app = {};

// testing file system
// data.create('test', 'newFile', { name: 'Bangladesh', language: 'Bangla' }, (err) => {
//     console.log('Error was', err);
// });
// data.read('test', 'newFile', (err, data) => {
//     console.log(err, data);
// });
// data.update('test', 'newFile', { name: 'England', language: 'English' }, (err) => {
//     console.log('Error was', err);
// });
// data.delete('test', 'newFile', (err) => {
//     console.log('Error was', err);
// });
// create server

app.createServer = () => {
    const server = http.createServer(app.handleReqRes);
    server.listen(environment.port, () => {
        console.log(`Listening to port ${environment.port}`);
    });
};

// handle request response
app.handleReqRes = handleReqRes;

// start the server
app.createServer();
