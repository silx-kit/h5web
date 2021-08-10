import type { Story } from '@storybook/react';

function Center(MyStory: Story) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <MyStory />
    </div>
  );
}

export default Center;
