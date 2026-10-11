import { GraphQLError } from 'graphql';
import Proposal from '../../models/Proposal';
import Order from '../../models/Order';

export const ProposalQueries = {
  getProposal: async (_: any, { id }: { id: string }) => {
    try {
      const proposal = await Proposal.findById(id);
      if (!proposal) {
        throw new GraphQLError('Proposal not found');
      }
      // Ensure we map _id to id
      return {
        ...proposal.toObject(),
        id: proposal._id.toString(),
      };
    } catch (error) {
      console.error('Error fetching proposal:', error);
      throw new GraphQLError('Failed to fetch proposal');
    }
  },
};

export const ProposalMutations = {
  createProposal: async (_: any, { input }: { input: any }) => {
    try {
      const proposal = new Proposal(input);
      await proposal.save();
      return {
        ...proposal.toObject(),
        id: proposal._id.toString(),
      };
    } catch (error) {
      console.error('Error creating proposal:', error);
      throw new GraphQLError('Failed to create proposal');
    }
  },
  acceptProposal: async (_: any, { id }: { id: string }) => {
    try {
      const proposal = await Proposal.findByIdAndUpdate(
        id,
        { accepted: true },
        { new: true }
      );
      if (!proposal) throw new GraphQLError('Proposal not found');
      return {
        ...proposal.toObject(),
        id: proposal._id.toString(),
      };
    } catch (error) {
      console.error('Error accepting proposal:', error);
      throw new GraphQLError('Failed to accept proposal');
    }
  },
  incrementViewCount: async (_: any, { id }: { id: string }) => {
    try {
      const proposal = await Proposal.findByIdAndUpdate(
        id,
        { $inc: { viewCount: 1 } },
        { new: true }
      );
      if (!proposal) throw new GraphQLError('Proposal not found');
      return {
        ...proposal.toObject(),
        id: proposal._id.toString(),
      };
    } catch (error) {
      console.error('Error incrementing view count:', error);
      throw new GraphQLError('Failed to increment view count');
    }
  },
  unlockProposalSharing: async (_: any, { proposalId, orderId }: { proposalId: string; orderId: string }) => {
    try {
      const order = await Order.findOne({ orderId });
      if (!order) throw new GraphQLError('Order not found');
      if (order.paymentStatus !== 'success') throw new GraphQLError('Payment not verified');

      const proposal = await Proposal.findByIdAndUpdate(
        proposalId,
        { shareUnlocked: true },
        { new: true }
      );
      if (!proposal) throw new GraphQLError('Proposal not found');

      return {
        ...proposal.toObject(),
        id: proposal._id.toString(),
      };
    } catch (error) {
      console.error('Error unlocking proposal sharing:', error);
      throw new GraphQLError('Failed to unlock proposal sharing');
    }
  },
};
