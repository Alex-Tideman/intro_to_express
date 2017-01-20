const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const md5 = require('md5');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('port', process.env.PORT || 3000);
app.locals.title = 'Secret Box';

app.locals.secrets = {
  wowowow: 'I am a banana'
};

app.get('/', (request, response) => {
  response.send('It\'s a secret to everyone.');
});
//

app.get('/api/secrets/:id', (request, response) => {
  console.log(request.params)
  const { id } = request.params;
  const message = app.locals.secrets[id];

  if (!message) { return response.sendStatus(404); }

  response.json({ id, message });
});

app.post('/api/secrets', (request, response) => {
  const { message } = request.body;
  const id = md5(message);

  if (!message) {
    return response.status(422).send({
      error: 'No message property provided'
    });
  }

  app.locals.secrets[id] = message;

  response.status(201).json({ id, message });
});

app.put('/api/secrets/:id', (request, response) => {
  const { id } = request.params;
  const { message } = request.body;
  const oldMessage = app.locals.secrets[id];

  if (!oldMessage) { return response.status(404); }

  app.locals.secrets[id] = message;

  response.json({ id, message });
});

app.delete('/api/secrets/:id', (request, response) => {
  const { id } = request.params;
  const oldMessage = app.locals.secrets[id];

  if (!oldMessage) { return response.status(404).send({
      error: 'There is no message with the "id" of ${id}.'
    })
  }

  delete app.locals.secrets[id];

  response.send('Secret deleted');
});

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on ${app.get('port')}.`);
});
