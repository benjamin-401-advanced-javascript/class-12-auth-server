
'use strict';

const superagent = require('superagent');
const Users = require('../users-model.js');

const API = 'https://cf-class-12-server.herokuapp.com';
const requestOauthURL = 'https://github.com/login/oauth/access_token';
const SERVICE = 'https://api.github.com/user';

let authorize = (request) => {

  console.log('(1)', request.query.code);

  return superagent.post(requestOauthURL)
    .type('form')
    // use code to request token
    .send({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_SECRET,
      code: request.query.code,
      redirect_uri: `${API}/oauth`
    })
    // console log code token
    .then(response => {
      let access_token = response.body.access_token;
      console.log('(2)', access_token);
      return access_token;
    })
    // use token to request user data
    .then(token => {
      console.log(SERVICE, token);
      return superagent.get(SERVICE)
        .set('Authorization', `token ${token}`)
        .then(response => {
          let user = response.body;
          console.log('(3)', user);
          return user;
        });
    })
    .then(oauthUser => {
      console.log('(4) Create Our Account');
      return Users.createFromOauth(oauthUser.email);
    })
    .then(actualUser => {
      console.log('(5) Made it');
      const ourToken = actualUser.generateToken();
      console.log('(5) Generated Token', ourToken);
      return ourToken;
    })
    .catch(error => error);
};


module.exports = authorize;