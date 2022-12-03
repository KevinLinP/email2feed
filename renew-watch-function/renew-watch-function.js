import { getGmailClient } from './gmail-client.js'

const GMAIL_TOPIC_NAME = 'projects/positive-apex-369323/topics/gmail'

export const renewWatchFunction = async function (cloudEvent) {
  const gmail = await getGmailClient();

  let response
  if (cloudEvent.data.message?.attributes?.stop) {
    console.log('stopping ...')
    response = await gmail.users.stop({userId: 'me'})
  } else {
    response = await gmail.users.watch({
      userId: 'me',
      requestBody: {
        topicName: GMAIL_TOPIC_NAME,
      },
    });
  }
  console.log(response.status, response.data);

  return;
}
