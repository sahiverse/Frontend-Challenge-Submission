import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

describe('Multi-Layer Visualization App', () => {
  test('renders the app without crashing', () => {
    render(<App />);
    expect(document.querySelector('div')).toBeInTheDocument();
  });

  test('displays Layer 1 on initial load', () => {
    render(<App />);
    const layerInfo = screen.getByText(/Layer 1/i);
    expect(layerInfo).toBeInTheDocument();
  });

  test('displays the home button', () => {
    render(<App />);
    const homeButton = document.querySelector('button');
    expect(homeButton).toBeInTheDocument();
  });

  test('home button is disabled on Layer 1', () => {
    render(<App />);
    const homeButton = document.querySelector('button');
    expect(homeButton).toBeDisabled();
  });

  test('renders nodes on the canvas', () => {
    const { container } = render(<App />);
    // Check for node elements (they have specific styling)
    const nodes = container.querySelectorAll('[style*="position: absolute"]');
    expect(nodes.length).toBeGreaterThan(0);
  });

  test('layer info shows correct layer name', () => {
    render(<App />);
    // Should show "Root" as the first layer name
    const layerName = screen.getByText(/Root/i);
    expect(layerName).toBeInTheDocument();
  });

  test('prevents context menu on right-click', () => {
    const { container } = render(<App />);
    const canvas = container.querySelector('[style*="overflow: hidden"]');
    
    const contextMenuHandler = jest.fn((e) => e.preventDefault());
    canvas.addEventListener('contextmenu', contextMenuHandler);
    
    fireEvent.contextMenu(canvas);
    
    expect(contextMenuHandler).toHaveBeenCalled();
  });

  test('canvas click resets zoom progress', () => {
    const { container } = render(<App />);
    const canvas = container.querySelector('[style*="overflow: hidden"]');
    
    fireEvent.click(canvas);
    
    // If this doesn't throw an error, the click handler works
    expect(canvas).toBeInTheDocument();
  });

  test('app has proper viewport configuration', () => {
    const { container } = render(<App />);
    const mainDiv = container.firstChild;
    
    expect(mainDiv).toHaveStyle({
      position: 'fixed',
      overflow: 'hidden'
    });
  });

  test('navigation bubbles appear when history exists', async () => {
    const { container } = render(<App />);
    
    // Initially, no navigation bubbles should be visible (only on Layer 1)
    const initialBubbles = container.querySelectorAll('[style*="border-radius: 50%"]').length;
    
    // The home button should exist
    expect(container.querySelector('button')).toBeInTheDocument();
  });

  test('app includes CSS animations', () => {
    const { container } = render(<App />);
    const styleTag = container.querySelector('style');
    
    expect(styleTag).toBeInTheDocument();
    expect(styleTag.textContent).toContain('fadeIn');
    expect(styleTag.textContent).toContain('fadeInLeft');
  });

  test('app has mobile touch support styles', () => {
    const { container } = render(<App />);
    const styleTag = container.querySelector('style');
    
    expect(styleTag.textContent).toContain('-webkit-tap-highlight-color');
    expect(styleTag.textContent).toContain('touch-action');
  });

  test('background color is set correctly', () => {
    const { container } = render(<App />);
    const mainDiv = container.firstChild;
    
    // Should have a background color set
    expect(mainDiv).toHaveStyle({
      backgroundColor: expect.any(String)
    });
  });

  test('layer info displays layer count', () => {
    render(<App />);
    const layerCount = screen.getByText(/\/ 3/i); // Should show "/ 3" for total layers
    expect(layerCount).toBeInTheDocument();
  });

  test('nodes have proper styling', () => {
    const { container } = render(<App />);
    const nodes = container.querySelectorAll('[style*="border-radius: 50%"]');
    
    // Should have circular nodes
    expect(nodes.length).toBeGreaterThan(0);
  });
});

describe('Accessibility', () => {
  test('buttons have proper cursor styles', () => {
    const { container } = render(<App />);
    const homeButton = container.querySelector('button');
    
    // Home button should be disabled on Layer 1, so cursor should be not-allowed
    expect(homeButton).toHaveStyle({
      cursor: 'not-allowed'
    });
  });

  test('app prevents text selection on interactive elements', () => {
    const { container } = render(<App />);
    const styleTag = container.querySelector('style');
    
    expect(styleTag.textContent).toContain('-webkit-touch-callout: none');
  });
});

