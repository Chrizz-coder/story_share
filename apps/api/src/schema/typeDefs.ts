import { gql } from 'graphql-tag';

export const typeDefs = gql`
  scalar Date

  type User {
    id: ID!
    email: String!
    username: String!
    displayName: String!
  }

  type Order {
    id: ID!
    orderId: String!
    email: String!
    amount: Int!
    currency: String!
    productType: String!
    productName: String!
    paymentStatus: String!
    razorpaySignature: String
    createdAt: Date!
  }

  type RazorpayOrder {
    id: ID!
    key: String!
    amount: Int!
    currency: String!
    description: String!
    orderId: String!
  }

  type PaymentSuccess {
    message: String!
    orderId: String!
    paymentId: String!
  }

  type Proposal {
    id: ID!
    recipientName: String!
    senderName: String!
    template: String!
    customMessage: String!
    theme: String!
    music: String!
    photoData: String
    viewCount: Int!
    accepted: Boolean!
    createdAt: Date!
  }

  input ProposalInput {
    recipientName: String!
    senderName: String!
    template: String!
    customMessage: String
    theme: String!
    music: String!
    photoData: String
  }

  type Query {
    hello: String!
    me: User
    getProposal(id: ID!): Proposal
  }

  type Mutation {
    createOrder(
      productType: String!
      productName: String!
      amount: Int!
      email: String!
      metadata: String
    ): RazorpayOrder!

    verifyPayment(
      orderId: String!
      paymentId: String!
      signature: String!
    ): PaymentSuccess!

    createProposal(input: ProposalInput!): Proposal!
    acceptProposal(id: ID!): Proposal!
    incrementViewCount(id: ID!): Proposal!
  }
`;
