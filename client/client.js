const client = require('./clientServer')
const express = require('express');
const constants = require('../constants');
const { response } = require('express');
const { ERROR_CODES } = require('../constants');
const auth = require('../auth');
const app = express();
const port = 8000
app.use(express.json());
const authTokens = {};
const CookieParser = require('cookie-parser');

app.use(CookieParser());

app.use(function (request, response, next) {
    console.log(request.url );
    if(request.url == "/signup" || request.url== "/login"){
        next();
    }else{
        if(isUserValid(request)){
            next();
        }else{
            var error_message = {}
            var error = constants.ERROR_CODES.INVALID_USER
            error_message.error_code = error;
            error_message.error_message = constants.ERROR_CODE_MESSAGE[error];
            
            var message = { error_message : error_message,
                            status_code : constants.FAILURE_CODE
                        }
            response.send(message)
        }
    }
    
});

var isUserValid = function (request) {
    var user_id = request.body.user_id;
    if(request.cookies){
        var authToken = request.cookies['AuthToken'];
        if(authTokens && authToken){
            if(user_id == authTokens[authToken]){
                return true;
            }
        }
    }
    return false;
}
    

app.get('/', (request, response)=> {
    console.log("started");
    response.sendFile(__dirname +  '/user.html')
});

app.post('/signup', (request, response) => {
    client.signup({ email: request.body.email , password: request.body.password , display_name : request.body.display_name}, function(error, message) {
        if(error){
            console.log(error);
        }
        response.send(message);
    });
});

app.get('/login', (request, response) => {
    client.validateUser({ email: request.body.email, password: request.body.password }, function(error,message) {
        if(message.status_code == constants.SUCCESS_CODE){
            var authToken = auth.generateAuthToken();
            authTokens[authToken]=message.user_id;
            response.cookie('AuthToken', authToken);
        }
        response.send(message);
    });
});

app.get('/logout', (request, response) => {
    if(request.cookies ){
        var authToken = request.cookies['AuthToken'];
        if(authTokens && authTokens[authToken]){
            authTokens[authToken] = "";
        }
    }
    response.send("Success");
});

app.post('/folder', (request, response) => {
    client.addResource({user_id:  request.body.user_id ,resource_name: request.body.resource_name , resource_type : constants.RESOURCE_TYPE.FOLDER , content_type : ""}, function(error,message) {
        response.send(message);
    })
});

app.put('/resource/:resource_id', (request, response) => {
    client.editResourceName({ user_id:  request.body.user_id, resource_id : request.params.resource_id, resource_name : request.body.resource_name, parent_resource_id : request.body.parent_resource_id, resource_type : request.body.resource_type  }, function(error, message) {
        response.send(message);
    });
})

app.get('/resource/:resource_id', (request, response) => {
    var resource_id = request.params.resource_id
    client.getResource({ user_id:  request.body.user_id, resource_id: resource_id  }, function(error, message) {
        response.send(message);
    });
});

app.get('/resource', (request, response) => {
    client.getResources({  user_id: request.body.user_id  }, function(error, message) {
        response.send(message);
    });
})

app.get('/resource/:parent_resource_id', (request, response) => {
    client.getParentResources({  user_id: request.body.user_id, parent_resource_id : request.params.parent_resource_id  }, function(error, message) {
        response.send(message);
    });
});

app.delete('/resource/:resource_id/trash', (request, response) => {
    client.trashResource({ resource_id : request.params.resource_id, user_id:  request.body.user_id  }, function(error, message) {
        response.send(message);
    });
})

app.delete('/resource/:resource_id', (request, response) => {
    client.deleteResource({ user_id:  request.body.user_id,resource_id : request.params.resource_id  }, function(error, message) {
        response.send(message);
    });
})

app.post('/file', (request, response) => {
    client.addResource({ user_id:  request.body.user_id,resource_name: request.body.resource_name, user_id: request.body.user_id , resource_type : constants.RESOURCE_TYPE.FILE , parent_resource_id :request.body.parent_resource_id  ,content_type : request.body.content_type }, function(error, message) {
        response.send(message);
    });
});

app.get('/file/:resource_id', (request, response) => {
    client.getFileContent({  user_id:  request.body.user_id,resource_id : request.params.resource_id  }, function(error, message) {
        response.send(message);
    });
})

app.put('/file/:resource_id', (request, response) => {
    client.editFileContent({ user_id:  request.body.user_id, resource_id : request.params.resource_id, content : request.body.content  }, function(error, message) {
        response.send(message);
    });
})

app.put('/file/:source_resource_id/move/:destination_resource_id', (request, response) => {
    client.moveResource({  user_id:  request.body.user_id,source_resource_id : request.params.source_resource_id, destination_resource_id : request.params.destination_resource_id , resource_id: request.body.resource_id}, function(error, message) {
        response.send(message);
    });
})

app.listen(port, () => {
    console.log("PORT::::"+port);
});