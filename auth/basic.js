const passport = require('passport'),
    BasicStrategy = require('passport-http').BasicStrategy,
    crypto = require('crypto');

const DBClient = require('../api/lib/DBClient');
const dbInstance = new DBClient('admins');

function BasicAuth () {}

passport.use(new BasicStrategy(
    (username, password, done) => {
        password = crypto.createHash('md5').update(password).digest('hex');
        dbInstance.search({
            selector: {
                user: username
            }
        })
            .then((resp) => {
                if (resp.docs.length === 1) {
                    if (resp.docs[0].password !== password) return done(null, false);
                    return done(null, true);
                }
                return done(null, false);
            })
            .catch((err) => {
                return done(err);
            })
    }
));

BasicAuth.prototype.basic = function () {
    return passport.authenticate('basic', { session: false });
}

module.exports = BasicAuth;