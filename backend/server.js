require('dotenv').config();
const express = require('express')
const mongoose = require('mongoose')
const helmet = require('helmet')
const morgan = require('morgan')
const cors = require('cors')
const bodyParser = require('body-parser')

const response = require('./middleware/response')
const passport = require('passport');
require("./modals/Patient");
require("./modals/Doctor");


const app = express();

app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
    origin : (process.env.ALLOWS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean) || '*',
    credentials : true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));


// use response
app.use(response);
//Passport initialize
app.use(passport.initialize());
app.get("/", (req, res) => {
  res.send("Doctor Consultation Backend is Running Perfect 🚀");
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/doctor', require('./routes/doctor'));
app.use('/api/patient', require('./routes/patient'));
app.use('/api/appointment', require('./routes/appointment'));
app.use('/api/payment', require('./routes/payment'));
app.use("/api/copilot", require("./routes/copilotRoutes"));

// Mongoose Connection
mongoose.connect(process.env.MONGO_URL).then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:',err));


app.get('/health', (req , res) => res.ok({time : new Date().toISOString()}, 'OK'))

const PORT = process.env.PORT || 8000;

app.listen(PORT , () => console.log(`server listening on ${PORT}`))