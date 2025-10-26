# Multi-Layer Visualization App

> **🌐 Live Demo**: [https://kaleidoscopic-chaja-40ae5f.netlify.app](https://68fe04b9d4cc72f37c1a289e--kaleidoscopic-chaja-40ae5f.netlify.app)

## 🧭 Overview

**Problem**: Build an interactive multi-layer data visualization that allows users to explore hierarchical information through smooth zoom animations and intuitive navigation.

The app visualizes the water cycle across 3 hierarchical layers:
- **Layer 1 (Root)**: Single entry point - "water cycle"
- **Layer 2 (Categories)**: Two branches - "what is it?" and "4 layers"
- **Layer 3 (Details)**: Four stages - Evaporation, Condensation, Precipitation, Collection

Users navigate through layers using progressive zoom (0-100%) with multiple interaction methods optimized for both desktop and mobile devices. Crafting the smooth transitions and responsive scaling to work seamlessly across all screen sizes was particularly rewarding.

## 🧩 Design

### Architectural Approach
- **Component-based React SPA** with centralized state management for layer navigation
- **Progressive zoom system** (0-100%) with threshold-based transitions (84% for Layer 1, 90% for subsequent layers)
- **Responsive scaling algorithm** using collision detection to prevent node overlap on small screens
- **History tracking** for breadcrumb navigation and layer jumping
- **Multi-modal interaction** supporting mouse, touch, and keyboard inputs

### UI/UX Approach
- **Progressive navigation** with visual feedback instead of jarring instant jumps
- **Color inheritance system** where background colors smoothly transition based on clicked nodes
- **Responsive design** with iOS/Android optimization and touch gesture support (desktop-first approach).
- **Visual feedback** through hover states, cursor changes, and animation cues

### Key Design Decisions
- **Progressive zoom (0-100%)**: Provides continuous visual feedback during navigation, preventing user disorientation and creating satisfying micro-interactions
- **Color inheritance**: Background colors transition based on clicked nodes to provide visual context and create memorable navigation paths
- **Mathematical collision detection**: Ensures nodes never overlap on any screen size through dynamic scaling calculations
- **Threshold-based transitions**: Different thresholds (84% vs 90%) optimize the flow between layers based on user testing

## ⚙️ Tech Choices

### Core Technologies
- **React 19.2.0**: Latest React with concurrent rendering features and modern hooks API
- **Framer Motion 12.23.24**: Professional-grade animation library for declarative, physics-based transitions
- **Jest + React Testing Library**: Zero-configuration testing framework with comprehensive DOM simulation

### Framework Evaluation & Justification

**React vs Vue/Angular**  
React's component reusability and vast ecosystem made it ideal for this complex interactive visualization. The virtual DOM efficiently handles the frequent re-renders during animations, while React's granular state control was essential for managing the multi-layer navigation system with zoom progress tracking.

**Framer Motion vs CSS Animations**  
Framer Motion was chosen for its declarative API and hardware-accelerated performance. CSS animations alone couldn't handle the complex transform origin calculations needed for zoom-from-node-center effects, or the layered animation sequencing required for smooth layer transitions. Framer Motion's physics-based easing creates the polished feel that makes interactions genuinely enjoyable.

**Jest vs Mocha**  
Jest's integrated coverage reporting and snapshot testing perfectly suited the comprehensive test suite needed for this interactive application. The zero-config setup allowed focusing on testing logic rather than configuration, while the built-in mocking capabilities simplified testing complex animation sequences.

### Additional Libraries
- **Lucide React**: Lightweight, consistent icon system for UI elements (Home button, layer indicators)
- **Web Vitals**: Performance monitoring library for tracking Core Web Vitals compliance

### Technical Philosophy
The tech stack was carefully selected to balance **smooth 60fps animations**, **developer productivity**, and **user satisfaction**. Finding the right combination of tools that could handle complex state management while maintaining buttery-smooth animations across all devices was an interesting technical challenge that required evaluating multiple approaches.

## ✅ Tests

### Test Structure
**32 comprehensive tests** across 5 test suites with 100% pass rate:

```
✅ 32 Tests Passing (100% Success Rate)
├── Multi-Layer Visualization (15 tests) - Core functionality
├── Accessibility (2 tests) - WCAG compliance
├── Responsive Design (2 tests) - Mobile compatibility
├── Color Inheritance (4 tests) - Visual theme system
└── Zoom Effects (11 tests) - Animation system
```

### Running Tests

#### Run all tests:
```bash
npm test -- --watchAll=false
```

#### Run with coverage:
```bash
npm test -- --coverage --watchAll=false
```

#### Run specific test suite:
```bash
npm test -- --testNamePattern="Color Inheritance"
npm test -- --testNamePattern="Zoom Effects"
```

### Test Categories
- **Component Rendering**: Verifies all UI elements load correctly and canvas configuration is valid
- **User Interactions**: Validates click navigation, scroll-based zoom, touch gestures, and right-click reverse navigation
- **Visual Feedback**: Confirms color inheritance system, background transitions, and animation timing consistency
- **Responsive & Accessibility**: Tests mobile viewport handling, touch gesture support, screen reader compatibility, and keyboard navigation

## 💻 Working Code

### Prerequisites
- Node.js 18+ and npm
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation & Setup

```bash
# Clone the repository
git clone <repository-url>
cd multilayer-viz-app

# Install dependencies
npm install

# Start development server
npm start

# App runs at http://localhost:3000
```

### 🎥 Demo Video



https://github.com/user-attachments/assets/b83e059a-4c18-44e9-a225-566548119afb


*Built with curiosity using React and Framer Motion*
