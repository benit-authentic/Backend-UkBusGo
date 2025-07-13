import mongoose, { Document, Schema } from 'mongoose';

export interface IValidation extends Document {
  student: mongoose.Types.ObjectId;
  driver: mongoose.Types.ObjectId;
  amount: number;
  date: Date;
  isValid: boolean;
}

const validationSchema = new Schema<IValidation>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    driver: { type: Schema.Types.ObjectId, ref: 'Driver', required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    isValid: { type: Boolean, default: true },
  },
  { timestamps: false },
);

export const Validation = mongoose.model<IValidation>('Validation', validationSchema);
