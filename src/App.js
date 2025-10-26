/**
 * Multi-Layer Visualization Application
 * 
 * An interactive visualization app with smooth zoom animations and progressive navigation.
 * Users can explore hierarchical data through multiple layers with intuitive zoom interactions.
 * 
 * @module App
 * @version 1.0.0
 * 
 * ============================================================================
 * ARCHITECTURE OVERVIEW
 * ============================================================================
 * 
 * This application implements a multi-layer visualization system with:
 * - 3 hierarchical layers (Root → Categories → Details)
 * - Smooth zoom-in/zoom-out animations using Framer Motion
 * - Progressive zoom with mouse wheel/scroll
 * - Touch support for mobile devices
 * - Responsive design for all screen sizes
 * - Color inheritance from nodes to layer backgrounds
 * 
 * ============================================================================
 * KEY FEATURES
 * ============================================================================
 * 
 * 1. PROGRESSIVE ZOOM NAVIGATION
 *    - Scroll down on node: Zoom in progressively (0% → 100%)
 *    - Scroll up: Zoom out progressively (100% → 0%)
 *    - Threshold-based layer transitions (84% for Layer 1, 90% for others)
 *    - Smooth animations with 0.7s duration
 * 
 * 2. INTERACTION METHODS
 *    Desktop:
 *    - Click node: Start progressive zoom in
 *    - Scroll down: Continue zoom in
 *    - Scroll up: Zoom out
 *    - Right-click: Trigger reverse zoom-out transition
 *    - Home button: Return to Layer 1
 *    - Navigation bubbles: Jump to previous layers
 *    
 *    Mobile:
 *    - Tap node: Start progressive zoom in
 *    - Long-press (500ms): Trigger reverse zoom-out transition
 *    - Home button: Return to Layer 1
 *    - Navigation bubbles: Jump to previous layers
 * 
 * 3. ANIMATION SYSTEM
 *    - Zoom-in: Layer scales outward, next layer emerges from center
 *    - Zoom-out: Layer scales inward, previous layer emerges from edges
 *    - Background color transitions match node colors
 *    - Framer Motion for smooth, physics-based animations
 * 
 * 4. RESPONSIVE DESIGN
 *    - Dynamic node sizing based on viewport
 *    - Prevents node overlap on small screens
 *    - Touch-optimized for mobile devices
 *    - iOS safe area support
 *    - Full-screen viewport coverage
 * 
 * 5. STATE MANAGEMENT
 *    - Layer history tracking for navigation
 *    - Zoom progress state (0-100%)
 *    - Active zooming node tracking
 *    - Background color transitions
 *    - Transform origin management
 * 
 * ============================================================================
 * TECHNICAL STACK
 * ============================================================================
 * 
 * - React 19.2.0: UI framework
 * - Framer Motion 12.23.24: Animation library
 * - Lucide React 0.547.0: Icon library
 * - CSS-in-JS: Inline styles for dynamic theming
 * 
 * ============================================================================
 * DATA STRUCTURE
 * ============================================================================
 * 
 * Configuration object contains:
 * - canvas: Global canvas settings (background, dimensions)
 * - layers: Array of layer objects
 *   - id: Unique layer identifier
 *   - name: Display name for layer info
 *   - color: Theme color (inherited by background)
 *   - nodes: Array of interactive node objects
 *     - id: Unique node identifier
 *     - x, y: Position percentages (0-100)
 *     - label: Display text
 *     - children: ID of child layer or null
 * 
 * ============================================================================
 * PERFORMANCE OPTIMIZATIONS
 * ============================================================================
 * 
 * - Responsive scale calculation prevents node overlap
 * - Transform origin optimization for smooth zoom
 * - Pointer events disabled during animations
 * - Efficient state updates with React hooks
 * - Lazy-loaded animations with Framer Motion
 * 
 * ============================================================================
 */

// React core and hooks for state management and side effects
import React, { useState, useEffect, useRef } from 'react';
// Lucide icons for UI elements (Home button, layer indicator)
import { Home, Circle } from 'lucide-react';
// Framer Motion for smooth, physics-based animations
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ============================================================================
 * APPLICATION CONFIGURATION
 * ============================================================================
 * 
 * Default configuration defining the layer hierarchy and visual theme.
 * This can be easily modified to change the content and structure.
 * 
 * Structure: 3 Layers
 * - Layer 1 (Root): 1 node - "water cycle"
 * - Layer 2 (Categories): 2 nodes - "what is it?", "4 layers"
 * - Layer 3 (Details): 4 nodes in circular arrangement - Evaporation, Condensation, Precipitation, Collection
 */
const DEFAULT_CONFIG = {
  canvas: {
    backgroundColor: "#0a0e27",
    width: "100%",
    height: "100vh"
  },
  layers: [
    {
      id: "layer-1",
      name: "Root",
      color: "#2563eb", // Blue
      nodes: [
        { 
          id: "node-1", 
          x: 50, 
          y: 50, 
          label: "water cycle", 
          children: "layer-2" 
        }
      ]
    },
    {
      id: "layer-2",
      name: "Main Categories",
      color: "#7c3aed", // Purple
      nodes: [
        { 
          id: "node-2-1", 
          x: 43, // Moved 30% closer to center (from 40/60 to 43/57)
          y: 50, 
          label: "what is it ?", 
          children: "layer-3" 
        },
        { 
          id: "node-2-2", 
          x: 57, // Moved 30% closer to center (from 40/60 to 43/57)
          y: 50, 
          label: "4 layers", 
          children: "layer-3" 
        }
      ]
    },
    {
      id: "layer-3",
      name: "Details",
      color: "#34d399", // Teal
      nodes: [
        { 
          id: "node-3-1", 
          x: 60,  // Right of center (brought in from 65)
          y: 50,  // Middle
          label: "1. Evaporation", 
          children: null 
        },
        { 
          id: "node-3-2", 
          x: 50,  // Center
          y: 65,  // Below center (50 + 15)
          label: "2. Condensation", 
          children: null 
        },
        { 
          id: "node-3-3", 
          x: 40,  // Left of center (brought in from 35)
          y: 50,  // Middle
          label: "3. Precipitation", 
          children: null 
        },
        { 
          id: "node-3-4", 
          x: 50,  // Center
          y: 35,  // Above center (50 - 15)
          label: "4. Collection", 
          children: null 
        }
      ]
    }
  ]
};

