// https://developers.google.com/identity/protocols/oauth2/web-server#offline

const functions = require('@google-cloud/functions-framework');

const { Feed } = require('feed');
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

const generateFeed = function(messages) {
  const feed = new Feed({
    title: "Feed Title",
    // description: "This is my personal feed!",
    // id: "http://example.com/",
    // link: "http://example.com/",
    language: "en", // optional, used only in RSS 2.0, possible values: http://www.w3.org/TR/REC-html40/struct/dirlang.html#langcodes
    // image: "http://example.com/image.png",
    // favicon: "http://example.com/favicon.ico",
    // copyright: "All rights reserved 2013, John Doe",
    // updated: new Date(2013, 6, 14), // optional, default = today
    // generator: "awesome", // optional, default = 'Feed for Node.js'
    // feedLinks: {
    //   json: "https://example.com/json",
    //   atom: "https://example.com/atom"
    // },
    // author: {
    //   name: "John Doe",
    //   email: "johndoe@example.com",
    //   link: "https://example.com/johndoe"
    // }
  });

  messages.forEach((message) => {
    const headers = {}

    console.log(message.payload.headers)

    message.payload.headers.forEach((header) => {
      headers[header.name] = header.value;
    })
    console.log(headers);
    console.log(message)

    feed.addItem({
      title: headers['Subject'],
      conent: message.payload.parts[1],
    });
  });

  return feed;
}



functions.http('function', async (req, res) => {
  const authClient = await getAuthClient();

  let response = 'noop';
  if (req.url.startsWith('/labels')) {
    response = await listLabels(authClient)
  } else if (req.url.startsWith('/pragmatic-engineer')) {
    const messageIds = await listMessages(authClient)
    const messages = await fetchMessages({messageIds, auth: authClient})
    const feed = generateFeed(messages);
    response = feed.atom1();
  }

  // https://www.npmjs.com/package/feed

  res.send(response);
});
