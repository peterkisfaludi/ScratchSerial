(function(ext) {
    var device = null;
    var rawData = null;
    
    var inputArray = [];
    
    ext.sensor = function() {
        console.log('Device opened');
    };
    
    function processData() {
        var bytes = new Uint8Array(rawData);
        inputArray[10] = 0;
        
        //TODO: A###B###/r/n
        if(inputArray[0] == 'A' && inputArray[4]=='B'){
        
        }
        rawData=null;
    }
    
    function appendBuffer(buffer1, buffer2) {
        var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
        tmp.set(new Uint8Array(buffer1), 0);
        tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
        return tmp.buffer;
    }
    
    // Extension API interactions
    var potentialDevices = [];
    ext._deviceConnected = function (dev) {
        potentialDevices.push(dev);

        if (!device) {
            tryNextDevice();
        }
    };
    
    function tryNextDevice() {
        // If potentialDevices is empty, device will be undefined.
        // That will get us back here next time a device is connected.
        device = potentialDevices.shift();

        if (device) {
            device.open({stopBits: 0, bitRate: 115200, ctsFlowControl: 0}, deviceOpened);
        }
    }
    
    function deviceOpened(dev) {
        if (!dev) {
            // Opening the port failed.
            tryNextDevice();
            return;
        }
        device.set_receive_handler(function (data) {
            if (!rawData || rawData.byteLength == 10) {
                rawData = new Uint8Array(data);
            } else {
                rawData = appendBuffer(rawData, data);
            }

            if (rawData.byteLength >= 10) {
                processData();
            }
        });
    }
        
    ext._deviceRemoved = function (dev) {
        if (device != dev) return;
        if (poller) poller = clearInterval(poller);
        device = null;
    };    

    // Cleanup function when the extension is unloaded
    ext._shutdown = function() {
        if (device) device.close();
        device = null;
    };

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function() {
        if (!device) return {status: 1, msg: 'Device disconnected'};
        return {status: 2, msg: 'Ready'};
    };

    // Block and block menu descriptions
    var descriptor = {
        blocks: [
		['r', '%m sensor value', 'sensor'],
        ]
    };

    // Register the extension
    ScratchExtensions.register('SerialExtension', descriptor, ext, {type: 'serial'});
})({});
