// https://developers.google.com/identity/protocols/oauth2/web-server#offline

const functions = require('@google-cloud/functions-framework');

const { initializeApp, app } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const {google} = require('googleapis');
const url = require('url');

initializeApp();

const redirectUrl = `${process.env.AUTH_HOST}/oauth2callback`;

const getTokens = async function(tokens) {
  const db = getFirestore();

  const documentRef = db.collection('applicationData').doc('oauthTokens');
  const documentSnapshot = await documentRef.get();
  return documentSnapshot.data();
}


const storeTokens = async function(tokens) {
  const db = getFirestore();

  await db.collection('applicationData').doc('oauthTokens').set(tokens, {merge: true});
}

async function listLabels(auth) {
  const gmail = google.gmail({version: 'v1', auth});
  const res = await gmail.users.labels.list({
    userId: 'me',
  });

  const labels = res.data.labels;
  if (!labels || labels.length === 0) {
    return 'No labels found.';
  }

  let response = '';

  labels.forEach((label) => {
    response = response.concat(`${label.id} - ${label.name}\n`)
  });

  return response;
}

functions.http('function', async (req, res) => {
  const authClient = new google.auth.OAuth2(
    process.env.OAUTH2_CLIENT_ID,
    process.env.OAUTH2_CLIENT_SECRET,
    redirectUrl
  );
  authClient.on('tokens', storeTokens);

  const tokens = await getTokens();
  authClient.setCredentials(tokens);

  const response = await listLabels(authClient)

  res.send(response);
});
