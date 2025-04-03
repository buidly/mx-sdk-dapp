import React, { ReactNode } from 'react';
import classNames from 'classnames';
import {
  CHROME_EXTENSION_LINK,
  DataTestIdsEnum,
  FIREFOX_ADDON_LINK
} from 'constants/index';
import { withStyles, WithStylesImportType } from 'hocs/withStyles';
import { useBuidlyExtensionLogin } from 'hooks/login/useBuidlyExtensionLogin';
import { getIsNativeAuthSingingForbidden } from 'services/nativeAuth/helpers';
import { LoginButton } from 'UI/LoginButton/LoginButton';
import { isWindowAvailable } from 'utils/isWindowAvailable';
import { OnProviderLoginType } from '../../../types';
import { WithClassnameType } from '../../types';
import { getIsBuidlyExtensionAvailable } from '../helpers';

export interface BuidlyExtensionLoginButtonPropsType
  extends WithClassnameType,
  OnProviderLoginType {
  children?: ReactNode;
  buttonClassName?: string;
  loginButtonText?: string;
  disabled?: boolean;
}

const BuidlyExtensionLoginButtonComponent: (
  props: BuidlyExtensionLoginButtonPropsType & WithStylesImportType
) => JSX.Element = ({
  token,
  className = 'dapp-buidly-extension-login',
  children,
  callbackRoute,
  buttonClassName = 'dapp-default-login-button',
  nativeAuth,
  loginButtonText = 'Buidly Extension',
  onLoginRedirect,
  disabled,
  'data-testid': dataTestId = DataTestIdsEnum.buidlyExtensionLoginButton,
  globalStyles,
  styles
}) => {
    const [onInitiateLogin] = useBuidlyExtensionLogin({
      callbackRoute,
      token,
      onLoginRedirect,
      nativeAuth
    });
    const disabledConnectButton = getIsNativeAuthSingingForbidden(token);
    const isFirefox = isWindowAvailable() && navigator.userAgent.indexOf('Firefox') != -1;
    const classes = {
      wrapper: classNames(
        globalStyles?.btn,
        globalStyles?.btnPrimary,
        globalStyles?.px4,
        globalStyles?.m1,
        globalStyles?.mx3,
        styles?.noBuidlyExtensionButtonWrapper,
        {
          [buttonClassName]: buttonClassName != null
        },
        className
      ),
      loginText: classNames(styles?.loginText, styles?.noExtensionButtonContent),
      wrapperClassName: className
    };

    const handleLogin = () => {
      onInitiateLogin();
    };

    return !getIsBuidlyExtensionAvailable() ? (
      <a
        rel='noreferrer'
        href={isFirefox ? FIREFOX_ADDON_LINK : CHROME_EXTENSION_LINK}
        target='_blank'
        className={classes.wrapper}
      >
        {children || <span className={classes.loginText}>{loginButtonText}</span>}
      </a>
    ) : (
      <LoginButton
        onLogin={handleLogin}
        className={className}
        btnClassName={buttonClassName}
        text={loginButtonText}
        disabled={disabled || disabledConnectButton}
        data-testid={dataTestId}
      >
        {children}
      </LoginButton>
    );
  };

export const BuidlyExtensionLoginButton = withStyles(BuidlyExtensionLoginButtonComponent, {
  ssrStyles: () =>
    import(
      'UI/buidlyExtension/BuidlyExtensionLoginButton/buidlyExtensionLoginButton.styles.scss'
    ),
  clientStyles: () =>
    require('UI/buidlyExtension/BuidlyExtensionLoginButton/buidlyExtensionLoginButton.styles.scss')
      .default
});
