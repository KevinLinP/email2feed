import { getGmailClient } from './gmail-client.js'
import { listLabels } from './list-labels.js'
import { fetchMessages } from './fetch-messages.js'
import { generateAtomFeed } from './generate-atom-feed.js'

const ALL_FEEDS = {
  'the-new-paper': {
    labelId: 'Label_1022511598545577874',
    title: 'The New Paper'
  },
  'hbr-weekly-hotlist': {
    labelId: 'Label_2929678475469609016',
    title: 'Harvard Business Review - Weekly Hotlist'
  },
  'tldr': {
    labelId: 'Label_2979225397234449442',
    title: 'TLDR'
  },
  'the-pragmatic-engineer': {
    labelId: 'Label_8050679543859778915',
    title: 'The Pragmatic Engineer'
  },
}

export async function feedFunction(req, res) {
  if (req.url === '/') {
    res.set('Content-Type', 'text/plain');
    res.send('noop');
    return;
  }

  if (req.url === '/labels') {
    const gmail = await getGmailClient();

    const response = await listLabels({gmail})
    res.set('Content-Type', 'text/plain');
    res.send(response);
    return;
  }

  const feedName = req.url.replace(/^\//, '');
  const feedData = ALL_FEEDS[feedName];
  if (feedData) {
    const gmail = await getGmailClient();
    const messages = await fetchMessages({gmail, labelId: feedData.labelId})
    const response = generateAtomFeed({messages, feedData});

    res.set('Content-Type', 'application/atom+xml');
    res.send(response);
    return;
  }

  res.status(404)
  res.set('Content-Type', 'text/plain');
  res.send('not found');
  return
}
