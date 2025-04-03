import React from 'react';
import { SignModalPropsType } from 'types';

import {
  SignWaitingScreenModal,
  SignWaitingScreenModalPropsType
} from '../components';

export const SignWithBuidlyExtensionModal = (props: SignModalPropsType) => {
  const description = props.error
    ? props.error
    : props.transactions?.length > 1
      ? 'Check your Buidly Extension to sign the transactions'
      : 'Check your Buidly Extension to sign the transaction';

  const waitingScreenProps: SignWaitingScreenModalPropsType = {
    ...props,
    description,
    title: 'Confirm on Buidly Extension'
  };

  return <SignWaitingScreenModal {...waitingScreenProps} />;
};
