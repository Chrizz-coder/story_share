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
    romantic: '/music/romantic.mp3?v=' + Date.now(),
    marriage: '/music/marriage.mp3?v=' + Date.now(),
    date: '/music/date-invitation.mp3?v=' + Date.now(),
    birthday: '/music/birthday.mp3?v=' + Date.now(),
  };
  return map[category] ?? map['romantic'];
}
