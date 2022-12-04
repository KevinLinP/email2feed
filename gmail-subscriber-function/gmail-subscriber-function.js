import { getGmailClient } from './gmail-client.js'
import { FEEDS_BY_LABEL_ID } from './feed-data.js'

const FEED_HUB = 'http://kevinlinp-email-to-atom-feed.superfeedr.com'

async function getLabelId({messageId}) {
  const gmail = await getGmailClient()
  const messageResponse = await gmail.users.messages.get({ id: messageId, userId: 'me' })
  console.log(messageResponse)
  const labelIds = messageResponse.data.labelIds
  const labelId = labelIds.find((labelId) => labelId.match(/^Label_/))

  console.log(JSON.stringify({
    labelIds,
    labelId,
  }));

  return labelId
}

export const gmailSubscriberFunction = async function (cloudEvent) {
  const {messageId} = cloudEvent.data.message
  console.log(JSON.stringify({
    cloudEvent,
    messageId,
  }));

  const labelId = await getLabelId({messageId})
  if (!labelId) return;

  // console.log(labelId, FEEDS_BY_LABEL_ID)

  const feed = FEEDS_BY_LABEL_ID[labelId]
  if (!feed) return;
  const feedUrl = `${process.env.FEED_HOST}/${feed.feedSlug}`
  console.log({feedUrl});

  // const body = new FormData();
  const body = new URLSearchParams();
  body.append('hub.mode', 'publish');
  body.append('hub.url', feedUrl);

  const response = await fetch('https://kevinlinp-email-to-atom-feed.superfeedr.com/', {
    method: 'POST',
    body
  })
  console.log(response)
}
