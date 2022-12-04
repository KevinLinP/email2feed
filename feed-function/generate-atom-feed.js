import { Feed } from 'feed';

const EMAIL_ADDRESS = 'newsletters.5pcxworx@gmail.com';
const FEED_HUB = 'https://kevinlinp-email-to-atom-feed.superfeedr.com'

export function generateAtomFeed({messages, feedData}) {
  let lastUpdatedAt = new Date(2000)

  const messageItems = messages.map((message) => {
    const headers = {}

    message.payload.headers.forEach((header) => {
      headers[header.name] = header.value;
    })
    // console.log(message)
    // console.log(headers);
    // console.log(message.payload)

    const htmlPart = message.payload.parts.find((part) => part.mimeType === 'text/html')
    const content = Buffer.from(htmlPart.body.data, 'base64').toString('utf-8');
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

  const feedFields = {
    id: `${EMAIL_ADDRESS}-${feedData.labelId}`,
    updated: lastUpdatedAt,
    title: feedData.title,
    hub: FEED_HUB,
    feedLinks: {
      atom: `${process.env.FEED_HOST}/${feedData.feedSlug}`
    }
  }

  const feed = new Feed(feedFields);
  feed.items = messageItems;

  return feed.atom1();
}
