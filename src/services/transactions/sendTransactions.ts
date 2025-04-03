import { Transaction } from '@multiversx/sdk-core/out';
import {
  SendTransactionReturnType,
  SendTransactionsPropsType,
  SimpleTransactionType
} from 'types';
import { getDefaultCallbackUrl } from 'utils/window';
import { signTransactions } from './signTransactions';
import { transformTransactionsToSign } from './utils/transformTransactionsToSign';

export async function sendTransactions({
  transactions,
  transactionsDisplayInfo,
  redirectAfterSign = true,
  callbackRoute = getDefaultCallbackUrl(),
  signWithoutSending = false,
  completedTransactionsDelay,
  sessionInformation,
  skipGuardian,
  minGasLimit,
  hasConsentPopup
}: SendTransactionsPropsType): Promise<SendTransactionReturnType> {
  try {
    console.log('sdk:sendTransactions', transactions);
    const transactionsPayload = Array.isArray(transactions)
      ? transactions
      : [transactions];
    console.log('sdk: transactionsPayload', transactionsPayload);
    const transactionsToSign = await transformTransactionsToSign({
      transactions: transactionsPayload as SimpleTransactionType[],
      minGasLimit
    });
    console.log('sdk: transactionsToSign', transactionsToSign);
    return signTransactions({
      transactions: transactionsToSign as Transaction[],
      minGasLimit,
      callbackRoute,
      transactionsDisplayInfo,
      customTransactionInformation: {
        redirectAfterSign,
        completedTransactionsDelay,
        sessionInformation,
        skipGuardian,
        signWithoutSending,
        hasConsentPopup
      }
    });
  } catch (err) {
    console.error('error signing transaction', err as any);
    return { error: err as any, sessionId: null };
  }
}
