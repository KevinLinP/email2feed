import { getGmailClient } from './gmail-client.js'
import { listLabels } from './list-labels.js'
import { fetchMessages } from './fetch-messages.js'
import { generateAtomFeed } from './generate-atom-feed.js'
import { FEEDS_BY_FEED_SLUG } from './feed-data.js'

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
  const feedData = FEEDS_BY_FEED_SLUG[feedName];
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
