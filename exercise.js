const express = require("express");
const router = express.Router();
const User = require('./models/user');
const Exercise = require('./models/exercise');

router.post('/new-user', async function (req, res) {
    try {
        const { username } = req.body
        const existingUser = await User.findOne({ username });
        if (existingUser) throw new Error("User already exists");
        const user = await new User({ username }).save();
        res.json({
            _id: user.id,
            username: user.username
        });
    } catch (err) {
        res.status(500).json({
            error: err.toString()
        });
    }
});

router.post('/add', async function (req, res) {
    try {
        let { userId, description, duration, date} = req.body;
        if (!date) date = new Date(); 
        const user = await User.findOne({ _id: userId });
        if (!user) throw new Error("user does not exist");
        let exercise = await new Exercise({ userId, description, duration, date}).save();
        res.json({
            username: user.username,
            _id: exercise.userId,
            description: exercise.description,
            duration: exercise.duration,
            date: exercise.date
        });
    } catch (err) {
        res.status(500).json({
            error: err.toString()
        });
    }
});

router.get('/users', async function (req, res) {
    try {
        console.log(req.query);
        const users = await User.find().select('_id username');
        res.json(users);
    } catch (err) {
        res.status(500).json({
            error: err.toString()
        })
    }
});

router.get('/log', async function (req, res) {
    try {
        let { userId, from, to, limit } = req.query;
        const user = await User.findOne({ _id: userId });
        if (!user) throw new Error("User does not exist");
        const exercises = await Exercise.find({ userId, date: {
            $gt: from || new Date(0),
            $lt: to || new Date()
        } })
        .limit(parseInt(limit))
        .select(" -_id -__v");
        res.json({
            username: user.username,
            log: exercises,
            count: exercises.length
        });
    } catch (err) {
        res.status(500).json({
            error: err.toString()
        });
    }
})



module.exports = router;