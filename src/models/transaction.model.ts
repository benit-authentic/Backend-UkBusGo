import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  user: mongoose.Types.ObjectId;
  type: 'recharge' | 'purchase';
  amount: number;
  status: 'pending' | 'success' | 'failed';
  identifier: string;
  
  // Champs FedaPay (nouveaux)
  fedapay_transaction_id?: number;
  fedapay_reference?: string;
  merchant_reference?: string;
  
  // Anciens champs PayGate (conservés pour compatibilité)
  txReference?: string;
  paymentReference?: string;
  
  network: 'FLOOZ' | 'TMONEY' | 'AUTO';
  payment_method?: 'fedapay' | 'paygate'; // Pour distinguer les méthodes
  
  // Métadonnées FedaPay
  custom_metadata?: {
    student_id?: string;
    service?: string;
    network?: string;
    [key: string]: any;
  };
  
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
    
    // Champs FedaPay
    fedapay_transaction_id: { type: Number },
    fedapay_reference: { type: String },
    merchant_reference: { type: String },
    
    // Anciens champs PayGate
    txReference: { type: String },
    paymentReference: { type: String },
    
    network: { type: String, enum: ['FLOOZ', 'TMONEY', 'AUTO'], required: true },
    payment_method: { type: String, enum: ['fedapay', 'paygate'], default: 'fedapay' },
    
    // Métadonnées personnalisées
    custom_metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);
