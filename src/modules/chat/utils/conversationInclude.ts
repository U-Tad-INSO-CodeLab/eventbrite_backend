export const conversationQueryIncludeFields = {
  event_creator: {
    select: { id: true, username: true, name: true, surname: true },
  },
  event_sponsor: {
    select: { id: true, username: true, name: true, surname: true },
  },
  event: {
    select: {
      id: true,
      title: true,
      date: true,
      event_creator_id: true,
    },
  },
} as const;
