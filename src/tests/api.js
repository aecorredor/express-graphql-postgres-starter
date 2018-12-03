/* eslint-disable import/no-extraneous-dependencies */
import axios from 'axios';
import { PORT } from '../utils/constants';

const API_URL = `http://localhost:${PORT}/graphql`;

export default {
  user: variables => axios.post(API_URL, {
    query: `
    query ($id: ID!) {
      user(id: $id) {
        id
        username
        email
        role
      }
    }
    `,
    variables,
  }),

  signIn: variables => axios.post(API_URL, {
    query: `
      mutation ($login: String!, $password: String!) {
        signIn(login: $login, password: $password) {
          token
        }
      }
    `,
    variables,
  }),

  deleteUser: (variables, token) => axios.post(
    API_URL,
    {
      query: `
        mutation ($id: ID!) {
          deleteUser(id: $id)
        }
      `,
      variables,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  ),
};
