const crypto = require('crypto');

function getHashedPassword (password) {
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    return hash;
}
function generateAuthToken () {
    return crypto.randomBytes(30).toString('hex');
}
var functions = {
    getHashedPassword : getHashedPassword,
    generateAuthToken  : generateAuthToken 
}

module.exports = functions; 