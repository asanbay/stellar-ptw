# Planning Guide

A comprehensive task management and productivity application that helps users organize their work, track progress, and achieve their goals with an intuitive and beautiful interface.

**Experience Qualities**:
1. **Efficient** - Every interaction should feel instantaneous and purposeful, removing friction from task management
2. **Calm** - The interface should reduce stress rather than add to it, with generous spacing and soothing colors
3. **Empowering** - Users should feel in control and accomplished, with clear visual feedback on their progress

**Complexity Level**: Light Application (multiple features with basic state)
  - Multiple interconnected features including task management, categories, filtering, and analytics with persistent state across sessions

## Essential Features

### Task Creation & Management
- **Functionality**: Create, edit, complete, and delete tasks with title, description, priority, and due date
- **Purpose**: Core functionality that allows users to capture and organize their work
- **Trigger**: Click "Add Task" button or keyboard shortcut
- **Progression**: Click button → Form appears → Enter details → Save → Task appears in list → Can edit/complete/delete
- **Success criteria**: Tasks persist across sessions, can be modified, and maintain their state

### Category Organization
- **Functionality**: Assign tasks to custom categories (Work, Personal, Health, Learning, etc.)
- **Purpose**: Helps users segment different areas of life and focus on specific contexts
- **Trigger**: Select category when creating/editing task, or filter by category
- **Progression**: Create task → Select category → Task shows category badge → Filter by category → See filtered tasks
- **Success criteria**: Categories are visually distinct, filterable, and maintain consistent coloring

### Priority System
- **Functionality**: Mark tasks as High, Medium, or Low priority with visual indicators
- **Purpose**: Helps users identify what needs immediate attention versus what can wait
- **Trigger**: Select priority level during task creation/editing
- **Progression**: Set priority → Visual indicator appears → Sort by priority → High priority tasks stand out
- **Success criteria**: Priority is immediately visible and affects task visual prominence

### Progress Dashboard
- **Functionality**: Visual analytics showing completion rate, category distribution, and productivity trends
- **Purpose**: Motivates users by showing their accomplishments and patterns
- **Trigger**: Click on "Dashboard" or "Analytics" tab
- **Progression**: Navigate to dashboard → See charts → Understand productivity patterns → Feel motivated
- **Success criteria**: Charts update in real-time, show meaningful insights, and are visually appealing

### Smart Filtering & Search
- **Functionality**: Filter tasks by status (all/active/completed), priority, category, and search by text
- **Purpose**: Helps users focus on relevant tasks and quickly find what they need
- **Trigger**: Use filter dropdown or search bar
- **Progression**: Enter filter criteria → List updates instantly → See relevant tasks → Clear filters to reset
- **Success criteria**: Filtering is instantaneous and can combine multiple criteria

## Edge Case Handling
- **Empty States**: Show encouraging messages and helpful illustrations when no tasks exist, guiding users to create their first task
- **Long Task Titles**: Truncate with ellipsis and show full text on hover to maintain layout integrity
- **Past Due Dates**: Highlight overdue tasks with warning colors but keep them actionable
- **Rapid Interactions**: Debounce search input and prevent duplicate submissions during task creation
- **Data Migration**: Gracefully handle missing fields in older task entries with sensible defaults

## Design Direction
The design should feel modern, professional, and calming - striking a balance between a serious productivity tool and an approachable daily companion with a minimal interface that lets content breathe and focuses attention on what matters most.

## Color Selection
Triadic color scheme using blue (trust/productivity), warm orange (energy/action), and purple (creativity/completion) to create visual hierarchy and emotional resonance.

