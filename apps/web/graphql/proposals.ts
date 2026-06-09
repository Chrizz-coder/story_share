import { gql } from '@apollo/client';

export const CREATE_PROPOSAL = gql`
  mutation CreateProposal($input: ProposalInput!) {
    createProposal(input: $input) {
      id
      recipientName
      senderName
      template
      customMessage
      theme
      music
      age
      nickname
      photoData
      createdAt
    }
  }
`;

export const GET_PROPOSAL = gql`
  query GetProposal($id: ID!) {
    getProposal(id: $id) {
      id
      recipientName
      senderName
      template
      customMessage
      theme
      music
      age
      nickname
      photoData
      viewCount
      accepted
      shareUnlocked
      createdAt
    }
  }
`;

export const UNLOCK_PROPOSAL_SHARING = gql`
  mutation UnlockProposalSharing($proposalId: ID!, $orderId: String!) {
    unlockProposalSharing(proposalId: $proposalId, orderId: $orderId) {
      id
      shareUnlocked
    }
  }
`;
