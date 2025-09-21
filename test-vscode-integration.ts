// Test file for VS Code integration
import { useState } from 'react';
import fs from 'fs';
import path from 'path';

import { Button } from '@/components/ui/button';
import { getData } from '../features/test/service';

interface TestComponentProps {
  title?: string;
}

const TestComponent: React.FC<TestComponentProps> = ({ title = 'Test' }) => {
  const [data, setData] = useState<string | null>(null);

  const handleClick = () => {
    console.log('Button clicked');
    setData('Button was clicked');
  };

  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={handleClick}>Test Button</Button>
      {data && <p>{data}</p>}
    </div>
  );
};

export default TestComponent;
