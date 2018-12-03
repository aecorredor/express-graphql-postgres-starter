import { AuthenticationError, UserInputError } from 'apollo-server-express';
import { combineResolvers } from 'graphql-resolvers';
import authHelpers from '../utils/authentication';

export default {
  Query: {
    users: (parent, args, { models }) => models.User.findAll(),
    user: (parent, { id }, { models }) => models.User.findById(id),
  },

  Mutation: {
    signUp: async (parent, { username, email, password }, { models, secret }) => {
      const user = await models.User.create({
        username,
        email,
        password,
      });

      return { token: await authHelpers.createUserToken(user, secret, '30m') };
    },

    signIn: async (parent, { login, password }, { models, secret }) => {
      const user = await models.User.findByLogin(login);

      if (!user) {
        throw new UserInputError('No user found with login credentials provided.');
      }

      const isValid = await authHelpers.validatePassword(password, user.password);

      if (!isValid) {
        throw new AuthenticationError('Invalid password.');
      }

      return { token: authHelpers.createUserToken(user, secret, '30m') };
    },

    deleteUser: combineResolvers(authHelpers.isAdmin, async (parent, { id }, { models }) => {
      const wasDeleted = await models.User.destroy({ where: { id } });

      return wasDeleted;
    }),
  },
};
