import { useRef, useState } from 'react';
import { useGetBadgesQuery } from '../generated/graphql';
import { z } from "zod";

const badgeSchema = z.object({
  imageURL: z.string().url(),
  setID: z.string(),
  version: z.string()
});

type Badge = z.infer<typeof badgeSchema>;

export function useGetBadges(login: string) {
  const { data } = useGetBadgesQuery({ variables: { login: login.trimEnd() } });
  const badgesRef = useRef<Record<string, string>>({});
  function addBadge(badge: unknown) {
    const b = badgeSchema.safeParse(badge);
    if (b.success) {
      badgesRef.current = { ...badgesRef.current, [`${b.data.setID}/${b.data.version}`]: b.data.imageURL };
    }
  }
  if (data?.badges) {
    for (const badge of data.badges) {
      addBadge(badge);
    }
  }
  if (data?.user?.broadcastBadges) {
    for (const badge of data.user.broadcastBadges) {
      addBadge(badge);
    }
  }
  const getBadge = (key: string): string | undefined => badgesRef.current[key];
  return {getBadge};
}
