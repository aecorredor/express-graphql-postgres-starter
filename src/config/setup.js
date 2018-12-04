import helmet from 'helmet';
import cors from 'cors';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import { ROLES } from '../utils/constants';
import logger from '../utils/logger';

export const createAdminUser = models => models.User.create({
  username: 'admin',
  email: 'aecorredor93@gmail.com',
  password: process.env.ADMIN_PASSWORD,
  role: ROLES.ADMIN,
});

export const createRegularUser = models => models.User.create({
  username: 'aecorredor',
  email: 'corredor@gmail.com',
  password: 'testuser123',
});

export const isTest = !!process.env.TEST_DB;

export const enhanceApp = (app) => {
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
};
