/**
 * lib/proposalAudio.ts
 *
 * Maps proposal template/category → its dedicated music file.
 * All music files live in /public/music/.
 *
 * To swap a track: replace the corresponding .mp3 in /public/music/.
 * No code changes needed.
 */

export type ProposalCategory = 'romantic' | 'marriage' | 'date' | 'birthday' | string;

/** Returns the public URL for a given proposal category's music. */
export function getCategoryMusicUrl(category: ProposalCategory): string {
  const map: Record<string, string> = {
    romantic: '/music/romantic.mp3',
    marriage: '/music/marriage.mp3',
    date: '/music/date-invitation.mp3',
    birthday: '/music/birthday.mp3',
  };
  return map[category] ?? map['romantic'];
}
