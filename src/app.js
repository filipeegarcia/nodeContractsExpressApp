const express = require('express');
const bodyParser = require('body-parser');
const {sequelize} = require('./model')
const {getProfile} = require('./middleware/getProfile')
const app = express();

const adminRoutes = require('./routes/adminRoutes');
const balancesRoutes = require('./routes/balancesRoutes');
const contractsRoutes = require('./routes/contractsRoutes');
const jobsRoutes = require('./routes/jobsRoutes');

app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)
app.use(getProfile)

app.use('/admin', adminRoutes);
app.use('/balances', balancesRoutes);
app.use('/contracts', contractsRoutes);
app.use('/jobs', jobsRoutes);


module.exports = app;
