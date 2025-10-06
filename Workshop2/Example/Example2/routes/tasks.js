const express = require('express');
const router = express.Router();

router.get('/tasks', (req, res) => {
    const taskList = [
        'Buy groceries',
        'Finish Express workshop',
        'Go for a run'
    ];
    res.render('tasks', { tasks: taskList });
});
module.exports = router;