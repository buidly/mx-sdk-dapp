import React from 'react';
import { expect, jest } from '@storybook/jest';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { within, fireEvent } from '@storybook/testing-library';
import { BuidlyExtensionLoginButton as LoginBtn } from '../index';

export default {
  title: 'UI/BuidlyExtensionLoginButton',
  component: LoginBtn,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    backgroundColor: { control: 'color' }
  }
} as ComponentMeta<typeof LoginBtn>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof LoginBtn> = (args) => {
  return <LoginBtn {...args} />;
};

export const BudilyExtensionLoginButton = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args

BudilyExtensionLoginButton.args = {
  loginButtonText: 'Buidly Extension',
  onLoginRedirect: jest.fn(),
  'data-testid': 'buidly-extension-login-button'
};

BudilyExtensionLoginButton.parameters = { ...Template.parameters };
BudilyExtensionLoginButton.play = async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  const loginButton = await canvas.findByTestId(String(args['data-testid']));
  expect(args.onLoginRedirect).toHaveBeenCalledTimes(0);

  fireEvent.click(loginButton);
  expect(args.onLoginRedirect).toHaveBeenCalledTimes(1);
};
