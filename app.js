const express = require('express')
const fs = require('fs/promises');
const { connectToDb, getDb } = require('./db')

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

// This defines the fields returned by most user queries, DO NOT add password to this until I figure out proper encryption and seperation
const defaultUserProject = {username: 1, score: 1, email: 1}

app.get('/api', (req, res) => {
    fs.readFile('guide.json', 'utf-8')
    .then((result) => {
        res.status(200).send(result);
    })
})

app.get('/api/users', (req, res) => {
    const users = []

    db.collection('users')
    .find()
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

    db.collection('users')
    .find()
    .project(defaultUserProject)
    .forEach(user => scoresArr.push(user))
    .then(() => {
        res.status(200).json(scoresArr);
    })
})

app.get('/api/users/:username', (req, res) => {
    db.collection('users')
    .findOne({username: req.params.username})
    .project(defaultUserProject)
    .then((user) => {
        res.status(200).json(user);
    })
    .catch((err) => {
        res.status(500).json({err: 'Could not retrieve user'})
    })
})

app.get('/api/users/:username/password', (req, res) => {
    const passwordToCheck = req.body.password;

    db.collection('users')
    .findOne({username: req.params.username})
    .project({password:1})
    .then((user) => {
        user.password === passwordToCheck
        ? res.status(200).json({match: true})
        : res.status(404).json({match: false})
    })
})

app.post('/api/users', (req, res) => {
    const newUser = req.body;
    db.collection('users')
    .insertOne(newUser)
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
    .project(defaultUserProject)
    .then((result) => {
        res.status(200).json(result);
    })
    .catch((err) => {
        res.status(500).json({err: 'User could not be updated'});
    })
})