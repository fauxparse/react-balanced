import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import Balanced from '.';

const meta: Meta<typeof Balanced> = {
  title: 'Balanced',
  component: Balanced,
  argTypes: {
    style: {
      table: {
        disable: true,
      },
    },
    writingMode: {
      control: {
        type: 'radio',
      },
      options: ['horizontal-tb', 'vertical-rl', 'vertical-lr'],
    },
  },
  args: {
    as: 'h1',
    style: {
      backgroundColor: '#ddd',
      padding: '1rem',
    },
    writingMode: undefined,
    text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
  },
  render: ({ writingMode, text, ...args }) => (
    <div
      style={{
        resize: 'both',
        overflow: 'auto',
        backgroundColor: '#eee',
        writingMode,
      }}
    >
      <Balanced {...args}>{text}</Balanced>
    </div>
  ),
};

export default meta;

type Story = StoryObj<typeof Balanced>;

export const Basic: Story = {};

export const Vertical: Story = {
  args: {
    writingMode: 'vertical-rl',
    text: 'ちりも積もれば、山となるというからね。',
  },
};
