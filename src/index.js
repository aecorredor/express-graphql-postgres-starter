import express from 'express';
import '../env';
import { ApolloServer } from 'apollo-server-express';
import path from 'path';
import { fileLoader, mergeTypes, mergeResolvers } from 'merge-graphql-schemas';

import models from './models';
import authHelpers from './utils/authentication';
import { PORT } from './utils/constants';
import {
  createAdminUser, createRegularUser, isTest, enhanceApp,
} from './config/setup';

const typeDefs = mergeTypes(fileLoader(path.join(__dirname, './schemas')));
const resolvers = mergeResolvers(fileLoader(path.join(__dirname, './resolvers')));
const app = express();
enhanceApp(app);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const me = await authHelpers.getMe(req);

    return {
      models,
      me,
      secret: process.env.SECRET,
    };
  },
});
server.applyMiddleware({ app, path: '/graphql' });

models.sequelize.sync({ force: isTest }).then(async () => {
  if (isTest) {
    await Promise.all([createAdminUser(models), createRegularUser(models)]);
  }

  app.listen({ port: PORT }, () => {
    /* eslint-disable-next-line no-console */
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
});