/**
 * ============================================================================
 * UTILITY FUNCTIONS
 * ============================================================================
 */

/**
 * Calculate Responsive Scale Factor for Nodes
 * 
 * Dynamically calculates a scale factor to prevent node overlap on small screens.
 * This ensures nodes remain visible and don't collide, while maintaining their
 * relative positions defined in the configuration.
 * 
 * Algorithm:
 * 1. Check all pairs of nodes for potential overlap
 * 2. Calculate minimum distance between each pair
 * 3. If distance is too small, calculate required scale reduction
 * 4. Check boundary conditions to prevent nodes from going off-screen
 * 5. Return the minimum scale factor needed to prevent all overlaps
 * 
 * @param {Object} viewport - Viewport dimensions {width, height} in pixels
 * @param {Array} allNodes - Array of node objects with x, y positions (percentages)
 * @param {number} baseSize - Base node size in pixels before scaling
 * @returns {number} Scale factor between 0.3 and 1.0
 * 
 * @example
 * const scale = calculateResponsiveScale(
 *   { width: 375, height: 667 },  // iPhone viewport
 *   [{ x: 40, y: 50 }, { x: 60, y: 50 }],  // Two nodes
 *   165  // Base size
 * );
 * // Returns: 0.8 (nodes need to be 80% of original size to fit)
 */
const calculateResponsiveScale = (viewport, allNodes, baseSize) => {
  // Early return if insufficient data
  if (!viewport || !allNodes || allNodes.length <= 1) return 1;
  
  const { width, height } = viewport;
  let minScale = 1; // Start with no scaling (100%)
  
  /**
   * STEP 1: Check all pairs of nodes for potential overlap
   * 
   * Uses nested loops to compare every node with every other node.
   * Time complexity: O(n²) where n is number of nodes.
   * This is acceptable since we typically have < 10 nodes per layer.
   */
  for (let i = 0; i < allNodes.length; i++) {
    for (let j = i + 1; j < allNodes.length; j++) {
      const node1 = allNodes[i];
      const node2 = allNodes[j];
      
      // Convert percentage positions (0-100) to pixel coordinates
      const x1 = (node1.x / 100) * width;
      const y1 = (node1.y / 100) * height;
      const x2 = (node2.x / 100) * width;
      const y2 = (node2.y / 100) * height;
      
      // Calculate Euclidean distance between node centers
      const dx = x2 - x1;
      const dy = y2 - y1;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      /**
       * Minimum required distance calculation:
       * - baseSize is the diameter of one node
       * - 1.2 multiplier adds 20% gap between nodes for visual breathing room
       * - This ensures nodes don't touch or overlap
       */
      const minDistance = baseSize * 1.2;
      
      // If nodes are too close, calculate how much we need to scale down
      if (distance < minDistance && distance > 0) {
        const requiredScale = distance / minDistance;
        minScale = Math.min(minScale, requiredScale);
      }
    }
  }
  
  /**
   * STEP 2: Check boundary conditions
   * 
   * Ensures no node extends beyond the viewport edges.
   * Each node is checked against all four boundaries (left, right, top, bottom).
   * The 0.95 multiplier adds a 5% safety margin from edges.
   */
  for (const node of allNodes) {
    const x = (node.x / 100) * width;
    const y = (node.y / 100) * height;
    const radius = (baseSize * minScale) / 2;
    
    // Define safe boundaries (accounting for node radius)
    const leftBound = radius;
    const rightBound = width - radius;
    const topBound = radius;
    const bottomBound = height - radius;
    
    // Check left boundary
    if (x < leftBound) {
      const requiredScale = (x / (baseSize / 2)) * minScale;
      minScale = Math.min(minScale, requiredScale * 0.95);
    }
    // Check right boundary
    if (x > rightBound) {
      const requiredScale = ((width - x) / (baseSize / 2)) * minScale;
      minScale = Math.min(minScale, requiredScale * 0.95);
    }
    // Check top boundary
    if (y < topBound) {
      const requiredScale = (y / (baseSize / 2)) * minScale;
      minScale = Math.min(minScale, requiredScale * 0.95);
    }
    // Check bottom boundary
    if (y > bottomBound) {
      const requiredScale = ((height - y) / (baseSize / 2)) * minScale;
      minScale = Math.min(minScale, requiredScale * 0.95);
    }
  }
  
  /**
   * STEP 3: Clamp scale to reasonable bounds
   * 
   * - Maximum: 1.0 (never scale up, only down)
   * - Minimum: 0.3 (don't scale below 30% - nodes become too small)
   * 
   * This ensures nodes remain visible even on very small screens.
   */
  return Math.max(0.3, Math.min(1, minScale));
};

/**
 * ============================================================================
 * NODE COMPONENT
 * ============================================================================
 * 
 * Renders an interactive circular node with label.
 * Handles click, scroll, and touch interactions for zoom navigation.
 */

