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
      photoData
      createdAt
    }
  }
`;
