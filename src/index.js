import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import '../env';
import { ApolloServer } from 'apollo-server-express';
import path from 'path';
import { fileLoader, mergeTypes, mergeResolvers } from 'merge-graphql-schemas';
import models from './models';
import authHelpers from './utils/authentication';
import { ROLES, PORT } from './utils/constants';
import logger from './utils/logger';

const typeDefs = mergeTypes(fileLoader(path.join(__dirname, './schemas')));
const resolvers = mergeResolvers(fileLoader(path.join(__dirname, './resolvers')));
const app = express();

// Set up graphql logging
morgan.token('graphql-query', (req) => {
  try {
    const { query, variables, operationName } = req.body;
    const formattedVariables = JSON.stringify(variables);

    return `\nGraphQL: \n-- Operation Name: ${operationName} \n-- Query: ${query}-- Variables: ${formattedVariables}`;
  } catch (error) {
    return `Failed to log GraphQL query: ${error}`;
  }
});
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());

// Log request info
app.use(morgan(':graphql-query'));
app.use(morgan('combined', { stream: logger.createStream() }));

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

const isTest = !!process.env.TEST_DB;

const createAdminUser = () => models.User.create({
  username: 'admin',
  email: 'aecorredor93@gmail.com',
  password: process.env.ADMIN_PASSWORD,
  role: ROLES.ADMIN,
});

const createRegularUser = () => models.User.create({
  username: 'aecorredor',
  email: 'corredor@gmail.com',
  password: 'testuser123',
});

models.sequelize.sync({ force: isTest }).then(async () => {
  if (isTest) {
    await Promise.all([createAdminUser(), createRegularUser()]);
  }

  app.listen({ port: PORT }, () => {
    /* eslint-disable-next-line no-console */
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
});
