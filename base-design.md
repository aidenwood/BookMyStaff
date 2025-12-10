# BookMyStaff - Base Design System
## Uber/Fresha-Inspired Booking Platform

### Overview
This document outlines the comprehensive design system for BookMyStaff, inspired by modern booking platforms like Uber and Fresha. The system emphasizes a full-screen app experience with clean, modern interfaces, subtle animations, and intuitive user flows.

## Core Design Principles

### 1. Full-Screen App Experience
- **Immersive Interface**: Remove unnecessary chrome and focus on content
- **Edge-to-Edge Design**: Utilize full viewport space effectively
- **Seamless Navigation**: Smooth transitions between states and steps
- **Mobile-First Approach**: Touch-friendly interactions and responsive design

### 2. Bold, Minimal Typography
```css
/* Typography Scale - Bold & Impactful */
--text-xs: 0.75rem;     /* 12px - small labels */
--text-sm: 0.875rem;    /* 14px - body text */
--text-base: 1rem;      /* 16px - default text */
--text-lg: 1.25rem;     /* 20px - large text */
--text-xl: 1.5rem;      /* 24px - small headings */
--text-2xl: 2rem;       /* 32px - section headers */
--text-3xl: 2.5rem;     /* 40px - page titles */
--text-4xl: 3rem;       /* 48px - hero headers */
--text-5xl: 4rem;       /* 64px - main headers */

/* Font Weights - Bold Emphasis */
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-black: 900;      /* For major headers */

/* Typography Classes */
.heading-main {
  font-size: var(--text-5xl);
  font-weight: var(--font-black);
  line-height: 1.1;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.heading-page {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  line-height: 1.2;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.heading-section {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  line-height: 1.3;
  color: var(--text-primary);
}
```

### 3. Color System - Bold & Minimal
```css
/* Core Palette - Based on https://coolors.co/fffcf2-ccc5b9-403d39-252422-eb5e28 */
--cream: #fffcf2;       /* Primary background */
--light-gray: #ccc5b9;  /* Secondary background, borders */
--dark-gray: #403d39;   /* Text, secondary elements */
--charcoal: #252422;    /* Primary text, headers */
--orange: #eb5e28;      /* Accent color only */

/* Semantic Application */
--bg-primary: #fffcf2;    /* Main background */
--bg-secondary: #ccc5b9;  /* Card backgrounds, input fields */
--text-primary: #252422;  /* Headers, important text */
--text-secondary: #403d39; /* Body text, labels */
--accent: #eb5e28;        /* CTAs, highlights, progress */
--border: #ccc5b9;        /* Subtle borders */
--overlay: rgba(37, 36, 34, 0.8); /* Modal overlays */

/* States */
--success: #22c55e;
--warning: #f59e0b;
--error: #ef4444;
```

### 4. Spacing System
```css
/* Base spacing unit: 4px */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

## Component Design Guidelines

### Buttons
```css
/* Primary Action Buttons */
.btn-primary {
  @apply bg-primary-600 hover:bg-primary-700 text-white;
  @apply px-6 py-3 rounded-lg font-medium text-base;
  @apply transition-all duration-200 ease-out;
  @apply focus:ring-4 focus:ring-primary-100;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.2);
}

/* Secondary Buttons */
.btn-secondary {
  @apply bg-white border-2 border-gray-200 text-gray-700;
  @apply hover:bg-gray-50 hover:border-gray-300;
  @apply px-6 py-3 rounded-lg font-medium text-base;
  @apply transition-all duration-200 ease-out;
}

/* Ghost Buttons */
.btn-ghost {
  @apply bg-transparent text-gray-600 hover:bg-gray-100;
  @apply px-4 py-2 rounded-lg font-medium text-sm;
  @apply transition-all duration-200 ease-out;
}
```

### Input Fields
```css
/* Modern Input Styling */
.input-field {
  @apply w-full px-4 py-3 rounded-lg border border-gray-200;
  @apply bg-white text-gray-900 placeholder-gray-400;
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent;
  @apply transition-all duration-200 ease-out;
  font-size: 16px; /* Prevents zoom on iOS */
}

.input-field:focus {
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
}

/* Input Labels */
.input-label {
  @apply block text-sm font-medium text-gray-700 mb-2;
}

/* Input Groups */
.input-group {
  @apply space-y-2 mb-6;
}
```

### Cards & Containers
```css
/* Card Styling */
.card {
  @apply bg-white rounded-xl border border-gray-100;
  @apply p-6 transition-all duration-200 ease-out;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

/* Selection Cards */
.selection-card {
  @apply card cursor-pointer border-2;
  @apply hover:border-primary-200 hover:bg-primary-50;
}

.selection-card.selected {
  @apply border-primary-500 bg-primary-50;
}

/* Container Layouts */
.container-fullscreen {
  @apply min-h-screen bg-gray-50;
}

.container-centered {
  @apply max-w-4xl mx-auto px-4;
}

.container-step {
  @apply max-w-2xl mx-auto px-6 py-8;
}
```

## Layout Patterns

### 1. Full-Screen Booking Flow
```css
.booking-layout {
  @apply min-h-screen bg-gradient-to-b from-white to-gray-50;
  @apply flex flex-col;
}

.booking-header {
  @apply bg-white border-b border-gray-100;
  @apply px-6 py-4 flex items-center justify-between;
  @apply sticky top-0 z-50;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.9);
}

.booking-content {
  @apply flex-1 flex flex-col;
  @apply max-w-2xl mx-auto w-full;
  @apply px-6 py-8;
}

