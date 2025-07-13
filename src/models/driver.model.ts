import mongoose, { Document, Schema } from 'mongoose';

export interface IDriver extends Document {
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

const driverSchema = new Schema<IDriver>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true },
);

export const Driver = mongoose.model<IDriver>('Driver', driverSchema);
