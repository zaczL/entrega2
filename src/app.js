const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@as-integrations/express5');
const routes = require('./routes');
const typeDefs = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');
const { getUser } = require('./auth');
const { errorHandler } = require('./errors');

async function createApp() {
  const app = express();
  const graphqlServer = new ApolloServer({
    typeDefs,
    resolvers,
    includeStacktraceInErrorResponses: false,
  });

  await graphqlServer.start();

  app.use(cors());
  app.use(express.json());
  app.use(express.static(path.join(__dirname, '../public')));
  app.use('/api', routes);

  app.get('/health', (_request, response) => {
    const connected = mongoose.connection.readyState === 1;
    response.status(connected ? 200 : 503).json({ status: connected ? 'ok' : 'erro' });
  });

  app.use(
    '/graphql',
    expressMiddleware(graphqlServer, {
      context: async ({ req }) => {
        if (!req.headers.authorization) return { user: null };

        try {
          return { user: await getUser(req.headers.authorization) };
        } catch {
          return { user: null };
        }
      },
    }),
  );

  app.use(errorHandler);
  return { app, graphqlServer };
}

module.exports = createApp;