- **Primary Color**: Deep Blue (oklch(0.45 0.15 250)) - Communicates trust, stability, and professional productivity
- **Secondary Colors**: Soft Purple (oklch(0.65 0.12 290)) for completed items and achievements; Warm Slate (oklch(0.55 0.02 260)) for secondary actions
- **Accent Color**: Energetic Orange (oklch(0.68 0.18 45)) - Draws attention to CTAs, high-priority items, and important actions
- **Foreground/Background Pairings**:
  - Background (Soft Cream oklch(0.98 0.01 85)): Dark Blue text (oklch(0.25 0.08 250)) - Ratio 9.2:1 ✓
  - Card (Pure White oklch(1 0 0)): Dark Blue text (oklch(0.25 0.08 250)) - Ratio 11.5:1 ✓
  - Primary (Deep Blue oklch(0.45 0.15 250)): White text (oklch(1 0 0)) - Ratio 7.8:1 ✓
  - Secondary (Soft Slate oklch(0.88 0.02 260)): Dark Blue text (oklch(0.25 0.08 250)) - Ratio 8.1:1 ✓
  - Accent (Warm Orange oklch(0.68 0.18 45)): Dark Blue text (oklch(0.25 0.08 250)) - Ratio 4.9:1 ✓
  - Muted (Light Gray oklch(0.94 0.01 260)): Medium Gray text (oklch(0.52 0.03 260)) - Ratio 5.2:1 ✓

## Font Selection
Typography should convey clarity and modernity while maintaining excellent readability for extended use; Inter for its exceptional screen optimization and geometric precision.

- **Typographic Hierarchy**:
  - H1 (Page Title): Inter Bold / 32px / tight tracking (-0.02em) / line-height 1.2
  - H2 (Section Headers): Inter SemiBold / 24px / tight tracking (-0.01em) / line-height 1.3
  - H3 (Card Titles): Inter Medium / 18px / normal tracking / line-height 1.4
  - Body (Task Content): Inter Regular / 15px / normal tracking / line-height 1.6
  - Small (Metadata): Inter Medium / 13px / slight tracking (0.01em) / line-height 1.5
  - Button Text: Inter SemiBold / 14px / normal tracking / line-height 1.4

## Animations
Animations should be purposeful and subtle - guiding the eye during state changes and providing satisfying feedback without calling attention to themselves, creating a sense of physical responsiveness.

- **Purposeful Meaning**: Smooth check animations when completing tasks communicate accomplishment; cards that gently lift on hover suggest interactivity
- **Hierarchy of Movement**: 
  - Primary: Task completion animations (check mark draw, fade out)
  - Secondary: List reordering and filtering (smooth position transitions)
  - Tertiary: Hover states and button feedback (subtle scale/shadow changes)

## Component Selection
- **Components**: 
  - Dialog for task creation/editing (full form with all fields)
  - Card for individual tasks with hover states
  - Tabs for switching between task list and analytics dashboard
  - Select for category and priority dropdowns
  - Input for search and text fields
  - Checkbox for task completion with custom styling
  - Badge for categories and priority indicators
  - Progress bar for visual completion metrics
  - Calendar for date picker (react-day-picker)
  - Button with primary/secondary/ghost variants
  
- **Customizations**: 
  - Custom task card with gradient borders for priority levels
  - Animated checkbox with checkmark draw animation using framer-motion
  - Category badges with custom color mapping
  - Empty state illustrations using simple SVG compositions
  
- **States**: 
  - Buttons: Default state with subtle shadow, hover with lift effect, active with pressed state, disabled with reduced opacity
  - Inputs: Focused state with blue ring and slight scale, error state with red ring, success with green checkmark
  - Cards: Default flat, hover elevated with shadow transition, selected with blue border
  
- **Icon Selection**: 
  - Plus (Add task)
  - CheckCircle (Complete task)
  - Trash (Delete)
  - PencilSimple (Edit)
  - FunnelSimple (Filter)
  - ChartBar (Analytics)
  - Tag (Categories)
  - CalendarBlank (Due dates)
  - Flag (Priority)
  
- **Spacing**: 
  - Container padding: p-6 on mobile, p-8 on desktop
  - Card gaps: gap-4 for task lists
  - Form fields: space-y-4
  - Section margins: mb-6 between major sections
  
- **Mobile**: 
  - Single column layout for task cards
  - Bottom sheet for task creation on mobile (drawer component)
  - Collapsible filters in mobile view
  - Sticky header with key actions
  - Touch-friendly 44px minimum tap targets
