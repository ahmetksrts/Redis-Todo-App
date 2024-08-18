/* server.js */
/* ----------------- */

const express = require('express');
const bodyParser = require('body-parser');
const redis = require('redis');
const cors = require('cors');
const moment = require('moment-timezone'); // Timezone



const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json()); // bodyParser'ı ekledik
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.use((req, res, next) => {
    console.log(`Received ${req.method} request to ${req.path}`);
    next();
});

// CORS
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'DELETE', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Redis client 
const client = redis.createClient({
    url: 'redis://localhost:6379'
});

// Redis connection
(async () => {
    try {
        await client.connect();
        console.log('Connected to Redis');
    } catch (error) {
        console.error('Redis connection error:', error);
    }
})();

client.on('error', (err) => {
    console.error('Redis error:', err);
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Helper function to renumber IDs
const renumberIDs = async () => {
    const todos = await client.lRange('todos', 0, -1);
    if (todos.length === 0) return;

    const updatedTodos = todos.map((todo, index) => {
        const parsedTodo = JSON.parse(todo);
        parsedTodo.id = index + 1;
        return JSON.stringify(parsedTodo);
    });

    await client.del('todos');
    await client.rPush('todos', updatedTodos);
    
    // Update ID counter
    await client.set('todo:id', updatedTodos.length);
};


// POST /todo endpoint
app.post('/todo', async (req, res) => {
    const { task } = req.body;
    if (!task) {
        return res.status(400).json({ error: 'Task is required!' });
    }

    // increase ID
    const id = await client.incr('todo:id');

    const timestamp = moment().tz('Europe/Istanbul').format('YYYY-MM-DD HH:mm:ss'); // İstanbul saat diliminde tarih

    const taskWithDetails = JSON.stringify({
        id: id,
        completed: false,
        task: task,
        timestamp: timestamp
    });

    await client.lPush('todos', taskWithDetails);
    res.status(201).json({ id, task, completed: false, timestamp });
});


// GET /todos endpoint
app.get('/todos', async (req, res) => {
    const todos = await client.lRange('todos', 0, -1);
    const parsedTodos = todos.map(todo => {
        try {
            return JSON.parse(todo);
        } 
        catch (error) {
            return { id: 'Unknown', task: todo, timestamp: 'Unknown', completed: false };
        }
    });
    res.json(parsedTodos);
});


// DELETE /deleteAll endpoint
app.delete('/deleteAll', async (req, res) => {
    try {
        // Tüm görevleri sil
        await client.del('todos');
        // ID sayacını sıfırla
        await client.set('todo:id', 0);
        res.json({ message: 'Tüm görevler başarıyla silindi ve ID sayacı sıfırlandı.' });
    } 
    catch (error) {
        res.status(500).json({ error: 'Görevler silinirken bir hata oluştu.' });
    }
});

// DELETE /todo/:id endpoint
app.delete('/todo/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const todos = await client.lRange('todos', 0, -1);
        let deleted = false;
        for (let i = 0; i < todos.length; i++) {
            const todo = JSON.parse(todos[i]);
            if (todo.id === id) {
                await client.lRem('todos', 0, todos[i]);
                deleted = true;
                break;
            }
        }
        if (deleted) {
            await renumberIDs();
            res.json({ message: `Görev ID ${id} başarıyla silindi.` });
        } 
        else {
            res.status(404).json({ error: `ID ${id} ile görev bulunamadı.` });
        }
    } 
    catch (error) {
        console.error('Error deleting todo:', error);
        res.status(500).json({ error: 'Görev silinirken bir hata oluştu.' });
    }
});

// PUT /todo/:id endpoint to update task status
app.put('/todo/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const { completed } = req.body;

    try {
        const todos = await client.lRange('todos', 0, -1);
        let updated = false;
        for (let i = 0; i < todos.length; i++) {
            const todo = JSON.parse(todos[i]);
            if (todo.id === id) {
                todo.completed = completed;
                await client.lSet('todos', i, JSON.stringify(todo));
                updated = true;
                break;
            }
        }

        if (updated) {
            res.json({ message: `Task ID ${id} updated successfully.` });
        } 
        else {
            res.status(404).json({ error: `Task ID ${id} not found.` });
        }
    } 
    catch (error) {
        console.error('Error updating task status:', error);
        res.status(500).json({ error: 'Error updating task status.' });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Running at http://localhost:${port}`);
});