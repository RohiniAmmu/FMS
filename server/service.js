const sqlite3 = require("sqlite3").verbose();
const constants = require("../constants");
var connectDB = require('./db');
var auth = require('../auth')

function signup(params, success) {
    try {
        var successCallBack = function(message, user_id) {
            var message = { user_id: user_id, email: params.request.email };
            message.status_code = constants.SUCCESS_CODE;
            success(null,message);
        }

        var failureCallBack = function(error) {
            var error_message = {}
            var error = constants.ERROR_CODES.INVALID_REQUEST;
            error_message.error_code = error;
            error_message.error_message = constants.ERROR_CODE_MESSAGE[error];
            
            var message = { error_message : error_message,
                            status_code : constants.FAILURE_CODE
                        }
                        success(null,message)

        }
        var password = auth.getHashedPassword(params.request.password);
        connectDB.signup(params.request.email, params.request.display_name , password, successCallBack , failureCallBack);
    } catch (exception) {
        console.log(exception);
    }

}

function validateUser(params, success) {
    try {
        var successCallBack = function(message) {
            message.password ="";
            message.status_code = constants.SUCCESS_CODE;
            success(null,message);
        }

        var failureCallBack = function(error) {
            var error_message = {}
            var error = constants.ERROR_CODES.INVALID_REQUEST;
            error_message.error_code = error;
            error_message.error_message = constants.ERROR_CODE_MESSAGE[error];
            
            var message = { error_message : error_message,
                            status_code : constants.FAILURE_CODE
                        }
                        success(null,message)

        }
        var password = auth.getHashedPassword(params.request.password);
        connectDB.validateUser(params.request.email,password, successCallBack , failureCallBack);
    } catch (exception) {
        console.log(exception);
        throw exception;
    }

}

function addResource(params, callbackFunction) {
    try {
        var successCallBack = function(response) {
            var message={};
            message.status_code = constants.SUCCESS_CODE;
            message.resource = response;
            callbackFunction(null,message);
        }

        var failureCallBack = function(error) {
            var error_message = {}
            error_message.error_code = error;
            error_message.error_message = constants.ERROR_CODE_MESSAGE[error.toString()];
            
            var message = { error_message : error_message,
                            status_code : constants.FAILURE_CODE
                        }
            callbackFunction(null, message);
        }

        var parent_resource_id = -1;
        if(params.request.parent_resource_id){
            parent_resource_id = params.request.parent_resource_id;
        }else if( params.request.resource_type == constants.RESOURCE_TYPE.FOLDER || !params.request.parent_resource_id){
            parent_resource_id = constants.ROOT_RESOURCE_ID;
        }else{
            return;
        }

        var resource_name = params.request.resource_name;
        var user_id = params.request.user_id;

        if(!resource_name || resource_name==""){
            failureCallBack(constants.ERROR_CODES.RESOURCE_NAME_EMPTY);
            return;
        }

        var checkResourceAndAdd = function(isResourceAvailable){
            if(isResourceAvailable) {
                failureCallBack (constants.ERROR_CODES.ALREADY_EXISTS);
            }else{
                connectDB.addResource(resource_name, params.request.resource_type , parent_resource_id  , params.request.user_id, successCallBack , failureCallBack , params.request.content_type);
            }
        }

        getResourceByName (user_id,resource_name, params.request.resource_type, parent_resource_id ,function(error, resource){
            console.log(error);
            console.log(resource);
            isAvailable = resource && resource.resource_id &&  resource.resource_id !=0; 
            console.log(isAvailable);
            checkResourceAndAdd(isAvailable);
        });
        
        
    } catch (exception) {
        console.log(exception);
    }

}

function getResourceByName(user_id,resource_name, resource_type , parent_resource_id , success) {
    try {
        var successCallBack = function( response) {
            success(null,response);
        }

        var failureCallBack = function(error) {
            var error_message = {}
            if(!error){
                error = constants.ERROR_CODES.INVALID_REQUEST;
            }
            error_message.error_code = error;
            error_message.error_message = constants.ERROR_CODE_MESSAGE[error];
            
            var message = { error_message : error_message,
                            status_code : constants.FAILURE_CODE
                        }
                        success(null,message)

        }
        
        connectDB.getResourceByName(user_id,resource_name, resource_type, parent_resource_id, successCallBack , failureCallBack);
    } catch (exception) {
        console.log(exception);
    }

}

