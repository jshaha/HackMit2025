# Mind Map Application Design Guidelines

## Design Approach
**System-Based Approach**: This utility-focused application prioritizes efficiency and usability over visual differentiation. Using **Material Design** principles for clean interfaces with subtle visual feedback and intuitive interactions.

## Core Design Elements

### A. Color Palette
**Light Mode:**
- Primary: 59 73% 44% (Material Blue)
- Concept Nodes: 217 91% 60% (Bright Blue)  
- Paper Nodes: 142 71% 45% (Material Green)
- Dataset Nodes: 262 83% 58% (Material Purple)
- Background: 0 0% 98% (Near White)
- Surface: 0 0% 100% (Pure White)
- Text Primary: 220 13% 18% (Dark Gray)
- Text Secondary: 220 9% 46% (Medium Gray)
- Border: 220 13% 91% (Light Gray)

**Dark Mode:**
- Primary: 217 91% 70% (Lighter Blue)
- Concept Nodes: 217 91% 65%
- Paper Nodes: 142 69% 55%
- Dataset Nodes: 262 83% 68%
- Background: 224 71% 4% (Very Dark Blue)
- Surface: 223 47% 11% (Dark Blue Gray)
- Text Primary: 210 40% 98% (Near White)
- Text Secondary: 215 20% 65% (Light Gray)
- Border: 215 25% 27% (Dark Border)

### B. Typography
- **Font Family**: Inter (Google Fonts) for clean, modern readability
- **Hierarchy**: 
  - Node Titles: text-sm font-semibold
  - Form Labels: text-sm font-medium  
  - Body Text: text-sm
  - Modal Headers: text-lg font-semibold

### C. Layout System
**Tailwind Spacing Units**: Consistent use of 2, 4, 6, 8 units
- Small gaps: gap-2, p-2, m-2
- Standard spacing: gap-4, p-4, m-4  
- Section spacing: gap-6, p-6, m-6
- Large layouts: gap-8, p-8, m-8

### D. Component Library

**Sidebar Form:**
- Width: w-80 (320px) with rounded-r-lg
- Background: Surface color with subtle border-r
- Form inputs: rounded-lg with focus:ring-2 states
- Dropdown: Custom styled with Material Design elevation
- Add button: Prominent with primary color and rounded-lg

**Mind Map Canvas:**
- Full remaining viewport width with bg-background
- React Flow container: rounded-lg with subtle shadow
- Zoom controls: Floating bottom-right with glass morphism

**Nodes:**
- Shape: rounded-xl with shadow-sm
- Size: min-w-32 min-h-16 with p-4
- Hover: shadow-md transition-all duration-200
- Active: ring-2 with type-specific color

**Modal:**
- Backdrop: Semi-transparent overlay with backdrop-blur-sm
- Content: rounded-xl with max-w-md and shadow-xl
- Close: Top-right with hover:bg-gray-100 transition

**Edges:**
- Default: Bezier curves with strokeWidth={2}
- Color: Text secondary for subtle connections
- Hover: Slightly thicker with transition

### E. Responsive Behavior
- **Desktop**: Sidebar fixed, canvas fills remaining space
- **Tablet**: Sidebar overlay with toggle button
- **Mobile**: Full-screen canvas with floating add button

### F. Interactions
- **Hover States**: Subtle elevation changes (shadow-sm to shadow-md)
- **Focus States**: ring-2 with primary color
- **Transitions**: duration-200 for smooth feedback
- **Loading States**: Subtle opacity changes during node creation

## Key Design Principles
1. **Information Hierarchy**: Node titles most prominent, descriptions secondary
2. **Color Coding**: Consistent type-based coloring for quick recognition
3. **Spatial Relationships**: Generous whitespace and logical grouping
4. **Feedback**: Clear visual responses to all user interactions
5. **Accessibility**: High contrast ratios and keyboard navigation support

## Images
**No images required** - This application relies on clean typography, color coding, and geometric shapes for visual communication. The mind map's visual appeal comes from node arrangements and connection patterns rather than imagery.