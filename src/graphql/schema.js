const typeDefs = `#graphql
  enum TaskStatus {
    PENDING
    IN_PROGRESS
    COMPLETED
  }

  type User {
    id: ID!
    name: String!
    email: String!
  }

  type Project {
    id: ID!
    name: String!
    description: String!
    owner: User!
    tasks: [Task!]!
  }

  type Task {
    id: ID!
    title: String!
    description: String!
    status: TaskStatus!
    project: Project!
  }

  type AuthResult {
    user: User!
    token: String!
  }

  input UserInput {
    name: String!
    email: String!
    password: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input ProjectInput {
    name: String!
    description: String
  }

  input ProjectUpdateInput {
    name: String
    description: String
  }

  input TaskInput {
    title: String!
    description: String
    status: TaskStatus
  }

  input TaskUpdateInput {
    title: String
    description: String
    status: TaskStatus
  }

  type Query {
    me: User!
    projects: [Project!]!
    project(id: ID!): Project!
    tasks(projectId: ID!): [Task!]!
    task(id: ID!): Task!
  }

  type Mutation {
    register(data: UserInput!): AuthResult!
    login(data: LoginInput!): AuthResult!
    createProject(data: ProjectInput!): Project!
    updateProject(id: ID!, data: ProjectUpdateInput!): Project!
    deleteProject(id: ID!): Boolean!
    createTask(projectId: ID!, data: TaskInput!): Task!
    updateTask(id: ID!, data: TaskUpdateInput!): Task!
    deleteTask(id: ID!): Boolean!
  }
`;

module.exports = typeDefs;
