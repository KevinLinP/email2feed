const functions = require('@google-cloud/functions-framework');

const { initializeApp, app } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
const {google} = require('googleapis');
const url = require('url');

const REDIRECT_URI = 'http://localhost:8080/oauth2callback'

initializeApp();

const fetchOauthToken = async function({db}) {
  const snapshot = await db.collection('oauthTokens').get();

  let data
  snapshot.forEach((doc) => {
    data = doc.data();
  });

  return data
}

functions.http('function', async (req, res) => {
  const db = getFirestore();
  const {clientId, clientSecret} = await fetchOauthToken({db})

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    REDIRECT_URI
  );

  if (req.url.startsWith('/auth')) {
    const authorizationUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: 'https://www.googleapis.com/auth/gmail.readonly',
    });

    res.redirect(301, authorizationUrl);
  } else if (req.url.startsWith('/oauth2callback')) {
    let q = url.parse(req.url, true).query;

    let { tokens } = await oauth2Client.getToken(q.code);
    oauth2Client.setCredentials(tokens);

    console.log(tokens)
    console.log(oauth2Client)

    res.send('tokens acquired')
  } else {
    res.send('unexpected')
  }
});
