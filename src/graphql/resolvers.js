const authController = require('../controllers/authController');
const projectController = require('../controllers/projectController');
const taskController = require('../controllers/taskController');
const { createError } = require('../errors');

function userId(context) {
  if (!context.user) {
    const error = createError('Você precisa estar autenticado.', 401);
    error.extensions = { code: 'UNAUTHENTICATED' };
    throw error;
  }

  return context.user.id;
}

const resolvers = {
  Query: {
    me: (_parent, _args, context) => {
      userId(context);
      return context.user;
    },
    projects: (_parent, _args, context) => projectController.getProjects(userId(context)),
    project: (_parent, { id }, context) =>
      projectController.getProjectById(id, userId(context)),
    tasks: (_parent, { projectId }, context) =>
      taskController.getTasks(projectId, userId(context)),
    task: (_parent, { id }, context) => taskController.getTaskById(id, userId(context)),
  },

  Mutation: {
    register: (_parent, { data }) => authController.register(data),
    login: (_parent, { data }) => authController.login(data),
    createProject: (_parent, { data }, context) =>
      projectController.createProject(data, userId(context)),
    updateProject: (_parent, { id, data }, context) =>
      projectController.updateProject(id, data, userId(context)),
    deleteProject: (_parent, { id }, context) =>
      projectController.deleteProject(id, userId(context)),
    createTask: (_parent, { projectId, data }, context) =>
      taskController.createTask(projectId, data, userId(context)),
    updateTask: (_parent, { id, data }, context) =>
      taskController.updateTask(id, data, userId(context)),
    deleteTask: (_parent, { id }, context) =>
      taskController.deleteTask(id, userId(context)),
  },

  Project: {
    owner: (_project, _args, context) => context.user,
    tasks: (project, _args, context) => taskController.getTasks(project.id, userId(context)),
  },

  Task: {
    project: (task, _args, context) =>
      projectController.getProjectById(task.project, userId(context)),
  },
};

module.exports = resolvers;
