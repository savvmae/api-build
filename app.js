const fs = require('fs');
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const Todos = require('./models/todo');
const bodyParser = require('body-parser');
mongoose.Promise = require('bluebird');
const application = express();

mongoose.connect('mongodb://localhost:27017/TodoApp');

application.use('/static', express.static('static'));
application.use(bodyParser.json());


application.get('/', function(request, response) {
    response.sendFile(__dirname + "/static/index.html");
});

application.get('/api/todos', async (request, response) => {
    var results = await Todos.find().sort("-order");
    if (!results) {
        response.status(404);
        return response.end();
    }
    response.json(results);
});

application.get('/api/todos/:id', async (request, response) => {
    let id = request.params.id;
    let todo = await Todos.find({ _id: id });

    if (!todo) {
        response.status(404);
        return response.end();
    }
    return response.json(todo);
});

application.post('/api/todos', async (request, response) => {
    var newTodo = new Todos({
        title: request.body.title,
        order: await Todos.count() + 1,
        completed: false
    })
    newTodo.save();
    response.status(200);
    return response.json(newTodo);
});


application.delete('/api/todos/:id', async (request, response) => {
    let id = request.params.id;

    let todo = await Todos.findOne({ _id: id });
    // let index = await Todos.findIndex( {_id: id});
    let deleted = await Todos.deleteOne({ _id: id });

    return response.json(todo);
});

application.put('/api/todos/:id', async (request, response) => {
    let id = request.params.id;
    let title = request.body.title;
    await Todos.findOneAndUpdate({ _id: id },
        {
            $set: {
                title: title
            }
        }
    );
    let updated = await Todos.find({ _id: id })

    return response.json(updated);
});


application.listen(3000, function() {
    console.log('Express running on http://localhost:3000/.')
});
