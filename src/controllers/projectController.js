const mongoose = require('mongoose');
const Project = require('../models/Project');
const Task = require('../models/Task');
const { projectSchema, projectUpdateSchema } = require('../validation');
const { createError } = require('../errors');

async function getProjectById(id, userId) {
  if (!mongoose.isValidObjectId(id)) {
    throw createError('Identificador inválido.');
  }

  const project = await Project.findOne({ _id: id, owner: userId });
  if (!project) {
    throw createError('Projeto não encontrado.', 404);
  }

  return project;
}

async function getProjects(userId) {
  return Project.find({ owner: userId });
}

async function createProject(data, userId) {
  const values = projectSchema.parse(data);
  return Project.create({ ...values, owner: userId });
}

async function updateProject(id, data, userId) {
  const project = await getProjectById(id, userId);
  const values = projectUpdateSchema.parse(data);

  Object.assign(project, values);
  await project.save();
  return project;
}

async function deleteProject(id, userId) {
  const project = await getProjectById(id, userId);
  await Task.deleteMany({ project: project.id });
  await project.deleteOne();
  return true;
}

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};
