const sqlite3 = require("sqlite3").verbose();
const e = require("express");
const constants = require('../constants');
var database = {};
function main(){
}
function db(callbackFunction) {
    if (!database.db) {
        var db = new sqlite3.Database('../fms.db', () => {
            database.db = db;
            callbackFunction(db);
        });
    } else {
        callbackFunction(database.db);
    }
}

function addUser(email, display_name, password, sucess, failure) {
    try {
        db(function(db) {
            var adduserQueryString = 'INSERT into USER_DETAILS(EMAIL, DISPLAY_NAME, PASSWORD) VALUES(?,?,?)';
            db.run(adduserQueryString, [email,display_name, password], function(error) {
                if (error) {
                    failure(error);
                }else{
                    var user_id = this.lastID;
                    addResource(constants.ROOT_RESOURCE_NAME, constants.RESOURCE_TYPE.ROOT, -1 ,user_id, sucess, failure, "")
                }
            })
        });
    } catch (exception) {
        console.log(exception);
        throw exception;
    }
}

function addResource(resource_name, resource_type, parent_resource_id ,user_id, sucess, failure, content_type) {
    try {
        db(function(db) {
            var addResourceQueryString = 'INSERT INTO RESOURCE_DETAILS(RESOURCE_NAME,RESOURCE_TYPE,PARENT_RESOURCE_ID,USER_ID) VALUES(?,?,?,?)';
            db.run(addResourceQueryString, [resource_name, resource_type, parent_resource_id, user_id], function(error) {
                if (error) {
                    failure(error);
                }else{
                    var resource_id = this.lastID;
                    if(resource_type == constants.RESOURCE_TYPE.FILE){
                        createFile(user_id ,resource_id, content_type, function(resource_id){
                            getResource(user_id,resource_id,sucess,failure);
                        }, failure)
                    }else{
                        getResource(user_id,resource_id, sucess, failure);
                    }
                }
            })
        });
    } catch (exception) {
        console.log(exception);
        throw exception;
    }
}

function createFile(user_id ,resource_id, content_type, sucess, failure){
    try {
        db(function(db) {
            var addFileQueryString = 'INSERT INTO FILE_DETAILS(RESOURCE_ID, USER_ID, CONTENT_TYPE, CONTENT) VALUES(?,?,?,?)';
            db.run(addFileQueryString, [resource_id, user_id, content_type, ""], function (error) {
                if (error) {
                    console.log(error);
                    failure(error);
                    throw error;
                }else{
                    sucess(resource_id)
                }
            })
        });
    } catch (exception) {
        console.log(exception);
        throw exception;
    }
}

function getResource(user_id,resource_id, sucess, failure) {
    try {
        db(function(db) {
            db.get('SELECT * FROM RESOURCE_DETAILS WHERE RESOURCE_ID=? and USER_ID=?', [resource_id,user_id],function (error, data){
                if (error) {
                    failure(error);
                    throw error;
                }
                if (data) {
                    if(data.resource_type == constants.RESOURCE_TYPE.FILE){
                        getFileContent(data, sucess, failure);
                    }else{
                        sucess(data, user_id);
                    }
                }
            })
        });
    } catch (exception) {
        console.log(exception);
        throw exception;
    }
}

function getResourceByName(user_id,resource_name , resource_type, parent_resource_id , sucess, failure) {
    try {
        db(function(db) {
            db.get('SELECT * FROM RESOURCE_DETAILS WHERE RESOURCE_NAME=? and RESOURCE_TYPE=? and PARENT_RESOURCE_ID=? and USER_ID=?', [resource_name, resource_type, parent_resource_id,user_id],function (error, data){
                if (error) {
                    failure(error);
                    throw error;
                }
                sucess(data);
            })
        });
    } catch (exception) {
        console.log(exception);
        throw exception;
    }
}

function validateUser(email, password, sucess, failure) {
    try {
        db(function(db) {
            db.get('SELECT * FROM USER_DETAILS where EMAIL=? and PASSWORD=?', [email, password], function (error, data) {
                if (error) {
                    failure(error);
                    throw error;
                }
                if (data) {
                    sucess(data);
                }
            })
        });
    } catch (exception) {
        console.log(exception);
        throw exception;
    }
}



function getResources(user_id,success,failure) {
    try {
        db(function(db) {
            db.all('SELECT * from RESOURCE_DETAILS WHERE USER_ID=? and ACTIVE_STATUS=?', [user_id, constants.ACTIVE_STATUS.active], function (error, data) {
                if (error) {
                    failure(error)
                    throw error;
                }
                success(data);
            });
        });
    } catch (exception) {
        console.log(exception);
        throw exception;
    }
}

