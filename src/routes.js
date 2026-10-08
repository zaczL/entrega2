const express = require('express');
const authController = require('./controllers/authController');
const projectController = require('./controllers/projectController');
const taskController = require('./controllers/taskController');
const { authMiddleware } = require('./auth');

const routes = express.Router();

routes.post('/auth/register', async (request, response) => {
  const result = await authController.register(request.body);
  response.status(201).json(result);
});

routes.post('/auth/login', async (request, response) => {
  response.json(await authController.login(request.body));
});

routes.get('/auth/profile', authMiddleware, (request, response) => {
  response.json({ id: request.user.id, name: request.user.name, email: request.user.email });
});

routes.post('/projects', authMiddleware, async (request, response) => {
  const project = await projectController.createProject(request.body, request.user.id);
  response.status(201).json(project);
});

routes.get('/projects', authMiddleware, async (request, response) => {
  response.json(await projectController.getProjects(request.user.id));
});

routes.get('/projects/:id', authMiddleware, async (request, response) => {
  response.json(await projectController.getProjectById(request.params.id, request.user.id));
});

routes.patch('/projects/:id', authMiddleware, async (request, response) => {
  response.json(
    await projectController.updateProject(request.params.id, request.body, request.user.id),
  );
});

routes.delete('/projects/:id', authMiddleware, async (request, response) => {
  await projectController.deleteProject(request.params.id, request.user.id);
  response.status(204).end();
});

routes.post('/projects/:projectId/tasks', authMiddleware, async (request, response) => {
  const task = await taskController.createTask(
    request.params.projectId,
    request.body,
    request.user.id,
  );
  response.status(201).json(task);
});

routes.get('/projects/:projectId/tasks', authMiddleware, async (request, response) => {
  response.json(await taskController.getTasks(request.params.projectId, request.user.id));
});

routes.get('/tasks/:id', authMiddleware, async (request, response) => {
  response.json(await taskController.getTaskById(request.params.id, request.user.id));
});

routes.patch('/tasks/:id', authMiddleware, async (request, response) => {
  response.json(await taskController.updateTask(request.params.id, request.body, request.user.id));
});

routes.delete('/tasks/:id', authMiddleware, async (request, response) => {
  await taskController.deleteTask(request.params.id, request.user.id);
  response.status(204).end();
});

module.exports = routes;
