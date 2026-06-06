import mongoose, { Schema, Document } from 'mongoose';

export interface IProposal extends Document {
  recipientName: string;
  senderName: string;
  template: 'romantic' | 'marriage' | 'date' | 'birthday' | 'custom';
  customMessage?: string;
  theme: string;
  music: string;
  photoData?: string;
  viewCount: number;
  accepted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProposalSchema: Schema = new Schema(
  {
    recipientName: { type: String, required: true },
    senderName: { type: String, required: true },
    template: {
      type: String,
      enum: ['romantic', 'marriage', 'date', 'birthday', 'custom'],
      required: true,
    },
    customMessage: { type: String, default: '' },
    theme: { type: String, required: true },
    music: { type: String, required: true },
    photoData: { type: String }, // Optional Base64 or URL
    viewCount: { type: Number, default: 0 },
    accepted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// We rely on the implicit _id for querying.

export const Proposal = mongoose.models.Proposal || mongoose.model<IProposal>('Proposal', ProposalSchema);
export default Proposal;
