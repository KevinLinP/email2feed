const FEED_DATA = [
  {
    feedSlug: 'the-new-paper',
    labelId: 'Label_1022511598545577874',
    title: 'The New Paper'
  },
  {
    feedSlug: 'hbr-weekly-hotlist',
    labelId: 'Label_2929678475469609016',
    title: 'Harvard Business Review - Weekly Hotlist'
  },
  {
    feedSlug: 'tldr',
    labelId: 'Label_2979225397234449442',
    title: 'TLDR'
  },
  {
    feedSlug: 'the-pragmatic-engineer',
    labelId: 'Label_8050679543859778915',
    title: 'The Pragmatic Engineer'
  },
  {
    feedSlug: 'bm-jackrabbit-speaks',
    labelId: 'Label_6650973556668765630',
    title: 'Burning Man: The Jackrabbit Speaks'
  },
  {
    feedSlug: 'ap-morning-wire',
    labelId: 'Label_7703303585995755413',
    title: 'Associated Press: The Morning Wire'
  }
]

const feedsByLabelIdArray = FEED_DATA.map((feed) => [feed.labelId, feed]);
export const FEEDS_BY_LABEL_ID = Object.fromEntries(feedsByLabelIdArray)

const feedsByFeedSlugArray = FEED_DATA.map((feed) => [feed.feedSlug, feed]);
export const FEEDS_BY_FEED_SLUG = Object.fromEntries(feedsByFeedSlugArray)
