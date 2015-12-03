// serial.js
// Peter Kisfaludi
// Serial Scratch Extension
//

(function (ext) {

    ////////////////////////////////////////////
    //WebSocket client
    console.log('hello from scratchx extension');
    if ('WebSocket' in window){
        console.log('websockets are supported, go ahead');
    } else {
        console.log('bad news, websockets are not supported');
    }

    //open websocket
    var ws = new WebSocket("ws://localhost:9999/");
    ws.onopen = function() {
        console.log('web socket client opened');
    };

    ws.onmessage = function(e){
       var server_message = e.data;
       console.log(server_message);
       // send message to scratchX extension
       ext.onserial(server_message);
    };
    // End websockets ////////////////////////////////

    var device = null;
    var serialReceived = false;

    // Sensor states:
    var channels = {
        A: 0,
        B: 1,
    };
    var inputs = {
        A: 111,
        B: 555,
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
        serialReceived = true;
        //TODO timeout for SR->clear flag after 1 sec
        //TODO parse array
        //message format:
        //99X####Y####
        
        if(raw[0]!=9 || raw[1]!=9 || raw[2]!=X || raw[7]!=Y || str.length!=12){
            console.log('invalid package');
            return;
        }
        
        var x=parseInt(raw.substr(3,4));
        var y=parseInt(raw.substr(8,4));
        
        if(isNaN(x) || isNaN(y) || x<0 || y<0){
            console.log('invalid package');
            return;
        }
        
        console.log('X= ' + x + 'Y= ' + y);
        
        
    }

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
