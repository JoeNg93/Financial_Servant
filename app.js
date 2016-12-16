const fs = require('fs');
const express = require('express');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const path = require('path');

app = express();

app.set('port', process.env.PORT || 5000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// bodyParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Server static file
app.use(express.static(path.join(__dirname, 'public')));

app.listen(app.get('port'), () => {
  console.log('Listening on port', app.get('port'));
});

