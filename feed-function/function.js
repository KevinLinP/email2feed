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

const getAuthClient = async function() {
  const authClient = new google.auth.OAuth2(
    process.env.OAUTH2_CLIENT_ID,
    process.env.OAUTH2_CLIENT_SECRET,
    redirectUrl
  );
  authClient.on('tokens', storeTokens);

  const tokens = await getTokens();
  authClient.setCredentials(tokens);

  return authClient
}

async function listMessages(auth) {
  const gmail = google.gmail({version: 'v1', auth});
  const res = await gmail.users.messages.list({
    userId: 'me',
    maxResults: 10,
    labelIds: ['Label_6517139861107061001']
  });

  return res.data.messages
}

async function fetchMessage({auth, id}) {
  const gmail = google.gmail({version: 'v1', auth});
  const res = await gmail.users.messages.get({
    userId: 'me',
    id
  });

  return res.data;
}

async function fetchMessages({messageIds, auth}) {
  const promises = messageIds.map(({id}) => fetchMessage({auth, id}));
  const messages = await Promise.all(promises);

  return messages;
}

functions.http('function', async (req, res) => {
  const authClient = await getAuthClient();

  let response = 'noop';
  if (req.url.startsWith('/labels')) {
    response = await listLabels(authClient)
  } else if (req.url.startsWith('/pragmatic-engineer')) {
    const messageIds = await listMessages(authClient)
    const messages = await fetchMessages({messageIds, auth: authClient})
    console.log(messages)
  }

  res.send(response);
});
