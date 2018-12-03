import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthenticationError, ForbiddenError } from 'apollo-server-express';
import { combineResolvers, skip } from 'graphql-resolvers';
import { ROLES } from './constants';

// returns promise
const hashPassword = password => bcrypt.hash(password, 10);

// returns promise
const createUserToken = (user, secret, expiresIn) => {
  const {
    id, email, username, role,
  } = user;

  return jwt.sign(
    {
      id,
      email,
      username,
      role,
    },
    secret,
    { expiresIn },
  );
};

// returns promise
const validatePassword = (candidate, password) => bcrypt.compare(candidate, password);

// Tries to get logged in user
const getMe = async (req) => {
  const auth = req.headers.authorization;

  if (auth) {
    try {
      const token = auth.replace('Bearer ', '');
      const me = await jwt.verify(token, process.env.SECRET);

      return me; // { id, email, username }
    } catch (error) {
      throw new AuthenticationError(`Session expired: ${error}`);
    }
  }

  // We want 'me' to be undefined if no token is passed. Some resolvers do not required the user
  // to be authorized. Explicitly returning 'undefined' for clarity.
  return undefined;
};

// Use the following resolver middlewares along with 'combineResolvers' to guard other
// mutations/queries as needed.
const isAuthenticated = (parent, args, { me }) => {
  if (me) {
    return skip;
  }

  return new ForbiddenError('Not authenticated.');
};

const isAdmin = combineResolvers(isAuthenticated, (parent, args, { me: { role } }) => {
  if (role === ROLES.ADMIN) {
    return skip;
  }

  return new ForbiddenError('Not authenticated as admin.');
});

export default {
  hashPassword,
  createUserToken,
  validatePassword,
  getMe,
  isAuthenticated,
  isAdmin,
};
