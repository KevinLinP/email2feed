// https://developers.google.com/identity/protocols/oauth2/web-server#offline

// import { initializeApp } from 'firebase-admin/app';
// import { getFirestore } from 'firebase-admin/firestore';
// import { google } from 'googleapis';
import { Feed } from 'feed';

import { getGmailClient } from './gmail-client.js'

// const { initializeApp, app } = require('firebase-admin/app');
// const { getFirestore } = require('firebase-admin/firestore');
// const {google} = require('googleapis');

const NEW_PAPER_ARCHIVE_LABEL_ID = 'Label_439319154483766828';
// TODO: remove all but title and id and maybe link.
const NEW_PAPER_ARCHIVE_DATA = {
  title: "The New Paper - Old Archive",
  id: "b5112187-8dc1-4378-9123-c6916c5cbb19",
  link: "https://mail.google.com/mail/u/2/#label/Z+Archive%2FThe+New+Paper+-+Old",
  author: {
    name: "The New Paper",
    email: "editors@thenewpaper.co",
    link: "https://thenewpaper.co"
  }
}

const NEW_PAPER_LABEL_ID = 'Label_7484134168569030803';
const NEW_PAPER_DATA = {
  title: "The New Paper",
  id: "f2e8b6f8-9cb9-4a78-a98b-4da5cad29aa3",
  link: "https://mail.google.com/mail/u/0/#label/Newsletters%2FThe+New+Paper",
  author: {
    name: "The New Paper",
    email: "editors@thenewpaper.co",
    link: "https://thenewpaper.co"
  }
}

async function listLabels({gmail}) {
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

async function listMessages({gmail, labelId}) {
  const res = await gmail.users.messages.list({
    userId: 'me',
    maxResults: 10,
    labelIds: [labelId]
  });

  return res.data.messages
}

async function fetchMessage({gmail, id}) {
  const res = await gmail.users.messages.get({
    userId: 'me',
    id
  });

  return res.data;
}

async function fetchMessages({messageIds, gmail}) {
  const promises = messageIds.map(({id}) => fetchMessage({gmail, id}));
  const messages = await Promise.all(promises);

  return messages;
}

const generateFeed = function({messages, feedData}) {
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

  const feed = new Feed(Object.assign({updated: lastUpdatedAt}, feedData));
  feed.items = messageItems;

  return feed;
}


// TODO: root: list labels, path: fetch feed

export const feed = async function (req, res) {
  const gmail = await getGmailClient();

  let response = 'noop';
  if (req.url === '/labels') {
    response = await listLabels({gmail})
    res.set('Content-Type', 'text/plain');
  } else if (req.url === '/new-paper-archive') {
    const messageIds = await listMessages({gmail, labelId: NEW_PAPER_ARCHIVE_LABEL_ID})
    const messages = await fetchMessages({messageIds, gmail})
    const feed = generateFeed({messages, feedData: NEW_PAPER_ARCHIVE_DATA});

    response = feed.atom1();
    res.set('Content-Type', 'application/atom+xml');
  } else if (req.url === '/new-paper') {
    const messageIds = await listMessages({gmail, labelId: NEW_PAPER_LABEL_ID})
    const messages = await fetchMessages({messageIds, gmail})
    const feed = generateFeed({messages, feedData: NEW_PAPER_DATA});

    response = feed.atom1();
    res.set('Content-Type', 'application/atom+xml');
  }

  res.send(response);
}
