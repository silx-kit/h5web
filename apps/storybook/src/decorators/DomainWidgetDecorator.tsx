import { type Decorator } from '@storybook/react-vite';

function DomainWidgetDecorator(...args: Parameters<Decorator>) {
  const [Story] = args;

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
