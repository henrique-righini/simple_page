const express = require('express');
const app = express();
app.set('view engine', 'pug');


app.get('/', (req, res) => {
    res.send('Hello World!');
  });

const server = app.listen(8080, () => {
    console.log(`Express running → PORT ${server.address().port}`);
  });