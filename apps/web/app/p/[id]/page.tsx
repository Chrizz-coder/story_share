'use client';

import React, { useEffect } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import RomanticExperience from '@/components/RomanticExperience';
import BirthdayExperience from '@/components/BirthdayExperience';

const GET_PROPOSAL = gql`
  query GetProposal($id: ID!) {
    getProposal(id: $id) {
      id
      recipientName
      senderName
      template
      customMessage
      music
      photoData
      accepted
      viewCount
    }
  }
`;

const INCREMENT_VIEW = gql`
  mutation IncrementViewCount($id: ID!) {
    incrementViewCount(id: $id) {
      id
      viewCount
    }
  }
`;

export default function ProposalPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const { data, loading, error } = useQuery(GET_PROPOSAL, { variables: { id } });
  const [incrementViewCount] = useMutation(INCREMENT_VIEW);

  const proposal = data?.getProposal;

  useEffect(() => {
    if (proposal) {
      incrementViewCount({ variables: { id } }).catch(() => {});
    }
  }, [proposal, id, incrementViewCount]);

  if (loading) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a0010' }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.2)', borderTopColor: '#ff4d79', animation: 'spinLoad 0.8s linear infinite' }} />
        <style>{`@keyframes spinLoad { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a0010', color: 'white' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>💔</div>
          <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 24, margin: 0 }}>Proposal Not Found</h2>
          <p style={{ opacity: 0.7, marginTop: 8 }}>This link is invalid or the proposal may have been deleted.</p>
          <a href="/" style={{ display: 'inline-block', marginTop: 24, color: 'white', textDecoration: 'none', background: 'rgba(255,255,255,0.15)', padding: '11px 24px', borderRadius: 50 }}>← Back Home</a>
        </div>
      </div>
    );
  }

  if (proposal.template === 'birthday') {
    return <BirthdayExperience proposal={proposal} />;
  }

  // Default to Romantic Experience
  return <RomanticExperience proposal={proposal} />;
}

