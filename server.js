const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const md5 = require('md5');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('port', process.env.PORT || 3000)
app.locals.title = 'Secret Box'
app.locals.secrets = {
  wowow: "I am a banana",
  food: "I hate mash potatoes",
  1: "one"
}

const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

app.get('/', (request, response) => {
  response.send('Its a secret to everyone')
})

app.get('/api/secrets', (request, response) => {
  database('secrets').select()
          .then(function(secrets) {
            // console.log("Urls: ", urls)
            response.status(200).json(secrets);
          })
          .catch(function(error) {
            console.error('somethings wrong with db')
          });
})

app.post('/api/secrets', (request, response) => {
  const { message } = request.body
  const id = md5(message)

  app.locals.secrets[id] = message

  response.json({ id, message })
})


app.get('/api/owners/:id', (request, response) => {
  database('secrets').where('owner_id', request.params.id).select()
          .then(function(secrets) {
            response.status(200).json(secrets);
          })
          .catch(function(error) {
            console.error('somethings wrong with redirect')
          });
})

app.get('/api/secrets/:id', (request, response) => {
  const { id } = request.params
  const message = app.locals.secrets[id]

  !message ? response.sendStatus(404) : response.json({ id, message })
})

app.patch('/api/secrets/:id', (request, response) => {
  const { id } = request.params
  const { message } = request.body

  if(!app.locals.secrets[id]) {
    response.sendStatus(404)
  }

  app.locals.secrets[id] = message
  response.json({ id, message })
})

app.delete('/api/secrets/:id', (request, response) => {
  const { id } = request.params

  if(!app.locals.secrets[id]) {
    response.sendStatus(404)
  }

  delete app.locals.secrets[id]
  response.json({ message: "secret deleted" })
})


app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is runing on ${app.get('port')}.`)
})
