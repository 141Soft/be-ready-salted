const bcrypt = require("bcryptjs");

function hashPassword (password, rounds) {
    return bcrypt
        .genSalt(rounds)
        .then((salt) => {
            return bcrypt.hash(password, salt)
        })
        .catch((err) => {console.log(err)})
}

module.exports = hashPassword;