function getResource(params, success) {
    try {
        var successCallBack = function( response) {
            var message={};
            message.status_code = constants.SUCCESS_CODE;
            message.resource = response;
            success(null,message);
        }

        var failureCallBack = function(error) {
            var error_message = {}
            if(!error){
                error = constants.ERROR_CODES.INVALID_REQUEST;
            }
            error_message.error_code = error;
            error_message.error_message = constants.ERROR_CODE_MESSAGE[error];
            
            var message = { error_message : error_message,
                            status_code : constants.FAILURE_CODE
                        }
                        success(null,message)

        }
        
        connectDB.getResource(params.request.user_id,params.request.resource_id, successCallBack , failureCallBack);
    } catch (exception) {
        console.log(exception);
    }

}

function getResources(params, success) {
    try {
        var successCallBack = function( response) {
            var message = {resources : response, parent_resource_id : constants.ROOT_RESOURCE_ID};
            message.status_code = constants.SUCCESS_CODE;
            success(null,message);
        }

        var failureCallBack = function(error) {
            var error_message = {}
            if(!error){
                error = constants.ERROR_CODES.INVALID_REQUEST;
            }
            error_message.error_code = error;
            error_message.error_message = constants.ERROR_CODE_MESSAGE[error];
            
            var message = { error_message : error_message,
                            status_code : constants.FAILURE_CODE
                        }
                        success(null,message)

        }
        
        connectDB.getResources(params.request.user_id, successCallBack , failureCallBack);
    } catch (exception) {
        console.log(exception);
    }

}

function getParentResources(params, success) {
    try {

        var successCallBack = function( response) {
            var message={};
            message.status_code = constants.SUCCESS_CODE;
            message.parent_resource_id = params.request.parent_resource_id;
            message.resources = response;
            success(null,message);
        }

        var failureCallBack = function(error) {
            var error_message = {}
            if(!error){
                error = constants.ERROR_CODES.INVALID_REQUEST;
            }
            error_message.error_code = error;
            error_message.error_message = constants.ERROR_CODE_MESSAGE[error];
            
            var message = { error_message : error_message,
                            status_code : constants.FAILURE_CODE
                        }
                        success(null,message)

        }

        connectDB.getParentResources(params.request.user_id, params.request.parent_resource_id, successCallBack , failureCallBack);
    } catch (exception) {
        console.log(exception);
    }

}

function getFileContent(params, success) {
    try {
        var successCallBack = function( response) {
            response.status_code = constants.SUCCESS_CODE;
            success(null,response.file_details);
        }

        var failureCallBack = function(error) {
            var error_message = {}
            if(!error){
                error = constants.ERROR_CODES.INVALID_REQUEST;
            }
            error_message.error_code = error;
            error_message.error_message = constants.ERROR_CODE_MESSAGE[error];
            
            var message = { error_message : error_message,
                            status_code : constants.FAILURE_CODE
                        }
                        success(null,message)

        }
        
        connectDB.getFileContent({resource_id : params.request.resource_id, user_id : params.request.user_id}, successCallBack , failureCallBack);
    } catch (exception) {
        console.log(exception);
    }

}

function editFileContent(params, success) {
    try {
        var successCallBack = function( response) {
            var message = {}
            message = response.file_details;
            message.status_code = constants.SUCCESS_CODE;
            success(null,message);
        }

        var failureCallBack = function(error) {
            var error_message = {}
            if(!error){
                error = constants.ERROR_CODES.INVALID_REQUEST;
            }
            error_message.error_code = error;
            error_message.error_message = constants.ERROR_CODE_MESSAGE[error];
            
            var message = { error_message : error_message,
                            status_code : constants.FAILURE_CODE
                        }
                        success(null,message)

        }
        
        connectDB.editFileContent( params.request.resource_id, params.request.content, params.request.user_id, successCallBack , failureCallBack);
    } catch (exception) {
        console.log(exception);
    }

}

function trashResource(params, success) {
    try {
        var successCallBack = function( response) {
            var message = {};
            message.status_code = constants.SUCCESS_CODE;
            message.resource = response;
            success(null,message);
        }

        var failureCallBack = function(error) {
            var error_message = {}
            if(!error){
                error = constants.ERROR_CODES.INVALID_REQUEST;
            }
            error_message.error_code = error;
            error_message.error_message = constants.ERROR_CODE_MESSAGE[error];
            
            var message = { error_message : error_message,
                            status_code : constants.FAILURE_CODE
                        }
                        success(null,message)

        }
        
        connectDB.trashResource({ resource_id : params.request.resource_id, user_id : params.request.user_id}, successCallBack , failureCallBack);
    } catch (exception) {
        console.log(exception);
    }

}

