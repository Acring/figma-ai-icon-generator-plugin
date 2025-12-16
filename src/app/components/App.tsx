import '../styles/ui.css';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Input } from './ui/input';

export default function App() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');

  useEffect(() => {
    // Listen to messages from the Figma plugin controller
    const handleMessage = (event: MessageEvent) => {
      const msg = event.data.pluginMessage;
      if (msg?.type === 'selection-count') {
        setCount(msg.count);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleCreate = () => {
    // Send message to the Figma plugin controller
    parent.postMessage({ pluginMessage: { type: 'create-rect', name } }, '*');
  };

  const handleClose = () => {
    parent.postMessage({ pluginMessage: { type: 'close' } }, '*');
  };

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Figma Plugin Template</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{count}</span> element(s) selected
          </p>
          <Input placeholder="Rectangle name" value={name} onChange={(e) => setName(e.target.value)} />
          <div className="flex gap-2">
            <Button onClick={handleCreate} className="flex-1">
              Create Rectangle
            </Button>
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
