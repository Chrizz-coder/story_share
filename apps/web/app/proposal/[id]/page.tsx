import { redirect } from 'next/navigation';

/**
 * /proposal/[id] → /p/[id]
 *
 * The canonical shareable URL is now /p/[id].
 * This server component permanently redirects old /proposal/:id links.
 */
export default function ProposalLegacyRedirect({ params }: { params: { id: string } }) {
  redirect(`/p/${params.id}`);
}
