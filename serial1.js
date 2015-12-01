// picoExtension.js
// Shane M. Clements, February 2014
// PicoBoard Scratch Extension
//
// This is an extension for development and testing of the Scratch Javascript Extension API.



(function (ext) {
    var device = null;
    var rawData = null;

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

    // Private logic

    function getSensor(which) {
        console.log('get sensor called with ' + which);
        return inputs[which];
    }

    var inputArray = [];

    function processData() {
        console.log('processing data');
        var bytes = new Uint8Array(rawData);

        inputArray[15] = 0;

        for (var name in inputs) {
            var v = inputArray[channels[name]];
            if (name == 'A') {
                v=100;
            }
            else if (name == 'B') {
                v=200;
            }
            else {
                v = 300;
            }

            inputs[name] = v;
        }

        rawData = null;
    }

    function appendBuffer(buffer1, buffer2) {
        console.log('append buffer called');
        var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
        tmp.set(new Uint8Array(buffer1), 0);
        tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
        return tmp.buffer;
    }

    // Extension API interactions
    var potentialDevices = [];
    ext._deviceConnected = function (dev) {
        console.log('_deviceConnected called' + dev);
        potentialDevices.push(dev);

        if (!device) {
            tryNextDevice();
        }
    };

    function tryNextDevice() {
        // If potentialDevices is empty, device will be undefined.
        // That will get us back here next time a device is connected.
        device = potentialDevices.shift();
        console.log('tryNext called, device is ' + device);

        if (device) {
            console.log('serial port opened');
            device.open({stopBits: 0, bitRate: 115200, ctsFlowControl: 0}, deviceOpened);
        }
    }

    function deviceOpened(dev) {
        console.log('DeviceOpened' + dev);
        if (!dev) {
            // Opening the port failed.
            tryNextDevice();
            return;
        }
        device.set_receive_handler(function (data) {
            console.log('Received: ' + data.byteLength);
            if (!rawData || rawData.byteLength == 18) {
                rawData = new Uint8Array(data);
            } else {
                rawData = appendBuffer(rawData, data);
            }

            if (rawData.byteLength >= 18) {
                console.log(rawData);
                processData();
            }
        });
    }

    ext._deviceRemoved = function (dev) {
        console.log('_deviceRemoved');
        if (device != dev) return;
        device = null;
    };

    ext._shutdown = function () {
        if (device) device.close();
        device = null;
    };

    ext._getStatus = function () {
        console.log('getStatus called');
        if (!device) {
            console.log('status = 1');
            return {status: 1, msg: 'PicoBoard disconnected'};
        }
        console.log('status = 2');
        return {status: 2, msg: 'PicoBoard connected'};
    };

    var descriptor = {
        blocks: [
            ['r', '%m.sensor sensor value',        'sensor',              'A']
        ],
        menus: {
            sensor: ['A', 'B'],
        },
    };
    ScratchExtensions.register('Serial1', descriptor, ext, {type: 'serial'});
})({});