// Node Component
const Node = ({ node, onClick, scale, isZooming, isFirstLayer, textOpacity, layerColor, zoomProgress, onZoomProgress, viewport, allNodes, clickZoomIntervalRef }) => {
  const baseSize = 165; // Increased from 110 (50% larger)
  
  // Calculate responsive scale to prevent overlap on small screens
  const responsiveScale = viewport && allNodes 
    ? calculateResponsiveScale(viewport, allNodes, baseSize)
    : 1;
  
  // Apply zoom progress - Different scaling for different layers
  // Layer 1: Individual node scaling
  // Layer 2+: No individual node scaling - canvas handles all zooming
  const nodeScale = node.children && zoomProgress > 0 && isFirstLayer
    ? (1 + (zoomProgress / 100) * 9) // 1x to 10x for Layer 1 only
    : 1;
  
  // Apply responsive scale to prevent overlap
  const size = isFirstLayer 
    ? baseSize * scale * nodeScale * responsiveScale 
    : baseSize * responsiveScale;
  const fontSize = isFirstLayer 
    ? 18 * scale * nodeScale * responsiveScale 
    : Math.max(12, Math.min(18, 18 * responsiveScale));
  // Keep border thin and constant
  const borderWidth = 2;
  
  // Handle wheel on node - progressive zoom in and out
  const handleNodeWheel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isZooming) return;
    
    // Handle scroll down (zoom in) - only if node has children
    if (e.deltaY > 0 && node.children) {
      if (onZoomProgress) {
        // Progressive zoom for any layer
        onZoomProgress(node, e.deltaY);
      } else {
        // Instant transition if no zoom handler
        onClick(node);
      }
    }
    // Handle scroll up (zoom out) on any node when not on first layer
    else if (e.deltaY < 0 && !isFirstLayer && onZoomProgress) {
      // Pass the node for zoom out
      onZoomProgress(node, e.deltaY);
    }
  };

  // Handle right-click on node - trigger smooth reverse transition
  const handleNodeRightClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isZooming) return;

    // On layer 1, right-click does nothing (no zoom out possible)
    if (isFirstLayer) return;

    // If there's active zoom progress, decrease it progressively
    if (zoomProgress > 0 && onZoomProgress) {
      onZoomProgress(node, -5); // Progressive zoom out
    } else {
      // Otherwise trigger smooth reverse transition
      window.dispatchEvent(new CustomEvent('triggerReverseTransition'));
    }
  };

  // Mobile touch support - long press for progressive zoom out
  const [touchStartTime, setTouchStartTime] = React.useState(null);
  const [touchTimer, setTouchTimer] = React.useState(null);

  const handleTouchStart = (e) => {
    if (isZooming) return;

    setTouchStartTime(Date.now());

    // Set a timer for long press (500ms) - trigger smooth reverse transition
    const timer = setTimeout(() => {
      // Long press detected - trigger smooth reverse transition
      if (!isZooming && !isFirstLayer) {
        // If there's active zoom progress, decrease it progressively
        if (zoomProgress > 0 && onZoomProgress) {
          onZoomProgress(node, -5); // Progressive zoom out
        } else {
          // Otherwise trigger smooth reverse transition
          window.dispatchEvent(new CustomEvent('triggerReverseTransition'));
        }
      }
    }, 500);

    setTouchTimer(timer);
  };

  const handleTouchEnd = (e) => {
    // Clear the long press timer
    if (touchTimer) {
      clearTimeout(touchTimer);
      setTouchTimer(null);
    }
    
    // If it was a quick tap (not a long press), treat it as a click
    const touchDuration = Date.now() - (touchStartTime || 0);
    if (touchDuration < 500 && node.children && !isZooming && onZoomProgress && zoomProgress === 0) {
      // Simulate click for zoom in
      if (clickZoomIntervalRef && clickZoomIntervalRef.current) {
        clearInterval(clickZoomIntervalRef.current);
      }
      
      const zoomInterval = setInterval(() => {
        onZoomProgress(node, 5);
      }, 16);
      
      if (clickZoomIntervalRef) {
        clickZoomIntervalRef.current = zoomInterval;
      }
      
      const duration = isFirstLayer ? 2000 : 2500;
      setTimeout(() => {
        clearInterval(zoomInterval);
        if (clickZoomIntervalRef && clickZoomIntervalRef.current === zoomInterval) {
          clickZoomIntervalRef.current = null;
        }
      }, duration);
    }
    
    setTouchStartTime(null);
  };
  
  return (
    <div
      style={{
        position: 'absolute',
        left: `${node.x}%`,
        top: `${node.y}%`,
        transform: 'translate(-50%, -50%)',
        pointerEvents: isZooming ? 'none' : 'auto',
        zIndex: 10,
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'transform 0.3s',
        WebkitTapHighlightColor: 'transparent', // Remove tap highlight on mobile
        WebkitTouchCallout: 'none' // Disable callout on iOS
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (node.children && !isZooming && onZoomProgress) {
          // Set this node as the zooming target if not already set
          if (zoomProgress === 0) {
            // Clear any existing interval
            if (clickZoomIntervalRef && clickZoomIntervalRef.current) {
              clearInterval(clickZoomIntervalRef.current);
            }
            
            // Simulate scroll zoom by progressively increasing zoom
            const zoomInterval = setInterval(() => {
              onZoomProgress(node, 5); // Simulate scroll delta
            }, 16); // ~60fps
            
            // Store interval in ref so it can be cleared during transition
            if (clickZoomIntervalRef) {
              clickZoomIntervalRef.current = zoomInterval;
            }
            
            // Duration needs to be longer for layer 2+ to reach maxProgress threshold
            // Layer 0: needs to reach 84, so ~2000ms
            // Layer 2+: needs to reach 90+ (or maxProgress), so ~2500ms to ensure completion
            const duration = isFirstLayer ? 2000 : 2500;
            setTimeout(() => {
              clearInterval(zoomInterval);
              if (clickZoomIntervalRef && clickZoomIntervalRef.current === zoomInterval) {
                clickZoomIntervalRef.current = null;
              }
            }, duration);
          }
        }
      }}
      onWheel={handleNodeWheel}
      onContextMenu={handleNodeRightClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        style={{
          backgroundColor: layerColor,
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `${borderWidth}px solid rgba(255, 255, 255, 0.3)`,
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)', // Safari support
          cursor: node.children ? 'pointer' : 'default',
          touchAction: 'manipulation', // Improve touch response
          boxShadow: `0 10px 40px ${layerColor}40, 0 0 0 2px ${layerColor}20`,
          transition: 'width 0.1s ease-out, height 0.1s ease-out, box-shadow 0.3s',
          opacity: 1
        }}
        onMouseEnter={(e) => {
          if (node.children) {
            e.currentTarget.style.boxShadow = `0 0 25px ${layerColor}80, 0 0 15px ${layerColor}60, 0 0 5px ${layerColor}40`;
          }
        }}
        onMouseLeave={(e) => {
          if (node.children) {
            e.currentTarget.style.boxShadow = `0 10px 40px ${layerColor}40, 0 0 0 2px ${layerColor}20`;
          }
        }}
      >
        <div
          style={{ 
            color: 'white',
            fontWeight: 'bold',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            padding: '0 12px',
            fontSize: `${fontSize}px`,
            opacity: node.children && zoomProgress > 0 
              ? (isFirstLayer 
                  ? Math.max(0, 1 - (zoomProgress / 120)) // Slower fade: was 95, now 120
                  : (zoomProgress >= 60 ? Math.max(0, 1 - ((zoomProgress - 60) / 30)) : 1)) * (textOpacity !== undefined ? textOpacity : 1) // Slower fade for Layer 2: starts at 60%, ends at 90%
              : (textOpacity !== undefined ? textOpacity : 1),
            textShadow: '0 2px 8px rgba(0,0,0,0.5)',
            transition: 'opacity 0.1s ease-out, font-size 0.1s ease-out'
          }}
        >
          {node.label}
        </div>
      </div>
    </div>
  );
};