.booking-footer {
  @apply bg-white border-t border-gray-100;
  @apply px-6 py-4 mt-auto;
  @apply sticky bottom-0;
}
```

### 2. Page Transitions - Full Screen Black Wipe
```css
/* Full-screen black transition overlay */
.page-transition {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: var(--charcoal);
  z-index: 9999;
  pointer-events: none;
}

/* Slide in from right */
.transition-enter {
  transform: translateX(100%);
  animation: slideInFromRight 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

/* Slide out to left */
.transition-exit {
  transform: translateX(0);
  animation: slideOutToLeft 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes slideInFromRight {
  0% { transform: translateX(100%); }
  50% { transform: translateX(0); }
  100% { transform: translateX(-100%); }
}

@keyframes slideOutToLeft {
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}

/* Progressive Disclosure */
.step-container {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.5s ease-out 0.3s forwards;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Progress Indicators */
.progress-bar {
  width: 100%;
  height: 4px;
  background: var(--bg-secondary);
  position: relative;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--accent);
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 3. Touch-Friendly Interactions
```css
/* Minimum touch targets */
.touch-target {
  min-height: 44px;
  min-width: 44px;
}

/* Gesture feedback */
.pressable {
  @apply transition-transform duration-150 ease-out;
  @apply active:scale-95;
}

/* Swipe indicators */
.swipeable {
  @apply relative;
}

.swipe-hint {
  @apply absolute bottom-4 left-1/2 transform -translate-x-1/2;
  @apply text-sm text-gray-400 flex items-center space-x-2;
}
```

## Animation Guidelines

### 1. Micro-Interactions
```css
/* Button press feedback */
@keyframes buttonPress {
  0% { transform: scale(1); }
  50% { transform: scale(0.96); }
  100% { transform: scale(1); }
}

/* Loading states */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Success feedback */
@keyframes successBounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}
```

### 2. Page Transitions
```css
/* Slide transitions */
.page-enter {
  transform: translateX(100%);
}

.page-enter-active {
  transform: translateX(0);
  transition: transform 300ms ease-out;
}

.page-exit {
  transform: translateX(0);
}

.page-exit-active {
  transform: translateX(-100%);
  transition: transform 300ms ease-out;
}
```

## Component Specifications

### Date Range Picker
- **Design**: Clean, minimal calendar with subtle hover states
- **Interaction**: Click to select single date, drag for range
- **Visual**: Soft corners, primary color for selection
- **Mobile**: Touch-friendly day targets (min 44px)

### Service Selection Cards
- **Layout**: Grid layout with consistent card sizes
- **States**: Default, hover, selected, disabled
- **Content**: Service name, duration, price, description
- **Animation**: Subtle scale on hover, smooth selection feedback

### Progress Indicator
- **Style**: Horizontal progress bar with step indicators
- **States**: Completed, current, upcoming
- **Animation**: Smooth progress fill, step completion feedback
- **Mobile**: Simplified view with current step emphasis

### Form Fields
- **Style**: Clean, borderless design with underline focus
- **States**: Default, focused, error, disabled
- **Labels**: Floating labels that animate on focus
- **Validation**: Real-time validation with inline feedback

## Accessibility Guidelines

### 1. Color Contrast
- **Text**: Minimum 4.5:1 contrast ratio for normal text
- **UI Elements**: Minimum 3:1 contrast ratio for interactive elements
- **Focus Indicators**: Clear, high-contrast focus rings

### 2. Interactive Elements
- **Touch Targets**: Minimum 44px x 44px for mobile
- **Keyboard Navigation**: Clear tab order and focus management
- **Screen Readers**: Proper ARIA labels and semantic markup

### 3. Motion & Animation
- **Reduced Motion**: Respect `prefers-reduced-motion` setting
- **Duration**: Keep animations under 500ms for UI feedback
- **Easing**: Use natural easing curves (ease-out for entrances)

## Responsive Breakpoints

```css
/* Mobile First Approach */
/* xs: 0px and up (default) */

/* Small devices (sm) */
@media (min-width: 640px) {
  /* Tablet portrait */
}

/* Medium devices (md) */
@media (min-width: 768px) {
  /* Tablet landscape */
}

/* Large devices (lg) */
@media (min-width: 1024px) {
  /* Desktop */
}

/* Extra large devices (xl) */
@media (min-width: 1280px) {
  /* Large desktop */
}
```

## Performance Guidelines

### 1. Image Optimization
- **Format**: WebP with JPEG fallback
- **Sizing**: Responsive images with proper sizing
- **Loading**: Lazy loading for below-the-fold content

### 2. Animation Performance
- **Properties**: Prefer transform and opacity for animations
- **Hardware Acceleration**: Use `will-change` sparingly
- **Frame Rate**: Target 60fps for smooth animations

### 3. Bundle Optimization
- **Code Splitting**: Load components on demand
- **Tree Shaking**: Remove unused code
- **Caching**: Implement proper caching strategies

## Implementation Checklist

### Phase 1: Foundation
- [ ] Update Tailwind config with design tokens
- [ ] Implement base component library
- [ ] Create layout containers
- [ ] Add animation utilities

### Phase 2: Components
- [ ] Date range picker component
- [ ] Service selection cards
- [ ] Progress indicator
- [ ] Form components
- [ ] Button variants

### Phase 3: User Flow
- [ ] Booking flow layout
- [ ] Step transitions
- [ ] Mobile optimizations
- [ ] Accessibility improvements

### Phase 4: Polish
- [ ] Micro-interactions
- [ ] Loading states
- [ ] Error handling
- [ ] Performance optimization

---

This design system provides the foundation for creating a modern, Uber/Fresha-inspired booking experience that feels like a native app while maintaining web accessibility and performance standards.