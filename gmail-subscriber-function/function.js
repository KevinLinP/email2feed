const functions = require('@google-cloud/functions-framework');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const {google} = require('googleapis');

const REDIRECT_URL = `${process.env.AUTH_HOST}/oauth2callback`;

initializeApp();

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

const getAuthClient = async function() {
  const authClient = new google.auth.OAuth2(
    process.env.OAUTH2_CLIENT_ID,
    process.env.OAUTH2_CLIENT_SECRET,
    REDIRECT_URL
  );
  authClient.on('tokens', storeTokens);

  const tokens = await getTokens();
  authClient.setCredentials(tokens);

  return authClient
}

functions.cloudEvent('function', async (cloudEvent) => {
  // const auth = await getAuthClient();
  // const gmail = google.gmail({version: 'v1', auth});
  console.log(JSON.stringify({cloudEvent}));

  return;
})
