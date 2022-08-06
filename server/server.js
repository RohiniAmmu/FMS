const grpc = require("@grpc/grpc-js");
const PROTO_PATH = "../resources.proto";
const express = require('express');
var protoLoader = require("@grpc/proto-loader");
const sqlite3 = require("sqlite3").verbose();
var service = require('./service');

const options = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
};

var packageDefinition = protoLoader.loadSync(PROTO_PATH, options);
const server = new grpc.Server();
var serverService = grpc.loadPackageDefinition(packageDefinition).resources;

function startServerService() {
    server.addService(serverService.FMSService.service, service);
    server.bindAsync(
        "127.0.0.1:8001",
        grpc.ServerCredentials.createInsecure(),(error, port) => {
            console.log("Server running 8001");
            server.start();
        }
    );
}
  

  
function createDataBase() {
    try{
        const db = new sqlite3.Database('../fms.db', (err) => {
            console.log('DataBase Connected');
            callbackFunction(db);
        });
        var callbackFunction = function(db) {
            db.serialize(() => {
                db.run('PRAGMA foreign_keys = ON');
                db.run('CREATE TABLE IF NOT EXISTS USER_DETAILS(user_id integer PRIMARY KEY AUTOINCREMENT, email text UNIQUE, password text, display_name text)', error => {
                    if (error) {
                        console.log(error);
                    }
                });
                db.run('CREATE TABLE IF NOT EXISTS RESOURCE_DETAILS(resource_id integer PRIMARY KEY AUTOINCREMENT,resource_name text NOT NULL,resource_type integer,parent_resource_id integer, user_id integer NOT NULL, active_status integer DEFAULT 1, FOREIGN KEY (user_id) REFERENCES USER_DETAILS (user_id) ON DELETE CASCADE)', error => {
                    if (error) {
                        console.log(error);
                    }
                });
                db.run('CREATE TABLE IF NOT EXISTS FILE_DETAILS(file_id integer PRIMARY KEY AUTOINCREMENT, resource_id integer, content text, content_type blob, user_id integer NOT NULL, FOREIGN KEY (resource_id) REFERENCES RESOURCE_DETAILS (resource_id) ON DELETE CASCADE, FOREIGN KEY (user_id) REFERENCES USER_DETAILS (user_id) ON DELETE CASCADE)', error => {
                    if (error) {
                        console.log(error);
                    }
                });
            });
            db.close();
            console.log("database created");
        }
    } catch(exception){
        console.log(exception);
        throw exception;
    }
}
startServerService();
createDataBase();