// Layer Component
const Layer = ({ 
  layer, 
  onNodeClick, 
  direction, 
  scale, 
  panX, 
  panY, 
  isZooming, 
  isFirstLayer, 
  fadeOpacity, 
  textOpacity,
  isAnimating,
  zoomProgress,
  zoomingNode,
  onZoomProgress,
  silentTransition,
  viewport,
  clickZoomIntervalRef
}) => {
  // Define animation variants based on zoom direction
  const variants = {
    enter: {
      scale: direction > 0 ? 0.85 : 1.25,
      opacity: 0,
      filter: direction > 0 ? 'blur(0px)' : 'blur(10px)'
    },
    center: {
      scale: 1,
      opacity: fadeOpacity !== undefined ? fadeOpacity : 1,
      filter: 'blur(0px)'
    },
    exit: {
      scale: direction > 0 ? 1.25 : 0.85,
      opacity: 0,
      filter: direction > 0 ? 'blur(10px)' : 'blur(0px)'
    }
  };

  const transition = {
    duration: silentTransition ? 0 : 0.7,
    ease: [0.22, 1, 0.36, 1]
  };

  const containerStyle = { 
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transformOrigin: 'center center',
    pointerEvents: isZooming ? 'none' : 'auto'
  };

  const content = (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {layer.nodes.map((node) => (
        <Node
          key={node.id}
          node={node}
          onClick={onNodeClick}
          scale={scale}
          isZooming={isZooming}
          isFirstLayer={isFirstLayer}
          textOpacity={isFirstLayer ? textOpacity : undefined}
          layerColor={layer.color}
          zoomProgress={zoomingNode?.id === node.id ? zoomProgress : 0}
          onZoomProgress={onZoomProgress}
          viewport={viewport}
          allNodes={layer.nodes}
          clickZoomIntervalRef={clickZoomIntervalRef}
        />
      ))}
    </div>
  );

  // Use regular div for silent transitions to avoid any animation
  if (silentTransition) {
    return (
      <div key={layer.id} style={containerStyle}>
        {content}
      </div>
    );
  }

  // Use motion.div for normal transitions
  return (
    <motion.div
      key={layer.id}
      initial="enter"
      animate="center"
      exit="exit"
      variants={variants}
      transition={transition}
      style={containerStyle}
    >
      {content}
    </motion.div>
  );
};

// Navigation Bubbles
const NavigationBubbles = ({ history, onNavigate, currentIndex }) => {
  // Exclude the first history item (Layer 1) since users use home button for that
  const navigableHistory = history.slice(1);
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {navigableHistory.map((item, index) => {
        // Adjust the index since we're slicing the array
        const actualIndex = index + 1;
        
        return (
          <button
            key={actualIndex}
            style={{
              position: 'relative',
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              animation: `fadeInLeft 0.3s ease-out ${index * 0.08}s both`
            }}
            onClick={() => onNavigate(actualIndex)}
          >
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: item.color,
                opacity: actualIndex === currentIndex ? 1 : 0.6,
                border: actualIndex === currentIndex ? '3px solid white' : '2px solid rgba(255, 255, 255, 0.6)',
                boxShadow: actualIndex === currentIndex ? `0 0 25px ${item.color}, 0 0 10px ${item.color}` : '0 2px 8px rgba(0,0,0,0.3)',
                transition: 'all 0.3s'
              }}
            />
          </button>
        );
      })}
    </div>
  );
};


