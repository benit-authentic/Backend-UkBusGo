import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  user: mongoose.Types.ObjectId;
  type: 'recharge' | 'purchase';
  amount: number;
  status: 'pending' | 'success' | 'failed';
  identifier: string;
  txReference?: string;
  paymentReference?: string;
  network: 'FLOOZ' | 'TMONEY';
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    type: { type: String, enum: ['recharge', 'purchase'], required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
    identifier: { type: String, required: true, unique: true },
    txReference: { type: String },
    paymentReference: { type: String },
    network: { type: String, enum: ['FLOOZ', 'TMONEY'], required: true },
  },
  { timestamps: true },
);

export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);
