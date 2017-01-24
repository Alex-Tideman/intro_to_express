const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const md5 = require('md5');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('port', process.env.PORT || 3000)
app.locals.title = 'Secret Box'

const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

app.get('/', (request, response) => {
  response.send('Its a secret to everyone')
})

app.get('/api/secrets', (request, response) => {
  database('secrets').select()
          .then(function(secrets) {
            response.status(200).json(secrets);
          })
          .catch(function(error) {
            console.error('somethings wrong with db')
          });
})

app.post('/api/secrets', (request, response) => {
  const { message, owner_id } = request.body
  const id = md5(message)

  const secret = { id, message, owner_id, created_at: new Date };
  database('secrets').insert(secret)
  .then(function() {
    database('secrets').select()
            .then(function(secrets) {
              response.status(200).json(secrets);
            })
            .catch(function(error) {
              console.error('somethings wrong with db')
            });
  })
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
  database('secrets').where('id', id).first()
          .then(function(secret) {
            response.status(200).json(secret);
          })
          .catch(function(error) {
            console.error('somethings wrong with db call for a secret')
          });
})

app.put('/api/secrets/:id', (request, response) => {
  const { id } = request.params
  const { message, owner_id } = request.body

  database('secrets').where('id', id).first()
          .update({ message, owner_id })
          .then(function(secret) {
            response.status(200).json({ message, owner_id });
          })
          .catch(function(error) {
            console.error('somethings wrong with db call for a secret')
          });
})

app.delete('/api/secrets/:id', (request, response) => {
  const { id } = request.params

  database('secrets').where('id', id).first().del()
          .then(function(secret) {
            response.status(200).json({ message: "Secret deleted"});
          })
          .catch(function(error) {
            console.error('somethings wrong with db delete call')
          });
})


app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is runing on ${app.get('port')}.`)
})