// Main App Component
export default function App() {
  const [config] = useState(DEFAULT_CONFIG);
  const [currentLayerIndex, setCurrentLayerIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [backgroundColor, setBackgroundColor] = useState(config.canvas.backgroundColor);
  const [history, setHistory] = useState([
    { 
      layerIndex: 0, 
      color: config.canvas.backgroundColor, 
      name: config.layers[0].name,
      nodeColor: config.canvas.backgroundColor 
    }
  ]);
  const [scale, setScale] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const [nextLayerOpacity, setNextLayerOpacity] = useState(0);
  const [textOpacity, setTextOpacity] = useState(1);
  const [zoomProgress, setZoomProgress] = useState(0); // 0 to 100
  const [zoomingNode, setZoomingNode] = useState(null);
  const [silentTransition, setSilentTransition] = useState(false);
  const [viewport, setViewport] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [clickedNodes, setClickedNodes] = useState({}); // Track which node was clicked for each layer
  const clickZoomIntervalRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentLayer = config.layers[currentLayerIndex];
  const nextLayer = currentLayerIndex < config.layers.length - 1 ? config.layers[currentLayerIndex + 1] : null;
  const prevLayer = currentLayerIndex > 0 ? config.layers[currentLayerIndex - 1] : null;


  // Handle progressive zoom on scroll
  const handleZoomProgress = (node, deltaY) => {
    // Allow zoom progress on any layer, but not during transition
    if (isZooming) return;
    
    // For zoom in (deltaY > 0), require node to have children
    if (deltaY > 0 && !node.children) return;
    
    // For zoom out (deltaY < 0), if there's no active zoom progress, trigger smooth reverse transition
    if (deltaY < 0 && zoomProgress === 0 && currentLayerIndex > 0) {
      handleReverseLayerTransition();
      return;
    }
    
    // Update the zooming node for zoom in only if not already zooming
    if (deltaY > 0 && zoomProgress === 0) {
      setZoomingNode(node);
    }
    
    setZoomProgress(prev => {
      const maxNodeSize = Math.min(viewport.width, viewport.height) * 0.95 * 1.75; // 75% more zoom (1.5 + 0.25)
      const baseNodeSize = 165; // from Node component
      
      // Calculate responsive scale for current layer to account for smaller screens
      const responsiveScale = calculateResponsiveScale(viewport, currentLayer.nodes, baseNodeSize);
      const initialNodeSize = baseNodeSize * responsiveScale; // Actual starting size on current screen
      
      const maxScale = maxNodeSize / initialNodeSize;
      const maxProgress = (maxScale - 1) / (8 / 100); // from canvas scale calculation (8x multiplier)

      // Use the same sensitivity for all layers
      const zoomSensitivity = 0.15;
      const increment = deltaY * zoomSensitivity;
      let newProgress = Math.max(0, prev + increment);

      if (currentLayerIndex > 0) {
        newProgress = Math.min(maxProgress, newProgress);
      } else {
        newProgress = Math.min(200, newProgress);
      }

      // Handle zoom in transition (forward)
      const transitionThreshold = currentLayerIndex === 0 ? 84 : 90; // Layer 2 transitions at 90% (more zoom before transition)
      if (newProgress >= transitionThreshold && prev < transitionThreshold && node.children) {
        // Trigger silent transition without animation
        requestAnimationFrame(() => {
          handleSilentLayerTransition(node);
        });
      }
      
      // Handle zoom out transition (backward) - when zoom progress reaches 0
      if (newProgress === 0 && prev > 0 && currentLayerIndex > 0) {
        // Reset zooming node
        setZoomingNode(null);
        // Trigger smooth reverse zoom-out animation
        requestAnimationFrame(() => {
          handleReverseLayerTransition();
        });
      }
      
      return newProgress;
    });
  };
  
  // Reset zoom progress when clicking on canvas
  const handleCanvasClick = () => {
    if (zoomProgress > 0) {
      setZoomProgress(0);
      setZoomingNode(null);
    }
  };
  
  // Handle reverse layer transition (smooth zoom-out animation)
  const handleReverseLayerTransition = () => {
    if (currentLayerIndex === 0 || history.length <= 1) return;
    
    const prevHistory = history[history.length - 2];
    
    // Start the reverse transition animation
    setIsZooming(true);
    setDirection(-1); // Reverse direction
    
    // Update background color to previous layer's color
    setBackgroundColor(prevHistory.color);
    
    // Update layer immediately for AnimatePresence to work
    setTimeout(() => {
      setCurrentLayerIndex(prevHistory.layerIndex);
      setScale(1);
      setPanX(0);
      setPanY(0);
      setHistory(prev => prev.slice(0, -1));
    }, 50);
    
    // End the transition after animation completes (0.7s)
    setTimeout(() => setIsZooming(false), 750);
  };

  // Handle silent layer transition (no animation)
  const handleSilentLayerTransition = (node) => {
    if (!node.children) return;
    
    const targetLayerIndex = config.layers.findIndex(l => l.id === node.children);
    if (targetLayerIndex === -1) return;
    
    // Get the color from the clicked node
    const nodeColor = node.color || currentLayer.color;
    
    // Clear any active click zoom interval
    if (clickZoomIntervalRef.current) {
      clearInterval(clickZoomIntervalRef.current);
      clickZoomIntervalRef.current = null;
    }
    
    // Reset zoom progress immediately
    setZoomProgress(0);
    setZoomingNode(null);
    
    // Enable silent transition mode
    setSilentTransition(true);
    
    // Update layer immediately without animation
    setCurrentLayerIndex(targetLayerIndex);
    // Always inherit background color from the node being zoomed into
    setBackgroundColor(nodeColor);
    setScale(1);
    setPanX(0);
    setPanY(0);
    
    // Update history only if not already at this layer
    setHistory(prev => {
      // Check if we're already tracking this layer
      if (prev.length > 0 && prev[prev.length - 1].layerIndex === targetLayerIndex) {
        return prev;
      }
      return [
        ...prev,
        { 
          layerIndex: targetLayerIndex, 
          color: nodeColor,
          name: config.layers[targetLayerIndex].name,
          nodeColor: nodeColor,
          clickedNode: node // Record the clicked node for rewind functionality
        }
      ];
    });
    
    // Reset silent transition flag after a brief delay to ensure smooth transition
    setTimeout(() => {
      setSilentTransition(false);
    }, 50);
    
    // Keep zoom progress and zooming node active to maintain visual state
    // They will be reset when user stops scrolling or clicks
  };

  // Handle node click
  const handleNodeClick = (node) => {
    if (!node.children || isZooming) return;

    const targetLayerIndex = config.layers.findIndex(l => l.id === node.children);
    if (targetLayerIndex === -1) return;
    
    // Reset zoom progress
    setZoomProgress(0);
    setZoomingNode(null);
    
    // Get the color from the clicked node
    const nodeColor = node.color || currentLayer.color;
    
    // Start the transition
    setIsZooming(true);
    setDirection(1);
    
    // Update the background color immediately to start the transition
    // Always inherit background color from the node being zoomed into
    setBackgroundColor(nodeColor);
    
    // Update layer immediately for AnimatePresence to work
    setTimeout(() => {
      setCurrentLayerIndex(targetLayerIndex);
      setScale(1);
      setPanX(0);
      setPanY(0);
      
      setHistory(prev => [
        ...prev,
        { 
          layerIndex: targetLayerIndex, 
          color: nodeColor, // This becomes the background for the next layer
          name: config.layers[targetLayerIndex].name,
          nodeColor: nodeColor, // Store the node color that triggered this transition
          clickedNode: node // Record the clicked node for rewind functionality
        }
      ]);
    }, 50);
    
    // End the transition after animation completes (0.7s)
    setTimeout(() => setIsZooming(false), 750);
  };

  // Handle home button
  const handleHome = () => {
    if (currentLayerIndex === 0 || isZooming) return;
    
    setIsZooming(true);
    setDirection(-1);
    
    // Get the root background color (Layer 1)
    const rootColor = config.canvas.backgroundColor;
    
    // Update the background color immediately to start the reverse transition
    setBackgroundColor(rootColor);
    
    // Update layer immediately for AnimatePresence to work
    setTimeout(() => {
      setCurrentLayerIndex(0);
      setScale(1);
      setPanX(0);
      setPanY(0);
      
      // Reset ALL zoom-related state to ensure re-zooming works
      setZoomProgress(0);
      setZoomingNode(null);
      
      // Clear any active intervals
      if (clickZoomIntervalRef.current) {
        clearInterval(clickZoomIntervalRef.current);
        clickZoomIntervalRef.current = null;
      }
      
      setHistory([{ 
        layerIndex: 0, 
        color: rootColor, 
        name: config.layers[0].name,
        nodeColor: rootColor
      }]);
    }, 50);
    
    // End the transition after animation completes (0.7s)
    setTimeout(() => setIsZooming(false), 750);
  };

  // Handle bubble navigation
  const handleNavigate = (index) => {
    if (index === history.length - 1 || isZooming) return;

    const target = history[index];
    setIsZooming(true);
    setDirection(index < history.length - 1 ? -1 : 1);
    
    // Update the background color from the target history item (inherits from the layer we're going to)
    setBackgroundColor(target.color);
    
    // Update layer immediately for AnimatePresence to work
    setTimeout(() => {
      setCurrentLayerIndex(target.layerIndex);
      setScale(1);
      setPanX(0);
      setPanY(0);
      
      // If navigating back to layer 1, reset ALL zoom-related state to ensure re-zooming works
      if (target.layerIndex === 0) {
        setZoomProgress(0);
        setZoomingNode(null);
        
        // Clear any active intervals
        if (clickZoomIntervalRef.current) {
          clearInterval(clickZoomIntervalRef.current);
          clickZoomIntervalRef.current = null;
        }
      }
      
      setHistory(prev => prev.slice(0, index + 1));
    }, 50);
    
    // End the transition after animation completes (0.7s)
    setTimeout(() => setIsZooming(false), 750);
  };

  // Handle mouse wheel on canvas - zoom out on scroll up
  const handleWheel = (e) => {
    e.preventDefault();
    
    // Handle scroll up (zoom out) when not on Layer 1
    if (e.deltaY < 0 && currentLayerIndex > 0 && !isZooming) {
      // If there's active zoom progress, decrease it
      if (zoomProgress > 0) {
        handleZoomProgress(zoomingNode, e.deltaY);
      } else {
        // Otherwise trigger smooth reverse transition
        handleReverseLayerTransition();
      }
    }
  };

  // Handle mouse drag - disabled
  const handleMouseDown = (e) => {
    // Dragging disabled
  };

  const handleMouseMove = (e) => {
    // Dragging disabled
  };

  const handleMouseUp = () => {
    // Dragging disabled
  };

  // Handle right-click - disabled on canvas
  const handleContextMenu = (e) => {
    e.preventDefault();
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart, panX, panY]);

  // Listen for go back event from nodes
  useEffect(() => {
    const handleGoBack = () => {
      if (history.length > 1 && !isZooming && currentLayerIndex !== 0) {
        const prevHistory = history[history.length - 2];
        setIsZooming(true);
        setDirection(-1);
        
        // Update the background color to the previous history item's color
        setBackgroundColor(prevHistory.color);
        
        // Update layer immediately for AnimatePresence to work
        setTimeout(() => {
          setCurrentLayerIndex(prevHistory.layerIndex);
          setScale(1);
          setPanX(0);
          setPanY(0);
          setHistory(prev => prev.slice(0, -1));
        }, 50);
        
        // End the transition after animation completes (0.7s)
        setTimeout(() => setIsZooming(false), 750);
      }
    };

    window.addEventListener('nodeGoBack', handleGoBack);
    return () => window.removeEventListener('nodeGoBack', handleGoBack);
  }, [history, isZooming, currentLayerIndex]);

  // Listen for reverse transition event from right-click
  useEffect(() => {
    const handleReverseTransition = () => {
      if (!isZooming && currentLayerIndex > 0) {
        handleReverseLayerTransition();
      }
    };

    window.addEventListener('triggerReverseTransition', handleReverseTransition);
    return () => window.removeEventListener('triggerReverseTransition', handleReverseTransition);
  }, [isZooming, currentLayerIndex]);


  return (
    <div style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'hidden',
      backgroundColor: backgroundColor,
      transition: silentTransition ? 'none' : 'background-color 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
      willChange: 'background-color'
    }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-15px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        * {
          -webkit-tap-highlight-color: transparent;
          -webkit-touch-callout: none;
        }
        
        body, html, #root {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          position: fixed;
          overscroll-behavior: none;
          touch-action: pan-x pan-y;
          -webkit-overflow-scrolling: touch;
        }
        
        /* iOS safe area support */
        @supports (padding: max(0px)) {
          body {
            padding-left: max(0px, env(safe-area-inset-left));
            padding-right: max(0px, env(safe-area-inset-right));
            padding-top: max(0px, env(safe-area-inset-top));
            padding-bottom: max(0px, env(safe-area-inset-bottom));
          }
        }
        
        /* Prevent zoom on double-tap for iOS */
        button, a {
          touch-action: manipulation;
        }
      `}</style>

      {/* Main Canvas */}
      <div
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden'
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onContextMenu={handleContextMenu}
        onClick={handleCanvasClick}
      >
        <div
          style={{ 
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            transform: (() => {
              if (currentLayerIndex === 0) return `scale(${scale})`;
              
              // Check if we're in rewind mode
              const currentHistoryItem = history[history.length - 1];
              const isRewindMode = currentHistoryItem?.clickedNode?.id === zoomingNode?.id && zoomProgress > 0;
              
              if (isRewindMode) {
                // Rewind: zoom OUT (shrink) - reverse the scale calculation
                // When zoomProgress is high (90), we want scale to be small (zoomed out)
                // When zoomProgress is 0, we want scale to be 1 (normal)
                return `scale(${1 / (1 + (zoomProgress / 100) * 8)})`;
              } else if (zoomingNode && zoomProgress > 0) {
                // Forward zoom: zoom IN (grow)
                return `scale(${1 + (zoomProgress / 100) * 8})`;
              }
              
              return `scale(1)`;
            })(),
            transformOrigin: currentLayerIndex === 0 
              ? 'center center' 
              : (zoomingNode && zoomProgress > 0 
                  ? `${zoomingNode.x}% ${zoomingNode.y}%` 
                  : 'center center'),
            cursor: 'default',
            transition: currentLayerIndex === 0 ? 'transform 0.7s' : (silentTransition ? 'none' : 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)'),
            // Add circular clip-path during rewind to make it look like zooming into a node
            clipPath: (() => {
              const currentHistoryItem = history[history.length - 1];
              const isRewindMode = currentHistoryItem?.clickedNode?.id === zoomingNode?.id && zoomProgress > 0;
              
              if (isRewindMode && zoomingNode) {
                // Calculate the circle size - starts large, shrinks to node size
                // At zoomProgress 90, circle should be small (node size ~165px)
                // At zoomProgress 0, circle should be full screen
                const maxSize = Math.max(viewport.width, viewport.height) * 1.5;
                const minSize = 165; // Node size
                const circleSize = minSize + (maxSize - minSize) * (1 - zoomProgress / 100);
                return `circle(${circleSize}px at ${zoomingNode.x}% ${zoomingNode.y}%)`;
              }
              return 'none';
            })(),
            opacity: (() => {
              const currentHistoryItem = history[history.length - 1];
              const isRewindMode = currentHistoryItem?.clickedNode?.id === zoomingNode?.id && zoomProgress > 0;
              
              if (isRewindMode) {
                // Fade out as we zoom out
                return Math.max(0, 1 - (zoomProgress / 100) * 0.8);
              }
              return 1;
            })()
          }}
        >
          {silentTransition ? (
            <Layer
              key={currentLayer.id}
              layer={currentLayer}
              onNodeClick={handleNodeClick}
              direction={direction}
              scale={scale}
              panX={panX}
              panY={panY}
              isZooming={isZooming}
              isFirstLayer={currentLayerIndex === 0}
              fadeOpacity={1}
              textOpacity={textOpacity}
              layerColor={currentLayer.color}
              zoomProgress={zoomProgress}
              zoomingNode={zoomingNode}
              onZoomProgress={handleZoomProgress}
              silentTransition={silentTransition}
              viewport={viewport}
              clickZoomIntervalRef={clickZoomIntervalRef}
            />
          ) : (
            <AnimatePresence mode="sync" initial={false}>
              <Layer
                key={currentLayer.id}
                layer={currentLayer}
                onNodeClick={handleNodeClick}
                direction={direction}
                scale={scale}
                panX={panX}
                panY={panY}
                isZooming={isZooming}
                isFirstLayer={currentLayerIndex === 0}
                fadeOpacity={1}
                textOpacity={textOpacity}
                layerColor={currentLayer.color}
                zoomProgress={zoomProgress}
                zoomingNode={zoomingNode}
                onZoomProgress={handleZoomProgress}
                silentTransition={silentTransition}
                viewport={viewport}
                clickZoomIntervalRef={clickZoomIntervalRef}
              />
            </AnimatePresence>
          )}
          
          {/* Next layer preview - shows as zoom progresses */}
          {nextLayer && zoomProgress > 0 && zoomProgress < (currentLayerIndex === 0 ? 84 : 90) && zoomingNode && currentLayerIndex === 0 && (
            <div
              style={{ 
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
                opacity: Math.max(nextLayerOpacity, Math.min(1, zoomProgress / 100 * 1.2)),
                transformOrigin: 'center center',
                transform: `scale(${0.85 + (zoomProgress / 100) * 0.15})`,
                transition: 'opacity 0.15s ease-out, transform 0.15s ease-out',
                filter: `blur(${Math.max(0, (100 - zoomProgress) / 100 * 3)}px)`,
                clipPath: `circle(${(165 * (1 + (zoomProgress / 100) * 9)) / 2}px at ${zoomingNode.x}% ${zoomingNode.y}%)`
              }}
            >
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                {nextLayer.nodes.map((node) => (
                  <Node
                    key={node.id}
                    node={node}
                    layerColor={nextLayer.color}
                    onClick={() => {}}
                    scale={1}
                    isZooming={false}
                    isFirstLayer={false}
                    zoomProgress={0}
                    onZoomProgress={undefined}
                    viewport={viewport}
                    allNodes={nextLayer.nodes}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Layer 3 preview - reveals inside Layer 2 nodes as text fades */}
          {nextLayer && zoomProgress > 0 && zoomingNode && currentLayerIndex > 0 && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                pointerEvents: 'none',
                opacity: Math.max(0, Math.min(1, (zoomProgress - 60) / 30)), // Fade in from 60% to 90% (matching text fade out)
                transition: 'opacity 0.15s ease-out',
                // Counter-scale to maintain actual Layer 3 size despite Layer 2 zoom
                transform: `scale(${1 / (1 + (zoomProgress / 100) * 8)})`,
                transformOrigin: `${zoomingNode.x}% ${zoomingNode.y}%`,
                clipPath: `circle(${(165 / 2) * (1 + (zoomProgress / 100) * 8)}px at ${zoomingNode.x}% ${zoomingNode.y}%)`, // Scale clip path to match zoom
              }}
            >
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                {nextLayer.nodes.map((node) => (
                  <Node
                    key={node.id}
                    node={node}
                    layerColor={nextLayer.color}
                    onClick={() => {}}
                    scale={1}
                    isZooming={false}
                    isFirstLayer={false}
                    zoomProgress={0}
                    onZoomProgress={undefined}
                    viewport={viewport}
                    allNodes={nextLayer.nodes}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Previous layer preview - shows during rewind zoom (reverse of forward zoom) */}
          {(() => {
            const currentHistoryItem = history[history.length - 1];
            const isRewindMode = currentHistoryItem?.clickedNode?.id === zoomingNode?.id && zoomProgress > 0 && currentLayerIndex > 0;
            
            if (!isRewindMode || !prevLayer) return null;
            
            return (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0,
                  pointerEvents: 'none',
                  // Fade in as we zoom out - becomes fully visible
                  opacity: Math.min(1, (1 - zoomProgress / 100) + 0.3),
                  transition: 'opacity 0.15s ease-out',
                  // Keep at normal scale - no transform needed
                  transform: 'scale(1)',
                  // Slight blur that clears as we zoom out
                  filter: `blur(${Math.max(0, (zoomProgress / 100) * 1.5)}px)`,
                }}
              >
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  {prevLayer.nodes.map((node) => {
                    // Calculate text opacity - fade in as we zoom out
                    const textOpacity = Math.min(1, 1 - (zoomProgress / 100) * 0.5);
                    
                    return (
                      <Node
                        key={node.id}
                        node={node}
                        layerColor={prevLayer.color}
                        onClick={() => {}}
                        scale={1}
                        isZooming={false}
                        isFirstLayer={currentLayerIndex === 1}
                        textOpacity={textOpacity}
                        zoomProgress={0}
                        onZoomProgress={undefined}
                        viewport={viewport}
                        allNodes={prevLayer.nodes}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Navigation Controls */}
      <div style={{ position: 'absolute', top: '32px', left: '32px', display: 'flex', flexDirection: 'column', gap: '16px', zIndex: 10 }}>
        <button
          style={{
            width: '56px',
            height: '56px',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            cursor: currentLayerIndex === 0 || isZooming ? 'not-allowed' : 'pointer',
            opacity: currentLayerIndex === 0 || isZooming ? 0.4 : 1,
            transition: 'all 0.3s',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            touchAction: 'manipulation'
          }}
          onClick={handleHome}
          disabled={currentLayerIndex === 0 || isZooming}
          onMouseEnter={(e) => {
            if (currentLayerIndex !== 0 && !isZooming) {
              e.currentTarget.style.background = 'white';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
          }}
        >
          <Home style={{ width: '28px', height: '28px', color: '#1f2937' }} />
        </button>

        {history.length > 1 && (
          <NavigationBubbles
            history={history}
            onNavigate={handleNavigate}
            currentIndex={history.length - 1}
          />
        )}
      </div>


      {/* Layer Info */}
      <div style={{
        position: 'absolute',
        bottom: '32px',
        left: '32px',
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '10px 20px',
        borderRadius: '9999px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        zIndex: 10,
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)'
      }}>
        <div style={{
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#1f2937',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Circle style={{ width: '16px', height: '16px', fill: backgroundColor }} />
          <span>{currentLayer.name}</span>
          <span style={{ color: '#9ca3af' }}>•</span>
          <span style={{ color: '#4b5563' }}>Layer {currentLayerIndex + 1} / {config.layers.length}</span>
        </div>
      </div>
    </div>
  );
}