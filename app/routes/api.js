var User = require('../models/user');
var Story = require('../models/story');
var config = require('../../config');
var secretKey = config.secretKey;
var jsonwebtoken = require('jsonwebtoken');

function createToken(user) {
    return jsonwebtoken.sign({
        id: user._id,
        name: user.name,
        username: user.username
    }, secretKey, {
        expiresInMinute: 1440
    });
}

module.exports = function(app, express) {
    var api = express.Router();

    api.post('/signup', function(req, res) {
        var user = new User({
            name: req.body.name,
            username: req.body.username,
            password: req.body.password
        });

        user.save(function(err) {
            if (err) {
                res.send(err);
                return;
            } else {
                res.json({msg: 'Success'});
            }
        })
    });

    api.get('/users', function(req, res) {
        User.find({}, function(err, users) {
            if (err) {
                res.send(err);
                return;
            } else {
                res.json(users);
            }
        })
    });

    api.post('/login', function(req, res) {
        User.findOne({
            username: req.body.username
        }).select('password').exec(function(err, user) {
            if (err) {
                throw err;
            }

            if (!user) {
                res.send({message: "User doesn't exist."});
            } else if (user) {
                var validPassword = user.comparePasswords(req.body.password);

                if (!validPassword) {
                    res.send({message: "Invalid password"});
                } else {
                    var token = createToken(user);

                    res.json({
                        success: true,
                        message: 'logged',
                        token: token
                    });
                }
            }
        })
    });

    api.use(function(req, res, next) {
        console.log('Somebody just came');

        var token = req.body.token || req.param('token') || req.headers['x-access-token'];

        if (token) {
            jsonwebtoken.verify(token, secretKey, function(err, decoded) {
                if (err) {
                    res.status(403).send({success: false, message: "Failed to authenticate user"});
                } else {
                    req.decoded = decoded;

                    next();
                }
            });
        } else {
            res.status(403).send({success: false, message: "No token provided"});
        }
    });

    api.route('/')
        .post(function(req, res) {
            var story = new Story({
                creator: req.decoded.id,
                content: req.body.content
            });

            story.save(function(err) {
                if (err) {
                    res.send(err);
                    return
                } else {
                    res.json({message: 'success'});
                }
            })
        })
        .get(function(req, res) {
            Story.find({ creator: req.decoded.id }, function(err, stories) {

                if (err) {
                    res.send(err);
                } else {
                    res.send(stories);
                }
            })
        })

    return api;
}
