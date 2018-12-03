import { ROLES } from '../utils/constants';
import userApi from './api';

describe('users', () => {
  describe('user(id: String!): User', () => {
    it('returns a user when user can be found', async () => {
      const expectedResult = {
        data: {
          user: {
            id: '1',
            username: 'admin',
            email: 'aecorredor93@gmail.com',
            role: ROLES.ADMIN,
          },
        },
      };

      const result = await userApi.user({ id: '1' });

      expect(result.data).toEqual(expectedResult);
    });

    it('returns null when user cannot be found', async () => {
      const expectedResult = {
        data: {
          user: null,
        },
      };

      const result = await userApi.user({ id: '42' });

      expect(result.data).toEqual(expectedResult);
    });
  });

  describe('deleteUser(id: String!): Boolean!', () => {
    it('returns an error because only admins can delete a user', async () => {
      const {
        data: {
          data: {
            signIn: { token },
          },
        },
      } = await userApi.signIn({
        login: 'aecorredor',
        password: 'testuser123',
      });

      const {
        data: { errors },
      } = await userApi.deleteUser({ id: '1' }, token);

      expect(errors[0].message).toBe('Not authenticated as admin.');
    });
  });
});
