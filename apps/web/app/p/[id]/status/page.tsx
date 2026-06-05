'use client';

import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { Heart, Eye, CheckCircle2, XCircle } from 'lucide-react';
import styles from '../proposal.module.css';

const GET_PROPOSAL_STATS = gql`
  query GetProposalStats($id: ID!) {
    getProposal(id: $id) {
      id
      recipientName
      viewCount
      accepted
      createdAt
    }
  }
`;

export default function ProposalStatusPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { data, loading, error } = useQuery(GET_PROPOSAL_STATS, { variables: { id }, pollInterval: 5000 }); // Poll every 5s

  if (loading) return <div className={styles.loading}>Loading stats... 📊</div>;
  if (error || !data?.getProposal) return <div className={styles.loading}>Proposal not found 💔</div>;

  const proposal = data.getProposal;

  return (
    <div className={styles.container} style={{ background: '#111827' }}>
      <div className={styles.contentCard}>
        <h1 className={styles.questionText} style={{ fontSize: '32px' }}>Proposal Status</h1>
        <p className={styles.fromText}>For: {proposal.recipientName}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Eye size={24} color="#60a5fa" />
              <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Views</span>
            </div>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#60a5fa' }}>{proposal.viewCount}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {proposal.accepted ? <CheckCircle2 size={24} color="#34d399" /> : <XCircle size={24} color="#f87171" />}
              <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Status</span>
            </div>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: proposal.accepted ? '#34d399' : '#f87171' }}>
              {proposal.accepted ? 'Accepted! 🎉' : 'Waiting... ⏳'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
