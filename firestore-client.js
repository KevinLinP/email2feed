import { initializeApp, applicationDefault, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore'
import * as serviceAccount from './secrets/serviceAccountKey.json' assert {type: "json"};

export const getDb = function () {
  // const serviceAccount = require('secrets/serviceAccountKey.json');
  console.log(serviceAccount.default);

  initializeApp({
    credential: cert(serviceAccount.default)
  });

  const db = getFirestore();

  return db;
}