function deleteResource(params, success) {
    try {
        var successCallBack = function( response) {
            response.status_code = constants.SUCCESS_CODE;
            success(null,response);
        }

        var failureCallBack = function(error) {
            var error_message = {}
            if(!error){
                error = constants.ERROR_CODES.INVALID_REQUEST;
            }
            error_message.error_code = error;
            error_message.error_message = constants.ERROR_CODE_MESSAGE[error];
            
            var message = { error_message : error_message,
                            status_code : constants.FAILURE_CODE
                        }
                        success(null,message)

        }
        
        connectDB.deleteResource(params.request.resource_id, params.request.user_id, successCallBack , failureCallBack);
    } catch (exception) {
        console.log(exception);
    }

}

function editResourceName(params, success) {
    try {
        var successCallBack = function( response) {
            var message = {}
            message.status_code = constants.SUCCESS_CODE;
            message.resource = response;
            success(null,message);
        }

        var failureCallBack = function(error) {
            var error_message = {}
            if(!error){
                error = constants.ERROR_CODES.INVALID_REQUEST;
            }
            error_message.error_code = error;
            error_message.error_message = constants.ERROR_CODE_MESSAGE[error];
            
            var message = { error_message : error_message,
                            status_code : constants.FAILURE_CODE
                        }
                        success(null,message)

        }

        var parent_resource_id = -1;
        if(params.request.parent_resource_id){
            parent_resource_id = params.request.parent_resource_id;
        }else if( params.request.resource_type == constants.RESOURCE_TYPE.FOLDER){
            parent_resource_id = constants.ROOT_RESOURCE_ID;
        }else{
            return;
        }

        var resource_name = params.request.resource_name;
        var user_id = params.request.user_id;

        if(!resource_name || resource_name==""){
            failureCallBack(constants.ERROR_CODES.RESOURCE_NAME_EMPTY);
            return;
        }

        var checkResourceAndAdd = function(isResourceAvailable){
            if(isResourceAvailable) {
                failureCallBack (constants.ERROR_CODES.ALREADY_EXISTS);
            }else{
                connectDB.editResourceName({ user_id :user_id , resource_id : params.request.resource_id, resource_name : params.request.resource_name, parent_resource_id:parent_resource_id}, successCallBack , failureCallBack);
            }
        }

        getResourceByName (user_id,resource_name, params.request.resource_type, parent_resource_id ,function(error, resource){
            isAvailable = resource && resource.resource_id &&  resource.resource_id !=0; 
            console.log(isAvailable);
            checkResourceAndAdd(isAvailable);
        });

    } catch (exception) {
        console.log(exception);
    }

}

function moveResource(params, success) {
    try {
        var successCallBack = function( response) {
            var message = {};
            message.status_code = constants.SUCCESS_CODE;
            message.resource = response;
            success(null,message);
        }

        var failureCallBack = function(error) {
            var error_message = {}
            error_message.error_code = error;
            error_message.error_message = constants.ERROR_CODE_MESSAGE[error.toString()];
            
            var message = { error_message : error_message,
                            status_code : constants.FAILURE_CODE
                        }
            console.log(error);
            success(null,message);
        }

        var destination_resource_id = params.request.destination_resource_id;
        var resource_id = params.request.resource_id;
        var user_id = params.request.user_id;

        var checkResourceAndAdd = function(isParentResourceSame){
            if(isParentResourceSame) {
                failureCallBack (constants.ERROR_CODES.ALREADY_EXISTS);
            }else{
                connectDB.moveResource(destination_resource_id, resource_id  ,  user_id, successCallBack , failureCallBack);
            }
        }

        connectDB.getResource(user_id,resource_id,function(error, resource){
            var isParentResourceSame = !error && resource && resource.parent_resource_id == destination_resource_id;
            console.log(isParentResourceSame);
            checkResourceAndAdd(isParentResourceSame);
        });
       
    } catch (exception) {
        console.log(exception);
    }

}


var actions = {
    signup                  : signup,
    validateUser            : validateUser,
    addResource             : addResource,
    editResourceName        : editResourceName,
    getResource             : getResource,
    getResources            : getResources,
    getParentResources      : getParentResources,
    getFileContent          : getFileContent,
    editFileContent         : editFileContent,
    trashResource           : trashResource,
    moveResource            : moveResource,
    deleteResource          : deleteResource  
}
module.exports = actions