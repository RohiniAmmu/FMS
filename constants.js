
var ACTIVE_STATUS = {
    inactive : 0,
    active : 1
}

var CONTENT_TYPE = {
    text : "text"
}

var RESOURCE_TYPE = {
    ROOT: 0,
    FOLDER: 1,
    FILE: 2
}

var ERROR_CODES = {
    INVALID_RESOURCE_NAME : "1000",
    RESOURCE_NAME_EMPTY : "1001",
    INVALID_USER : "1002",
    ALREADY_EXISTS : "1003",
    SAME_PARENT_ID : "1004",
    INVALID_REQUEST : "1005"
}

var ERROR_CODE_MESSAGE = {
    "1000" : "Invalid Resource name kindly provide valid one",
    "1001" : "Resource name can't be empty",
    "1002" : "Invalid User",
    "1003" : "Resource name already Exists. Kindly provide new one",
    "1004" : "Can't move the file to the same folder",
    "1005" : "Invalid Request"
}

var ROOT_RESOURCE_ID = 1;
var ROOT_RESOURCE_NAME = "root";
var SUCCESS_CODE = 200;
var FAILURE_CODE = 400;

module.exports = {
    ACTIVE_STATUS       : ACTIVE_STATUS,
    CONTENT_TYPE        : CONTENT_TYPE,
    RESOURCE_TYPE       : RESOURCE_TYPE,
    ROOT_RESOURCE_ID    : ROOT_RESOURCE_ID,
    ROOT_RESOURCE_NAME  : ROOT_RESOURCE_NAME,
    ERROR_CODES         : ERROR_CODES,
    ERROR_CODE_MESSAGE  : ERROR_CODE_MESSAGE,
    SUCCESS_CODE        : SUCCESS_CODE,
    FAILURE_CODE        : FAILURE_CODE
}