---
name: tailwind-responsive-design
description: Tailwind CSS responsive design patterns and best practices. Use when implementing responsive layouts, grids, flexbox, typography, spacing, and show/hide elements across breakpoints. Covers mobile-first approach, default breakpoints, grid layouts, container queries, and anti-patterns.
license: MIT
compatibility: opencode
metadata:
  audience: frontend-developers
  framework: tailwind-css
  source: thebushidocollective/han
---

# Tailwind CSS - Responsive Design

Tailwind CSS provides a mobile-first responsive design system using breakpoint prefixes that make it easy to build adaptive layouts.

## Mobile-First Approach

Tailwind uses a mobile-first breakpoint system. Unprefixed utilities apply to all screen sizes, and breakpoint prefixes apply from that breakpoint and up:

```html
<!-- Mobile: full width, Tablet+: half width, Desktop+: third width -->
<div class="w-full md:w-1/2 lg:w-1/3">Responsive width</div>
```

## Default Breakpoints

```javascript
// tailwind.config.js default breakpoints
{
  sm: '640px',   // Small devices (landscape phones)
  md: '768px',   // Medium devices (tablets)
  lg: '1024px',  // Large devices (desktops)
  xl: '1280px',  // Extra large devices (large desktops)
  '2xl': '1536px' // 2X large devices (larger desktops)
}
```

## Best Practices

### 1. Start Mobile, Scale Up

Design for mobile first, then add complexity for larger screens:

```html
<!-- Good: Mobile-first approach -->
<div class="flex flex-col md:flex-row gap-4">
  <div class="w-full md:w-1/2">Column 1</div>
  <div class="w-full md:w-1/2">Column 2</div>
</div>

<!-- Bad: Desktop-first (requires more overrides) -->
<div class="flex flex-row sm:flex-col">
```

### 2. Use Responsive Typography

Scale text appropriately across devices:

```html
<h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl">Responsive Heading</h1>
<p class="text-sm sm:text-base md:text-lg">Responsive paragraph</p>
```

### 3. Responsive Spacing

Adjust padding and margins for different screens:

```html
<section class="px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
```

### 4. Grid Layouts

Create responsive grids that adapt to screen size:

```html
<!-- 1 column mobile, 2 tablet, 3 desktop, 4 large desktop -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
  <div>Item 4</div>
</div>
```

### 5. Show/Hide Elements

Control visibility across breakpoints:

```html
<!-- Mobile menu button: visible on mobile, hidden on desktop -->
<button class="md:hidden">
  <svg><!-- Menu icon --></svg>
</button>

<!-- Show only on mobile -->
<div class="block md:hidden">Mobile only</div>

<!-- Show only on desktop -->
<div class="hidden lg:block">Desktop only</div>
```

## Common Patterns

### Responsive Hero Section

```html
<section class="relative min-h-screen md:min-h-[600px] lg:min-h-[800px] px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
  <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-12">
    <!-- Content -->
  </div>
</section>
```

### Responsive Card Grid

```html
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  <div class="bg-white rounded-xl shadow-lg p-4 sm:p-6">
    <h3 class="text-lg sm:text-xl font-bold mb-2">Card Title</h3>
    <p class="text-sm sm:text-base text-gray-600">Card description that adapts to screen size.</p>
  </div>
</div>
```

### Responsive Navigation

```html
<nav class="bg-white shadow">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16">
      <!-- Logo -->
      <div class="flex-shrink-0">Logo</div>
      
      <!-- Desktop nav -->
      <div class="hidden md:flex items-center space-x-4">
        <a href="#" class="px-3 py-2 rounded-md text-sm font-medium">Home</a>
        <a href="#" class="px-3 py-2 rounded-md text-sm font-medium">About</a>
        <a href="#" class="px-3 py-2 rounded-md text-sm font-medium">Contact</a>
      </div>
      
      <!-- Mobile menu button -->
      <div class="md:hidden">
        <button class="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</nav>
```

### Responsive Image Sizes

```html
<img 
  src="image.jpg" 
  alt="Description"
  class="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover rounded-xl"
  loading="lazy"
/>
```

### Responsive Flexbox Direction

```html
<div class="flex flex-col md:flex-row gap-4">
  <div class="flex-1">Left content</div>
  <div class="flex-1">Right content</div>
</div>
```

### Responsive Order

```html
<div class="flex flex-col-reverse md:flex-row">
  <div class="md:order-2">Image (right on desktop)</div>
  <div class="md:order-1">Text (left on desktop)</div>
</div>
```

## Advanced Patterns

### Container Queries (Modern)

Use container queries for component-level responsiveness:

```javascript
// Install: npm i @tailwindcss/container-queries
// tailwind.config.js
module.exports = {
  plugins: [
    require('@tailwindcss/container-queries'),
  ]
}
```

```html
<div class="@container">
  <div class="@sm:grid @sm:grid-cols-2 @lg:grid-cols-3 gap-4">
    <!-- Responsive to container, not viewport -->
  </div>
</div>
```

### Custom Breakpoints

Add project-specific breakpoints:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'xs': '375px',    // Very small devices
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      '3xl': '1920px',
      // Max-width breakpoints
      'max-md': { 'max': '767px' },
      // Height breakpoints
      'tall': { 'raw': '(min-height: 800px)' },
    },
  }
}
```

### Orientation-Based Styles

```html
<div class="portrait:block landscape:hidden">
  Portrait only content
</div>
```

## Anti-Patterns

### ❌ Don't Forget Mobile Users

```html
<!-- BAD: Desktop-first, mobile gets cramped -->
<div class="grid grid-cols-4 sm:grid-cols-2 lg:grid-cols-4 gap-4">

<!-- GOOD: Mobile-first -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
```

### ❌ Don't Use Arbitrary Breakpoints Everywhere

```html
<!-- BAD: Inconsistent breakpoints -->
<div class="w-full @[500px]:w-1/2 @[800px]:w-1/3">

<!-- GOOD: Use standard breakpoints -->
<div class="w-full md:w-1/2 lg:w-1/3">
```

### ❌ Don't Hardcode Heights

```html
<!-- BAD: Content may overflow on mobile -->
<div class="h-64 overflow-hidden">

<!-- GOOD: Let content dictate height -->
<div class="min-h-64">
```

### ❌ Don't Ignore Touch Targets

```html
<!-- BAD: Too small for touch -->
<button class="p-1 text-sm">Click</button>

<!-- GOOD: Adequate touch target -->
<button class="min-h-[48px] min-w-[48px] px-4 py-2 text-sm">Click</button>
```
