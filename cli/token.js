/*eslint-disable no-console*/

const inquirer = require('inquirer');
const https = require('https');
require('dotenv').config({
  path: `src/environment/.env.stage.${process.env.STAGE}`,
});

async function getAuth0Token() {
  const answers = await inquirer.prompt([
    { message: 'Email/Username:', name: 'username' },
    { message: 'Password:', name: 'password', type: 'password', mask: true },
    {
      message: 'Auth Scope:',
      name: 'scope',
      type: 'list',
      choices: [
        { name: 'default', value: '' },
        { name: 'openid profile email' },
      ],
    },
  ]);

  var postData = JSON.stringify({
    grant_type: 'http://auth0.com/oauth/grant-type/password-realm',
    client_id: process.env.AUTH0_APPLICATION_CLIENT_ID,
    client_secret: process.env.AUTH0_SECRET,
    audience: process.env.AUTH0_AUDIENCE,
    realm: 'Username-Password-Authentication',
    ...answers,
  });

  var options = {
    hostname: process.env.AUTH0_DOMAIN,
    port: 443,
    path: '/oauth/token',
    method: 'POST',
    headers: {
      Host: process.env.AUTH0_DOMAIN,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Content-Length': postData.length,
    },
  };
  let responseBody = '';

  var req = https.request(options, (res) => {
    console.log('==>> statusCode:', res.statusCode);

    res.on('data', (d) => {
      responseBody += d;
    });
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log('Ok, Success!');
        const parsedResponse = JSON.parse(responseBody);
        if (parsedResponse.id_token) {
          console.log(parsedResponse.id_token);
          console.log('\nHey, here is your ID token:');
        }

        console.log(parsedResponse.access_token);
        console.log('\nHey, here is your Access token:');
      } else {
        console.log('Oh no, Error fetching token: ', responseBody);
      }
    });
  });

  req.on('error', (e) => {
    console.error(e);
  });
  req.write(postData);
  req.end();
}

getAuth0Token();
