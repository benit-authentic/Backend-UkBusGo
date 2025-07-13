import mongoose, { Document, Schema } from 'mongoose';

export interface IStudent extends Document {
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  balance: number;
  history: Array<{
    type: 'purchase' | 'validation';
    amount: number;
    date: Date;
    reference?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const studentSchema = new Schema<IStudent>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    balance: { type: Number, default: 0 },
    history: [
      {
        type: {
          type: String,
          enum: ['purchase', 'validation'],
          required: true,
        },
        amount: { type: Number, required: true },
        date: { type: Date, default: Date.now },
        reference: { type: String },
      },
    ],
  },
  { timestamps: true },
);

export const Student = mongoose.model<IStudent>('Student', studentSchema);
