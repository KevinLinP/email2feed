const functions = require('@google-cloud/functions-framework');

const { initializeApp, app } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');

initializeApp();

functions.http('function', async (req, res) => {
  const db = getFirestore();

  let data = {}

  const snapshot = await db.collection('oauthTokens').get();
  snapshot.forEach((doc) => {
    data = doc.data();
  });

  res.send(data.client_id);
});
