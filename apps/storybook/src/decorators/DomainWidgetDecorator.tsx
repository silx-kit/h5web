import { type StoryFn } from '@storybook/react-vite';

function DomainWidgetDecorator(Story: StoryFn) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        minHeight: '16rem',
      }}
    >
      <Story />
    </div>
  );
}

export default DomainWidgetDecorator;
