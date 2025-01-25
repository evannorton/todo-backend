const express = require('express');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient()

const app = express();

const port = 3001;

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "*");
    next();
});

const jsonParser = bodyParser.json();

const colors = ["#FF3B30", "#FF9500", "#FFCC00", "#34C759", "#007AFF", "#5856D6", "#AF52DE", "#FF2D55", "#A2845E"];
const maxTitleLength = 100;

const isTaskValid = (title, color, isCompleted) => {
    if (typeof title !== "string") {
        return false;
    }
    if (title.length > maxTitleLength) {
        return false;
    }
    if (typeof color !== "string") {
        return false;
    }
    if (color.length !== 7) {
        return false;
    }
    if (colors.includes(color) === false) {
        return false;
    }
    if (typeof isCompleted !== "boolean") {
        return false;
    }
    return true;
}

app.get("/tasks", (req, res) => {
    prisma.task.findMany({
        select: {
            id: true,
            title: true,
            color: true,
            isCompleted: true
        }
    })
        .then((tasks) => {
            res.json(tasks);
        })
        .catch((error) => {
            console.error(error);
            res.sendStatus(500);
        });
});

app.post('/tasks', jsonParser, (req, res) => {
    if (isTaskValid(req.body.title, req.body.color, req.body.isCompleted) === false) {
        res.sendStatus(400);
        return;
    }
    prisma.task.create({
        data: {
            title: req.body.title,
            color: req.body.color,
            isCompleted: req.body.isCompleted
        }
    })
        .then(() => {
            res.sendStatus(200);
        })
        .catch((error) => {
            console.error(error);
            res.sendStatus(500);
        });
});

app.put('/tasks/:id', jsonParser, (req, res) => {
    if (isTaskValid(req.body.title, req.body.color, req.body.isCompleted) === false) {
        res.sendStatus(400);
        return;
    }
    prisma.task.update({
        where: {
            id: req.params.id
        },
        data: {
            title: req.body.title,
            color: req.body.color,
            isCompleted: req.body.isCompleted
        }
    })
        .then((task) => {
            if (task === null) {
                res.sendStatus(404);
                return;
            }
            res.sendStatus(200);
        })
        .catch((error) => {
            console.error(error);
            res.sendStatus(500);
        });
});

app.delete('/tasks/:id', (req, res) => {
    prisma.task.delete({
        where: {
            id: req.params.id
        }
    })
        .then((task) => {
            if (task === null) {
                res.sendStatus(404);
                return;
            }
            res.sendStatus(200);
        })
        .catch((error) => {
            console.error(error);
            res.sendStatus(500);
        });
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});