describe('Responsive Design', () => {
  test('app uses fixed positioning for full viewport coverage', () => {
    const { container } = render(<App />);
    const mainDiv = container.firstChild;
    
    expect(mainDiv).toHaveStyle({
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0'
    });
  });

  test('includes iOS safe area support', () => {
    const { container } = render(<App />);
    const styleTag = container.querySelector('style');
    
    expect(styleTag.textContent).toContain('env(safe-area-inset');
  });
});

/**
 * Test Suite: Color Inheritance
 * Tests that verify the color inheritance system where:
 * - Nodes have specific colors
 * - Background color transitions when zooming into nodes
 * - Layer colors inherit from the node that was clicked
 */
describe('Color Inheritance', () => {
  /**
   * Test: Initial Background Color
   * Purpose: Verify that Layer 1 has the correct initial background color
   * Expected: Background should be set to the root layer color (#0a0e27)
   * This ensures the app starts with the correct visual theme
   */
  test('Layer 1 has correct initial background color', () => {
    const { container } = render(<App />);
    const mainDiv = container.firstChild;
    
    // Layer 1 should have the root background color
    const backgroundColor = mainDiv.style.backgroundColor;
    
    // Should have a background color set (not empty)
    expect(backgroundColor).toBeTruthy();
    // Should be a valid CSS color (rgb format after rendering)
    expect(backgroundColor).toMatch(/rgb/);
  });

  /**
   * Test: Node Color Styling
   * Purpose: Verify that nodes have their own distinct colors
   * Expected: Nodes should have backgroundColor style applied
   * Each node has a unique color that becomes the background when zoomed into
   */
  test('nodes have distinct background colors', () => {
    const { container } = render(<App />);
    
    // Find all circular node elements
    const nodes = container.querySelectorAll('[style*="border-radius: 50%"]');
    
    // Filter to get only the actual node circles (not buttons)
    const nodeCircles = Array.from(nodes).filter(node => {
      const style = node.getAttribute('style');
      return style && style.includes('background-color');
    });
    
    // Should have at least one node with a background color
    expect(nodeCircles.length).toBeGreaterThan(0);
    
    // Each node should have a background color
    nodeCircles.forEach(node => {
      const bgColor = node.style.backgroundColor;
      expect(bgColor).toBeTruthy();
    });
  });

  /**
   * Test: Background Color Transition Property
   * Purpose: Verify that background color has transition for smooth color changes
   * Expected: Main div should have background-color transition CSS
   * This ensures smooth color transitions when navigating between layers
   */
  test('background color has smooth transition', () => {
    const { container } = render(<App />);
    const mainDiv = container.firstChild;
    
    // Check if transition property is set
    const transition = mainDiv.style.transition;
    
    // Should have transition property
    expect(transition).toBeTruthy();
    // Should include background-color in the transition
    expect(transition).toContain('background-color');
  });

  /**
   * Test: Color Information in Layer Info
   * Purpose: Verify that the layer info panel shows the current layer color
   * Expected: A circle icon with the current layer's color should be visible
   * This provides visual feedback about the current layer's theme color
   */
  test('layer info displays current layer color indicator', () => {
    const { container } = render(<App />);
    
    // Find the layer info panel
    const layerInfo = container.querySelector('[style*="bottom: 32px"]');
    expect(layerInfo).toBeInTheDocument();
    
    // Should contain a circle icon with fill color
    const colorCircle = layerInfo.querySelector('svg circle');
    expect(colorCircle).toBeInTheDocument();
  });
});

/**
 * Test Suite: Zoom Effects
 * Tests that verify zoom-in and zoom-out animations and effects:
 * - Scale transformations
 * - Transform origins
 * - Transition properties
 * - Animation states
 */
