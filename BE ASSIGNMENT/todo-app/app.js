const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

// Middleware to log request timestamps
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Middleware for parsing JSON & URL-encoded data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Load tasks from tasks.json
const loadTasks = () => {
    try {
        const data = fs.readFileSync('tasks.json', 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
};

// Save tasks to tasks.json
const saveTasks = (tasks) => {
    fs.writeFileSync('tasks.json', JSON.stringify(tasks, null, 2));
};

// Route: GET /tasks → Show all tasks
app.get('/tasks', (req, res) => {
    const tasks = loadTasks();
    res.render('tasks', { tasks });
});

// Route: GET /task?id=1 → Fetch a specific task
app.get('/task', (req, res) => {
    const tasks = loadTasks();
    const task = tasks.find(t => t.id === parseInt(req.query.id));
    if (!task) {
        return res.status(404).send("Task not found");
    }
    res.render('task', { task });
});

// Route: POST /add-task → Add a new task
app.post('/add-task', (req, res) => {
    const tasks = loadTasks();
    const newTask = {
        id: tasks.length ? tasks[tasks.length - 1].id + 1 : 1,
        title: req.body.title,
        description: req.body.description
    };
    tasks.push(newTask);
    saveTasks(tasks);
    res.redirect('/tasks');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
