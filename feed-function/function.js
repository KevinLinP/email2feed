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
    labelIds: ['Label_439319154483766828']
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
  let lastUpdatedAt = new Date(2000)

  const messageItems = messages.map((message) => {
    const headers = {}

    message.payload.headers.forEach((header) => {
      headers[header.name] = header.value;
    })
    // console.log(message)
    // console.log(headers);

    const content = Buffer.from(message.payload.parts[1].body.data, 'base64').toString('utf-8');
    const date = new Date(headers['Date']);
    lastUpdatedAt = date > lastUpdatedAt ? date : lastUpdatedAt;
    const link = `https://mail.google.com/mail?authuser=kevin.lin.p@gmail.com#all/${message.id}`;

    const item = {
      title: headers['Subject'],
      id: message.id,
      content,
      date,
      link,
    }

    // console.log(item);
    return item
  });

  const feed = new Feed({
    title: "The New Paper - Old Archive",
    // description: "This is my personal feed!",
    id: "b5112187-8dc1-4378-9123-c6916c5cbb19",
    link: "https://mail.google.com/mail/u/2/#label/Z+Archive%2FThe+New+Paper+-+Old",
    language: "en", // optional, used only in RSS 2.0, possible values: http://www.w3.org/TR/REC-html40/struct/dirlang.html#langcodes
    // image: "http://example.com/image.png",
    // favicon: "http://example.com/favicon.ico",
    copyright: `© ${lastUpdatedAt.getFullYear()} The New Paper`,
    updated: lastUpdatedAt, // optional, default = today
    // generator: "awesome", // optional, default = 'Feed for Node.js'
    // feedLinks: {
    //   json: "https://example.com/json",
    //   atom: "https://example.com/atom"
    // },
    author: {
      name: "The New Paper",
      email: "editors@thenewpaper.co",
      link: "https://thenewpaper.co"
    }
  });
  feed.items = messageItems;

  return feed;
}



functions.http('function', async (req, res) => {
  const authClient = await getAuthClient();

  let response = 'noop';
  if (req.url.startsWith('/labels')) {
    response = await listLabels(authClient)
    res.set('Content-Type', 'text/plain');
  } else if (req.url.startsWith('/new-paper-archive')) {
    const messageIds = await listMessages(authClient)
    const messages = await fetchMessages({messageIds, auth: authClient})
    const feed = generateFeed(messages);

    response = feed.atom1();
    res.set('Content-Type', 'application/atom+xml');
  }

  res.send(response);
});
