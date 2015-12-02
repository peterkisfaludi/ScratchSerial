// picoExtension.js
// Shane M. Clements, February 2014
// PicoBoard Scratch Extension
//
// This is an extension for development and testing of the Scratch Javascript Extension API.

////////////////////////////////////////////
//scratch extension
(function (ext) {

////////////////////////////////////////////
//WebSocket client
console.log('hello from scratchx extension');
if ('WebSocket' in window){
    console.log('websockets are supported, go ahead');
} else {
    console.log('bad news, websockets are not supported');
}

var ws = new WebSocket("ws://localhost:9999/");
ws.onopen = function() {
    console.log('web socket client opened');
};

ws.onmessage = function(e){
   var server_message = e.data;
   console.log(server_message);
   ext.onserial(server_message);
};
//////////////////////////////////




    var device = null;
    var serialReceived = false;

    // Sensor states:
    var channels = {
        A: 0,
        B: 1,
    };
    var inputs = {
        A: 500,
        B: 600,
    };

    // Reporters
    ext.sensor = function (which) {
        console.log('ext.sensor called with ' + which);
        return getSensor(which);
    };
    
    ext.SR = function() {
        var ret = serialReceived;
        return ret;
    };

    // Private logic
    function getSensor(which) {
        console.log('get sensor called with ' + which);
        return inputs[which];
    }
    
    ext.onserial = function (raw) {
        console.log('extension received: '+raw);
    }

    var inputArray = [];

    ext._shutdown = function () {};

    ext._getStatus = function () {
        return {status: 2, msg: 'Ready'};
    };

    var descriptor = {
        blocks: [
            ['r', '%m.sensor value',        'sensor',              'A']
//            ['r', 'Serial Received',        'SR',                     ]
        ],
        menus: {
            sensor: ['A', 'B'],
        },
    };
    ScratchExtensions.register('Serial1', descriptor, ext);
})({});
