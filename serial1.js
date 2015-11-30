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
        A: 0,
        B: 0,
    };

    // Reporters
    ext.sensor = function (which) {
        return getSensor(which);
    };

    // Private logic

    function getSensor(which) {
        return inputs[which];
    }

    var inputArray = [];

    function processData() {
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
            console.log('Device opened: ');
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
        if (device != dev) return;
        device = null;
    };

    ext._shutdown = function () {
        if (device) device.close();
        device = null;
    };

    ext._getStatus = function () {
        if (!device) return {status: 1, msg: 'PicoBoard disconnected'};
        return {status: 2, msg: 'PicoBoard connected'};
    };

    var descriptor = {
        blocks: [
            ['h', 'when %m.booleanSensor',         'whenSensorConnected', 'button pressed'],
            ['b', 'sensor %m.booleanSensor?',      'sensorPressed',       'button pressed'],
            ['r', '%m.sensor sensor value',        'sensor',              'slider']
        ],
        menus: {
            booleanSensor: ['A', 'B'],
            sensor: ['A', 'B'],
            lessMore: ['>', '<']
        },
    };
    ScratchExtensions.register('PicoBoard', descriptor, ext, {type: 'serial'});
})({});
