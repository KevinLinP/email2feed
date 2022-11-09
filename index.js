import {google} from 'googleapis'
import {getAuth} from './oauth-client.js'

async function listLabels(auth) {
  const gmail = google.gmail({version: 'v1', auth});
  const res = await gmail.users.labels.list({
    userId: 'me',
  });
  const labels = res.data.labels;
  if (!labels || labels.length === 0) {
    console.log('No labels found.');
    return;
  }
  console.log('Labels:');
  labels.forEach((label) => {
    console.log(`- ${label.name}`);
  });

  const pragmaticEngineerLabel = labels.find((l) => l.name === 'Pragmatic Engineer')
  console.log(pragmaticEngineerLabel);
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

async function run() {
  const auth = await getAuth();
  listLabels(auth)
  // const messageIds = await listMessages(auth)
  // // console.log(messageIds);
  // const messages = await fetchMessages({messageIds, auth})

  // const message = messages[0];
  // console.log(message)
  // console.log(message.payload.headers)

  // const parts = message.payload.parts 
  // console.log(parts)
  // const htmlPart = parts.find((p) => p.mimeType === 'text/html')
  // console.log(htmlPart.headers);
  // const htmlBody = Buffer.from(htmlPart.body.data, 'base64').toString('utf-8');
  // console.log(htmlBody);
}

run();
