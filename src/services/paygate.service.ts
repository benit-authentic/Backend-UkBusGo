const PAYGATE_STATUS_URL = 'https://paygateglobal.com/api/v2/status';

export interface PaygateStatusParams {
  identifier: string;
}

export const checkPaygateStatus = async (params: PaygateStatusParams) => {
  const payload = {
    auth_token: PAYGATE_API_KEY,
    identifier: params.identifier,
  };
  const { data } = await axios.post(PAYGATE_STATUS_URL, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  return data;
};
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const PAYGATE_API_KEY = process.env.PAYGATE_API_KEY || '';
const PAYGATE_URL = 'https://paygateglobal.com/api/v1/pay';

export interface PaygateInitParams {
  phone_number: string;
  amount: number;
  network: 'FLOOZ' | 'TMONEY';
  description?: string;
}

export const initiatePaygatePayment = async (params: PaygateInitParams) => {
  const identifier = uuidv4();
  const payload = {
    auth_token: PAYGATE_API_KEY,
    phone_number: params.phone_number,
    amount: params.amount,
    network: params.network,
    description: params.description || 'Recharge compte étudiant',
    identifier,
  };
  const { data } = await axios.post(PAYGATE_URL, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  return { ...data, identifier };
};
