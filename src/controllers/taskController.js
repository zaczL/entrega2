const mongoose = require('mongoose');
const Task = require('../models/Task');
const projectController = require('./projectController');
const { taskSchema, taskUpdateSchema } = require('../validation');
const { createError } = require('../errors');

async function getTaskById(id, userId) {
  if (!mongoose.isValidObjectId(id)) {
    throw createError('Identificador inválido.');
  }

  const task = await Task.findById(id);
  if (!task) {
    throw createError('Tarefa não encontrada.', 404);
  }

  await projectController.getProjectById(task.project, userId);
  return task;
}

async function getTasks(projectId, userId) {
  const project = await projectController.getProjectById(projectId, userId);
  return Task.find({ project: project.id });
}

async function createTask(projectId, data, userId) {
  const project = await projectController.getProjectById(projectId, userId);
  const values = taskSchema.parse(data);
  return Task.create({ ...values, project: project.id });
}

async function updateTask(id, data, userId) {
  const task = await getTaskById(id, userId);
  const values = taskUpdateSchema.parse(data);

  Object.assign(task, values);
  await task.save();
  return task;
}

async function deleteTask(id, userId) {
  const task = await getTaskById(id, userId);
  await task.deleteOne();
  return true;
}

module.exports = { getTasks, getTaskById, createTask, updateTask, deleteTask };
