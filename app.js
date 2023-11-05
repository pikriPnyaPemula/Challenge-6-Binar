require('dotenv').config();
const express = require('express');
const app = express();
const morgan = require('morgan');
const { PORT = 3000 } = process.env;

app.use(morgan('dev'));
app.use(express.json());

app.get('/', (req, res)=>{
    return res.json({
        status: true,
        message: 'Welcome Railway',
        error: null,
        data: null
    });
});

const authRouter = require ('./routes/auth.routes');
app.use('/api/v1/auth', authRouter);

const imageRouter = require ('./routes/image.routes');
app.use('/api/v1/image', imageRouter);

app.listen(PORT, ()=> console.log('Listening on Port ', PORT));