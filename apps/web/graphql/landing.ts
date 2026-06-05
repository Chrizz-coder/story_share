/* GraphQL operations for the landing page */
import { gql } from '@apollo/client';

export const CREATE_ORDER = gql`
  mutation CreateOrder(
    $productType: String!
    $productName: String!
    $amount: Int!
    $email: String!
    $metadata: String
  ) {
    createOrder(
      productType: $productType
      productName: $productName
      amount: $amount
      email: $email
      metadata: $metadata
    ) {
      id
      key
      orderId
      amount
      currency
      description
    }
  }
`;

export const VERIFY_PAYMENT = gql`
  mutation VerifyPayment(
    $orderId: String!
    $paymentId: String!
    $signature: String!
  ) {
    verifyPayment(
      orderId: $orderId
      paymentId: $paymentId
      signature: $signature
    ) {
      message
      orderId
      paymentId
    }
  }
`;