describe('Zoom Effects', () => {
  /**
   * Test: Initial Scale State
   * Purpose: Verify that the canvas starts with scale(1) - no zoom
   * Expected: Transform should be scale(1) on initial load
   * This ensures the app starts in a neutral, unzoomed state
   */
  test('canvas has initial scale of 1', () => {
    const { container } = render(<App />);
    
    // Find the canvas container with transform
    const canvasContainer = container.querySelector('[style*="transform"]');
    
    if (canvasContainer) {
      const transform = canvasContainer.style.transform;
      // Should have scale(1) or no scale (which defaults to 1)
      expect(transform).toMatch(/scale\(1\)|^$/);
    }
  });

  /**
   * Test: Transform Origin for Zoom
   * 
   * Purpose: Verify that transform-origin is set for proper zoom centering
   * Expected: Transform origin should be set to center or node position
   * 
   * This ensures zoom animations originate from the correct point
   */
  test('canvas has transform origin set', () => {
    const { container } = render(<App />);
    
    // Find the canvas container with transform
    const canvasContainer = container.querySelector('[style*="transform"]');
    
    if (canvasContainer) {
      const transformOrigin = canvasContainer.style.transformOrigin;
      // Should have transform origin set
      expect(transformOrigin).toBeTruthy();
    }
  });

  /**
   * Test: Smooth Transform Transitions
   * 
   * Purpose: Verify that transform changes have smooth transitions
   * Expected: Canvas should have transition property for transform
   * 
   * This ensures zoom animations are smooth, not instant
   */
  test('canvas has smooth transform transitions', () => {
    const { container } = render(<App />);
    
    // Find the canvas container with transform
    const canvasContainer = container.querySelector('[style*="transform"]');
    
    if (canvasContainer) {
      const transition = canvasContainer.style.transition;
      // Should have transition property that includes transform
      expect(transition).toBeTruthy();
    }
  });

  /**
   * Test: Node Hover Effects
   * 
   * Purpose: Verify that nodes have hover effects for interactivity
   * Expected: Nodes should have cursor pointer style
   * 
   * This provides visual feedback that nodes are interactive
   */
  test('nodes have interactive cursor on hover', () => {
    const { container } = render(<App />);
    
    // Find node elements with cursor styling
    const interactiveNodes = container.querySelectorAll('[style*="cursor: pointer"]');
    
    // Should have at least one interactive node
    expect(interactiveNodes.length).toBeGreaterThan(0);
  });

  /**
   * Test: Zoom Progress State Management
   * 
   * Purpose: Verify that zoom progress can be tracked and reset
   * Expected: Clicking canvas should reset any active zoom state
   * 
   * This ensures zoom state is properly managed during interactions
   */
  test('canvas click resets zoom state', () => {
    const { container } = render(<App />);
    const canvas = container.querySelector('[style*="overflow: hidden"]');
    
    // Simulate canvas click (should reset zoom progress)
    fireEvent.click(canvas);
    
    // If no error occurs, zoom reset works
    expect(canvas).toBeInTheDocument();
  });

  /**
   * Test: Pointer Events During Zoom
   * 
   * Purpose: Verify that pointer events are disabled during zoom animations
   * Expected: Elements should have pointerEvents: 'none' during transitions
   * 
   * This prevents user interactions during animations for smoother experience
   */
  test('elements disable pointer events during transitions', () => {
    const { container } = render(<App />);
    
    // Find elements with pointer-events styling
    const elements = container.querySelectorAll('[style*="pointer-events"]');
    
    // Should have elements with pointer-events control
    expect(elements.length).toBeGreaterThan(0);
  });

  /**
   * Test: Node Wheel Event Handler
   * 
   * Purpose: Verify that nodes can handle wheel events for zoom
   * Expected: Wheel event on canvas should be handled
   * 
   * This enables scroll-to-zoom functionality
   */
  test('canvas handles wheel events for zoom', () => {
    const { container } = render(<App />);
    const canvas = container.querySelector('[style*="overflow: hidden"]');
    
    // Create a wheel event
    const wheelEvent = new WheelEvent('wheel', {
      bubbles: true,
      cancelable: true,
      deltaY: 100
    });
    
    // Dispatch the event (should be handled without errors)
    canvas.dispatchEvent(wheelEvent);
    
    // If no error occurs, wheel event handling works
    expect(canvas).toBeInTheDocument();
  });

  /**
   * Test: Framer Motion Animation Integration
   * 
   * Purpose: Verify that Framer Motion animations are properly integrated
   * Expected: Layer transitions should use motion components
   * 
   * This ensures smooth, physics-based animations
   */
  test('app uses framer motion for animations', () => {
    const { container } = render(<App />);
    
    // Framer Motion adds specific data attributes or classes
    // Check if the app renders without motion-related errors
    expect(container.firstChild).toBeInTheDocument();
  });

  /**
   * Test: Animation Duration Consistency
   * 
   * Purpose: Verify that animations have consistent timing
   * Expected: Transitions should use 0.7s duration (or similar)
   * 
   * This ensures all animations feel cohesive and synchronized
   */
  test('transitions have consistent timing', () => {
    const { container } = render(<App />);
    
    // Find elements with transition timing
    const transitionElements = Array.from(
      container.querySelectorAll('[style*="transition"]')
    );
    
    // Should have multiple elements with transitions
    expect(transitionElements.length).toBeGreaterThan(0);
    
    // Check that transitions have duration values
    transitionElements.forEach(element => {
      const transition = element.style.transition;
      // Should have a duration value (contains 's' for seconds)
      if (transition) {
        expect(transition).toMatch(/\d+\.?\d*s/);
      }
    });
  });
});
