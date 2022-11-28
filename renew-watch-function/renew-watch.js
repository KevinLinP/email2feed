import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import {google} from 'googleapis';

const FEED_PUSH_LABEL_ID = 'Label_4277337768608046229'
const GMAIL_TOPIC_NAME = 'projects/positive-apex-369323/topics/gmail'

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
    process.env.OAUTH2_CLIENT_SECRET
  );
  authClient.on('tokens', storeTokens);

  const tokens = await getTokens();
  authClient.setCredentials(tokens);

  return authClient
}

export const renewWatch = async function (cloudEvent) {
  const auth = await getAuthClient();
  const gmail = google.gmail({version: 'v1', auth});

  let response
  if (cloudEvent.data.message?.attributes?.stop) {
    console.log('stopping ...')
    response = await gmail.users.stop({userId: 'me'})
  } else {
    response = await gmail.users.watch({
      userId: 'me',
      requestBody: {
        topicName: GMAIL_TOPIC_NAME,
        labelIds: [FEED_PUSH_LABEL_ID],
        labelFilterAction: 'include',
      },
    });
  }
  console.log(response.status, response.data);

  return;
}
