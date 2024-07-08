const express = require('express');
const fs = require('fs/promises');
const { connectToDb, getDb } = require('./db');
const hashPassword = require('./utils/hashPassword');
const validatePassword = require('./utils/validatePassword');

const app = express();
app.use(express.json());

let db;

connectToDb((err) => {
    !err 
    ? app.listen(9090, () => {
        console.log('listening on 9090'); 
        db = getDb();
        }) 
    : console.log('failed to connect to db');
    
})

const defaultUserProject = {username: 1, score: 1, email: 1}

app.get('/api', (req, res) => {
    fs.readFile('guide.json', 'utf-8')
    .then((result) => {
        res.status(200).send(result);
    })
})

app.get('/api/users', (req, res) => {
    const users = []
    const page = req.query.p || 0;
    const displayLimit = 10;

    db.collection('users')
    .find()
    .sort({ username: 1 })
    .skip(page * displayLimit)
    .limit(displayLimit)
    .project(defaultUserProject)
    .forEach(user => users.push(user))
    .then(() => {
        res.status(200).json(users);
    })
    .catch((err) => {
        res.status(500).json({err: 'Could not retrieve users'})
    })
});

app.get('/api/users/scores', (req, res) => {
    const scoresArr = []
    const page = req.query.p || 0;
    const displayLimit = 5;

    db.collection('users')
    .find()
    .sort({ score: -1 })
    .skip(page * displayLimit)
    .limit(displayLimit)
    .project(defaultUserProject)
    .forEach(user => scoresArr.push(user))
    .then(() => {
        res.status(200).json(scoresArr);
    })
})

app.get('/api/users/username/:username', (req, res) => {
    db.collection('users')
    .findOne({username: req.params.username}, {projection: defaultUserProject})
    .then((user) => {
        res.status(200).json(user);
    })
    .catch((err) => {
        res.status(500).json({err: 'Could not retrieve user'})
    })
})

app.get('/api/users/email/:email', (req, res) => {
    db.collection('users')
    .findOne({email: req.params.email}, {projection: defaultUserProject})
    .then((user) => {
        res.status(200).json(user);
    })
    .catch((err) => {
        res.status(500).json({err: 'Could not retrieve user'})
    })
})

app.post('/api/users/:username/password', (req, res) => {
    const passwordToCheck = req.body.password;
    db.collection('users')
    .findOne({username: req.params.username}, {projection: {password:1}})
    .then((user) => {
        return validatePassword(passwordToCheck, user.password);
    })
    .then((result) => {
        result === true
        ? res.status(200).send({match:true})
        : res.status(200).send({match:false})
    })
})

app.post('/api/users', (req, res) => {
    const newUser = req.body;
    hashPassword(newUser.password, 10)
    .then((hash) => {
        newUser.password = hash;
        newUser.score = 0;
    })
    .then(() => {
        return db.collection('users').insertOne(newUser)
    })
    .then((result) => {
        res.status(201).json(result)
    })
    .catch((err) => {
        res.status(500).json({err: 'User could not be created'})
    })
})

app.delete('/api/users/:username', (req, res) => {
    db.collection('users')
    .deleteOne({username: req.params.username})
    .then((result) => {
        res.status(200).json(result)
    })
    .catch((err) => {
        res.status(500).json({err: 'User could not be deleted'})
    })
})

app.patch('/api/users/:username', (req, res) => {
    const userPatch = req.body;
    db.collection('users')
    .updateOne({username: req.params.username}, {$set: userPatch})
    .then((result) => {
        res.status(200).json(result);
    })
    .catch((err) => {
        res.status(500).json({err: 'User could not be updated'});
    })
})