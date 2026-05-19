import type { Meta, StoryObj } from '@storybook/react-vite';

import { CurrentColorTemplate } from './CurrentColor.template';
import currentColorTemplateRaw from './CurrentColor.template?raw';
import { FlagsTemplate } from './Flags.template';
import flagsTemplateRaw from './Flags.template?raw';
import { IconsTemplate } from './Icons.template';
import iconsTemplateRaw from './Icons.template?raw';
import { LoadersTemplate } from './Loaders.template';
import loadersTemplateRaw from './Loaders.template?raw';

const meta = {
  title: 'Icons/Icons',
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Icons: Story = {
  render: IconsTemplate,
  name: 'Список иконок',
  parameters: {
    docs: {
      source: {
        code: iconsTemplateRaw,
      },
    },
  },
};

export const Flags: Story = {
  render: FlagsTemplate,
  name: 'Флаги',
  parameters: {
    docs: {
      source: {
        code: flagsTemplateRaw,
      },
    },
  },
};

export const Loaders: Story = {
  render: LoadersTemplate,
  name: 'Использование иконок',
  parameters: {
    docs: {
      source: {
        code: loadersTemplateRaw,
      },
    },
  },
};

export const CurrentColor: Story = {
  render: CurrentColorTemplate,
  name: 'Заливка иконок',
  parameters: {
    docs: {
      source: {
        code: currentColorTemplateRaw,
      },
    },
  },
};
