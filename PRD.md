# Planning Guide

A comprehensive Permit-to-Work (PTW) personnel management system that enables organizations to manage work permits, track responsibilities, and maintain compliance with safety procedures based on the STE-PR-10-05-Rev2 protocol.

**Experience Qualities**:
1. **Professional** - The interface must convey authority and trustworthiness, appropriate for industrial safety management
2. **Clear** - Critical safety information must be immediately visible and unambiguous to prevent miscommunication
3. **Accessible** - Multi-language support (Russian, Turkish, English) ensures all personnel can access vital information

**Complexity Level**: Complex Application (advanced functionality with role-based access)
  - Full authentication system with admin/viewer roles, persistent data management, multi-language support, and comprehensive safety procedure tracking

## Essential Features

### Role-Based Authentication
- **Functionality**: Admin login with GitHub authentication, public read-only access for non-admins
- **Purpose**: Protect sensitive personnel data while allowing authorized viewing
- **Trigger**: Page load checks authentication status
- **Progression**: Load app → Check auth → Show admin controls if authorized → Otherwise show read-only view
- **Success criteria**: Admins can edit data, others can only view; authentication persists across sessions

### Personnel Management
- **Functionality**: Add, edit, delete personnel with roles (Issuer, Supervisor, Foreman, Worker)
- **Purpose**: Maintain accurate records of who is authorized for what responsibilities
- **Trigger**: Admin clicks "Add Personnel" or edits existing entry
- **Progression**: Click add → Fill form → System auto-assigns duties based on role → Save → Updates list
- **Success criteria**: Role-based duties and qualifications are automatically assigned; changes persist

### Multi-Language Support
- **Functionality**: Switch between Russian, Turkish, and English with complete translation
- **Purpose**: Ensure all personnel can read procedures in their preferred language
- **Trigger**: Select language from dropdown
- **Progression**: Change language → All UI and content translates → Preference saves
- **Success criteria**: All text including duties, rules, and procedures translate completely

### Procedure Documentation
- **Functionality**: Display STE-PR-10-05-Rev2 procedure with roles, duties, and safety rules
- **Purpose**: Provide authoritative reference for PTW procedures
- **Trigger**: Navigate to Process, Rules, or Roles tabs
- **Progression**: Click tab → View formatted procedures → Reference specific rules
- **Success criteria**: Procedures are clearly formatted, searchable, and accessible

### Personnel Search & Filter
- **Functionality**: Filter by role type, search by name/position
- **Purpose**: Quickly locate specific personnel or view specific role groups
- **Trigger**: Type in search box or click role filter
- **Progression**: Enter criteria → List updates instantly → Select person → View details
- **Success criteria**: Fast filtering with immediate results

## Edge Case Handling
- **Unauthenticated Users**: Show full read-only interface; hide all edit/delete controls
- **Missing Data**: Handle legacy entries gracefully with default values
- **Language Switching Mid-Edit**: Preserve form data when language changes
- **Concurrent Edits**: Use KV store for data consistency
- **Network Issues**: Queue changes and retry on reconnection

## Design Direction
The design should feel authoritative and industrial-professional, balancing the seriousness of safety management with modern usability—a clean, structured interface that prioritizes information clarity over decorative elements.

## Color Selection
Analogous color scheme using deep slate blues and teals to convey professionalism, trust, and industrial reliability.

- **Primary Color**: Deep Slate (oklch(0.25 0.02 240)) - Communicates industrial professionalism and authority
- **Secondary Colors**: Steel Blue (oklch(0.45 0.08 240)) for interactive elements; Cyan Accent (oklch(0.65 0.12 210)) for highlights
- **Accent Color**: Safety Orange (oklch(0.70 0.15 45)) - Draws attention to warnings, high-priority items, and critical actions
- **Foreground/Background Pairings**:
  - Background (Light Steel oklch(0.96 0.01 240)): Dark Slate text (oklch(0.25 0.02 240)) - Ratio 10.2:1 ✓
  - Card (Pure White oklch(1 0 0)): Dark Slate text (oklch(0.25 0.02 240)) - Ratio 12.1:1 ✓
  - Primary (Deep Slate oklch(0.25 0.02 240)): White text (oklch(1 0 0)) - Ratio 12.1:1 ✓
  - Secondary (Steel Blue oklch(0.45 0.08 240)): White text (oklch(1 0 0)) - Ratio 6.8:1 ✓
  - Accent (Safety Orange oklch(0.70 0.15 45)): Dark text (oklch(0.25 0.02 240)) - Ratio 5.2:1 ✓
  - Muted (Light Gray oklch(0.94 0.01 240)): Medium Gray text (oklch(0.50 0.02 240)) - Ratio 5.5:1 ✓

## Font Selection
Typography should prioritize legibility and professionalism, appropriate for technical documentation; Inter for its clarity and comprehensive character set supporting Cyrillic, Latin, and Turkish.

- **Typographic Hierarchy**:
  - H1 (App Title): Inter Bold / 28px / tight tracking (-0.01em) / line-height 1.2
  - H2 (Section Headers): Inter SemiBold / 22px / normal tracking / line-height 1.3
  - H3 (Card Titles): Inter SemiBold / 16px / normal tracking / line-height 1.4
  - Body (Content): Inter Regular / 14px / normal tracking / line-height 1.6
  - Small (Metadata): Inter Medium / 12px / slight tracking (0.01em) / line-height 1.5
  - Button Text: Inter SemiBold / 14px / normal tracking / line-height 1.4

## Animations
Animations should be minimal and functional, respecting the professional context while providing necessary feedback for user actions.

- **Purposeful Meaning**: Subtle transitions when switching tabs or filtering convey responsiveness; modal appearances suggest layered importance
- **Hierarchy of Movement**:
  - Primary: Modal open/close for data entry
  - Secondary: List filtering and person selection
  - Tertiary: Hover states and button feedback

## Component Selection
- **Components**:
  - Tabs for main navigation (Personnel, Process, Roles, Rules, Analytics, Documents)
  - Card for personnel profiles and procedure sections
  - Dialog for add/edit personnel forms
  - Badge for role indicators and permit types
  - Button with primary/secondary/destructive variants
  - Input for text fields and search
  - Select for role and language selection
  - Scroll Area for long procedure lists
  - Avatar for personnel identification
  - Separator for section division

- **Customizations**:
  - Custom role badges with specific colors (Issuer: Purple, Supervisor: Pink, Foreman: Amber, Worker: Indigo)
  - Personnel sidebar with search and filter
  - Procedure sections with timeline layout
  - Stats cards for analytics dashboard

- **States**:
  - Buttons: Admin-only buttons hidden for non-admins; hover states for interactive feedback
  - Cards: Selected personnel highlighted; hover elevation for clickable cards
  - Inputs: Admin-only with focus rings; disabled for non-admins

- **Icon Selection**:
  - UserPlus (Add personnel)
  - PencilSimple (Edit)
  - Trash (Delete)
  - Users (Personnel)
  - FileText (Process/Documents)
  - ShieldCheck (Safety/Rules)
  - ChartBar (Analytics)
  - Globe (Language)
  - LockKey (Admin indicator)

- **Spacing**:
  - Container padding: p-4 on mobile, p-6 on desktop
  - Sidebar width: 280px on desktop, collapsible on mobile
  - Card gaps: gap-4 for lists
  - Form fields: space-y-4

- **Mobile**:
  - Collapsible sidebar that overlays content
  - Bottom sheet for personnel forms
  - Stacked layout for stats grid
  - Touch-friendly 44px tap targets
  - Sticky header with key controls