function getParentResources(user_id, parent_resource_id , success, failure) {
    try {
        db(function(db) {
            db.all('SELECT * from RESOURCE_DETAILS WHERE USER_ID=? and PARENT_RESOURCE_ID=? and ACTIVE_STATUS=?', [user_id, parent_resource_id, constants.ACTIVE_STATUS.active], function (error, data) {
                if (error) {
                    failure(error)
                    throw error;
                }
                success(data);
            });
        });
    } catch (exception) {
        console.log(exception);
        throw exception;
    }
}

function editFileContent(resource_id, content, user_id, success, failure) {
    try {
        db(function(db) {
            var fileIdQueryString = 'UPDATE FILE_DETAILS SET CONTENT=? where RESOURCE_ID=? and USER_ID=?;'
            db.run(fileIdQueryString, [content, resource_id, user_id], function (error) {
                if (error) {
                    failure(error);
                    throw error;
                }else{
                    getFileContent({resource_id : resource_id , user_id : user_id},success,failure );
                }
            })
        });
    } catch (exception) {
        console.log(exception);
        throw exception;
    }
}

function editResourceName(params, success, failure) {
    try {
        db(function(db) {
            var editResourceQueryString = 'UPDATE RESOURCE_DETAILS SET RESOURCE_NAME=? where RESOURCE_ID=? and USER_ID=? and PARENT_RESOURCE_ID=?;'
            db.run(editResourceQueryString, [params.resource_name ,params.resource_id , params.user_id, params.parent_resource_id], function (error) {
                if (error) {
                    failure && failure(error);
                    throw error;
                }else{
                    getResource(params.user_id,params.resource_id, success, failure);
                }
            })
        });
    } catch (exception) {
        console.log(exception);
        throw exception;
    }
}

function getFileContent(data , success, failure) {
    try {
        db(function(db) {
            db.get('SELECT * from FILE_DETAILS WHERE RESOURCE_ID=? and USER_ID=?', [data.resource_id, data.user_id], function (error, fileData) {
                if (error) {
                    failure(error)
                    throw error;
                }
                if(data && fileData){
                    data.file_details = fileData;
                    success(data);
                }
            });
        });
    } catch (exception) {
        console.log(exception);
        throw exception;
    }
}

function trashResource(params, success, failure) {
    try {
        db(function(db) {
            var editResourceQueryString = 'UPDATE RESOURCE_DETAILS SET ACTIVE_STATUS=? where RESOURCE_ID=? or PARENT_RESOURCE_ID=? and USER_ID=?;'
            db.run(editResourceQueryString, [constants.ACTIVE_STATUS.inactive ,params.resource_id, params.resource_id, params.user_id], function (error) {
                if (error) {
                    failure && failure(error);
                    throw error;
                }else{
                    getResource(params.user_id,params.resource_id, success, failure);
                }
            })
        });
    } catch (exception) {
        console.log(exception);
        throw exception;
    }
}

function moveResource(parent_resource_id, resource_id,user_id, success, failure) {
    try {
        db(function(db) {
            var editResourceQueryString = 'UPDATE RESOURCE_DETAILS SET PARENT_RESOURCE_ID=? where RESOURCE_ID=? and USER_ID=?'; 
            db.run(editResourceQueryString, [parent_resource_id,resource_id, user_id], function (error) {
                if (error) {
                    failure && failure(error);
                    throw error;
                }else{
                    getResource(user_id,resource_id, success, failure);
                }
            })
        });
    } catch (exception) {
        console.log(exception);
        throw exception;
    }
}

function deleteResource(resource_id , user_id, success, failure) {
    try {
        db(function(db) {
            db.run('DELETE from RESOURCE_DETAILS WHERE RESOURCE_ID=? or PARENT_RESOURCE_ID = ? and USER_ID=?', [resource_id, resource_id, user_id], function (error)  {
                if (error) {
                    failure(error)
                    throw error;
                }
                success(true);
            });
        });
    } catch (exception) {
        console.log(exception);
        throw exception;
    }
}

var dbOperations = {
    signup                  : addUser,
    validateUser            : validateUser,
    addResource             : addResource,
    getResource             : getResource,
    getResources            : getResources ,
    getResourceByName       : getResourceByName,
    getParentResources      : getParentResources,
    editFileContent         : editFileContent,
    editResourceName        : editResourceName,
    getFileContent          : getFileContent,
    trashResource           : trashResource,
    moveResource            : moveResource,
    deleteResource          : deleteResource,    
}

main()
module.exports = dbOperations; 