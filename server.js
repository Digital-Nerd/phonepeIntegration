const express=require('express');
const cors=require('cors');
const app=express();
const sha256=require('sha256');
const axios=require('axios');
const crypto=require('crypto');
const ejs = require('ejs');
const phonepeRoutes = require('./routes/phonepe');
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/phonepe', phonepeRoutes);

app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.render('phonepeHome');
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});