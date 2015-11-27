(function(ext) {
    // Cleanup function when the extension is unloaded
    ext._shutdown = function() {};

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function() {
        return {status: 2, msg: 'Ready'};
    };

    ext.sum = function(num1,num2) {
	return num1+num2;
    };

    // Block and block menu descriptions
    var descriptor = {
        blocks: [
		['r', '%n ^ %n', 'sum', 2, 3],
        ]
    };

    // Register the extension
    ScratchExtensions.register('Sample extension', descriptor, ext);
})({});
