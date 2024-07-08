const bcrypt = require("bcryptjs");

function validatePassword (password, hash) {
    return bcrypt
        .compare(password, hash)
        .then(result => {
            return result;
        })
        .catch((err) => {console.log(err)})
}

module.exports = validatePassword;