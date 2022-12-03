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

export async function fetchMessages({gmail, labelId}) {
  if (!labelId) return [];

  const messageIds = await listMessages({gmail, labelId})

  const promises = messageIds.map(({id}) => fetchMessage({gmail, id}));
  const messages = await Promise.all(promises);

  return messages;
}

