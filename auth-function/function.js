const functions = require('@google-cloud/functions-framework');

const { initializeApp, app } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const {google} = require('googleapis');
const url = require('url');

initializeApp();

const storeTokens = async function(tokens) {
  const db = getFirestore();

  await db.collection('applicationData').doc('oauthTokens').set(tokens, {merge: true});
}

functions.http('function', async (req, res) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.OAUTH2_CLIENT_ID,
    process.env.OAUTH2_CLIENT_SECRET,
    `${process.env.HOST}/oauth2callback`
  );

  if (req.url.startsWith('/oauth2redirect')) {
    const authorizationUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: 'https://www.googleapis.com/auth/gmail.readonly',
    });

    res.redirect(301, authorizationUrl);
  } else if (req.url.startsWith('/oauth2callback')) {
    let q = url.parse(req.url, true).query;

    let { tokens } = await oauth2Client.getToken(q.code);
    await storeTokens(tokens)

    res.send(`tokens stored: ${Object.keys(tokens).join(', ')}`)
  } else {
    res.send('noop')
  }
});
