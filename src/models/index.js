import Sequelize from 'sequelize';

const sequelize = new Sequelize(
  process.env.TEST_DB || process.env.DB,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    dialect: 'postgres',
    operatorsAliases: Sequelize.Op,
    define: {
      underscored: true, // makes db properties snake case
    },
  },
);

const models = {
  User: sequelize.import('./user'),
};

Object.keys(models).forEach((modelName) => {
  if ('associate' in models[modelName]) {
    models[modelName].associate(models);
  }
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;

export default models;
