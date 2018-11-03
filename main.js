/* jshint -W097 */// jshint strict:false
/*jslint node: true */
'use strict';

const utils =    require(__dirname + '/lib/utils'); // Get common adapter utils
const request = require('request');
const adapter = new utils.Adapter('tronwallets');

var result;
var err;
var host  = '';
var plug;
var ip;
var timer     = null;
var stopTimer = null;
var isStopping = false;


// is called when adapter shuts down - callback has to be called under any circumstances!
adapter.on('unload', function () {

});

// is called if a subscribed object changes
adapter.on('objectChange', function (id, obj) {
    // Warning, obj can be null if it was deleted
    adapter.log.info('objectChange ' + id + ' ' + JSON.stringify(obj));
});

// is called if a subscribed state changes
adapter.on('stateChange', function (id, state) {
    // Warning, state can be null if it was deleted
    adapter.log.info('stateChange ' + id + ' ' + JSON.stringify(state));

    // you can use the ack flag to detect if it is status (true) or command (false)
    if (state && !state.ack) {
        adapter.log.info('ack is not set!');
    }
});

// Some message was sent to adapter instance over message box. Used by email, pushover, text2speech, ...
adapter.on('message', function (obj) {
    if (typeof obj === 'object' && obj.message) {
        if (obj.command === 'send') {
            // e.g. send email or pushover or whatever
            console.log('send command');

            // Send response in callback if required
            if (obj.callback) adapter.sendTo(obj.from, obj.command, 'Message received', obj.callback);
        }
    }

});

// is called when databases are connected and adapter received configuration.
// start here!
adapter.on('ready', function () {
        main();
});


function main() {
    var request = require('request');
    var werte;
    var url = 'https://api.trxplorer.io/v1/account/info?address=';
    for (var u = 0; u < adapter.config.devices.length; u++) {
        //adapter.log.info(adapter.config.devices[u].name);
        const name = adapter.config.devices[u].name
        const ip = adapter.config.devices[u].ip
        adapter.createState(null, name, 'balance', 'value');
        adapter.createState(null, name, 'freezed', 'value');
        request(url + ip, function (err, stat, body) {
            werte = JSON.parse(body);


        adapter.log.info(werte.balance);
    });


    };
}




