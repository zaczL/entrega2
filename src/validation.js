const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(72),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(72),
});

const projectSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(500).optional(),
});

const taskSchema = z.object({
  title: z.string().trim().min(2).max(150),
  description: z.string().trim().max(500).optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  projectSchema,
  projectUpdateSchema: projectSchema.partial(),
  taskSchema,
  taskUpdateSchema: taskSchema.partial(),
};
