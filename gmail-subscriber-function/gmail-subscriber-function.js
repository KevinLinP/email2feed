import { getGmailClient } from './gmail-client.js'

export const gmailSubscriberFunction = async function (cloudEvent) {
  console.log(JSON.stringify({cloudEvent}));

  return;
}
