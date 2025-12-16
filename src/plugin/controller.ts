// Show the plugin UI
figma.showUI(__html__, { width: 320, height: 240 });

// Initialize: send current selection count
sendSelectionCount();

// Listen for selection changes
figma.on('selectionchange', () => {
  sendSelectionCount();
});

// Send selection count to UI
function sendSelectionCount() {
  figma.ui.postMessage({
    type: 'selection-count',
    count: figma.currentPage.selection.length,
  });
}

// Listen for messages from UI
figma.ui.onmessage = (msg: { type: string; name?: string }) => {
  switch (msg.type) {
    case 'create-rect':
      createRectangle(msg.name);
      break;
    case 'close':
      figma.closePlugin();
      break;
  }
};

// Create a rectangle
function createRectangle(name?: string) {
  const rect = figma.createRectangle();
  rect.resize(100, 100);
  rect.fills = [{ type: 'SOLID', color: { r: 0.47, g: 0.33, b: 0.98 } }]; // Primary purple

  if (name) {
    rect.name = name;
  }

  // Add the rectangle to the current page
  figma.currentPage.appendChild(rect);

  // Select and focus on the newly created rectangle
  figma.currentPage.selection = [rect];
  figma.viewport.scrollAndZoomIntoView([rect]);

  // Notify success
  figma.notify(`Rectangle created${name ? `: ${name}` : ''}`);
}
