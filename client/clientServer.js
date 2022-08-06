var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');
var PROTO_PATH = "../resources.proto";

var options = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
};
var packageDefinition = protoLoader.loadSync(PROTO_PATH, options);
var clientService = grpc.loadPackageDefinition(packageDefinition).resources;

function startClientService() {
    var target = '127.0.0.1:8001';

    var client = new clientService.FMSService(target, grpc.credentials.createInsecure());
    module.exports = client;
}

startClientService();
