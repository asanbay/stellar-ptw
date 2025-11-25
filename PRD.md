# Planning Guide

A comprehensive, high-performance Permit-to-Work (PTW) personnel management system that enables organizations to manage work permits, track responsibilities, and maintain compliance with safety procedures based on the STE-PR-10-05-Rev2 protocol. Optimized for fast loading and accessible via shareable link.

**Experience Qualities**:
1. **Professional** - The interface must convey authority and trustworthiness, appropriate for industrial safety management
2. **Clear** - Critical safety information must be immediately visible and unambiguous to prevent miscommunication
3. **Accessible** - Multi-language support (Russian, Turkish, English) ensures all personnel can access vital information; optimized for instant loading

**Complexity Level**: Complex Application (advanced functionality with role-based access)
  - Full authentication system with admin/viewer roles, persistent data management, multi-language support, comprehensive safety procedure tracking, and performance optimizations for fast loading

## Essential Features

### Performance Optimization
- **Functionality**: Lazy loading of heavy components, initial loading screen, code splitting, and memoization
- **Purpose**: Ensure application loads quickly and is responsive for all users accessing via shareable link
- **Trigger**: Application starts loading
- **Progression**: Show loading screen → Load core UI → Lazy load tabs on demand → Cache loaded components
- **Success criteria**: Initial page load under 2 seconds, smooth transitions, responsive UI

### PTW Creation and Management
- **Functionality**: Create, edit, and track Permits to Work (PTW/НД) with different types (Height, Hot Work, Confined Space, Earthwork, Hazardous Factors)
- **Purpose**: Digitize and manage work permits according to STE-PR-10-05-Rev2 procedure
- **Trigger**: Admin clicks "Create PTW" button
- **Progression**: Select work type → Fill work details → Assign personnel (Issuer, Supervisor, Foreman) → Set dates → Save draft → Issue permit → Track status
- **Success criteria**: PTW forms are created with unique numbers, stored persistently, filtered by type/status, and follow the 7-day validity rule

### Combined Works Journal
- **Functionality**: Track and coordinate multiple simultaneous works on the same site (STE-LOG-10-27)
- **Purpose**: Ensure safe coordination when multiple teams/organizations work in overlapping zones
- **Trigger**: Admin adds entry when combined works are scheduled
- **Progression**: Specify date and location → List PTW numbers → Assign coordinator → Document safety measures → Save entry
- **Success criteria**: Combined works are logged, linked to PTWs, visible to all users, coordinator identified

### Role-Based Authentication
- **Functionality**: Admin/User mode switching with password authentication (password: "123"), separate access levels
- **Purpose**: Protect sensitive personnel data while allowing authorized viewing and editing
- **Trigger**: User clicks "Admin" or "User" button in header
- **Progression**: Click Admin → Enter password → Authenticate → Switch to admin mode with full editing → Click User to return to read-only
- **Success criteria**: Admins can edit all data after entering password, users can only view; mode persists during session

### Information Board
- **Functionality**: Announcement board displayed on main screen where admins can post and edit notices, all users can view
- **Purpose**: Share current information, updates, and announcements with all personnel
- **Trigger**: Auto-displays on Personnel tab; admins can add/edit announcements
- **Progression**: Admin mode → Click add announcement → Enter title and content → Save → Appears for all users
- **Success criteria**: Announcements persist, display chronologically, admins can edit/delete, users see all posts

### Personnel Management
- **Functionality**: Add, edit, delete personnel with roles (Issuer, Supervisor, Foreman, Worker) - admin mode only
- **Purpose**: Maintain accurate records of who is authorized for what responsibilities
- **Trigger**: Admin clicks "Add Personnel" or edits existing entry
- **Progression**: Click add → Fill form → System auto-assigns duties based on role → Save → Updates list
- **Success criteria**: Role-based duties and qualifications are automatically assigned and not editable; changes persist; only available in admin mode

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

### PTW Status Workflow
- **Functionality**: Track PTW lifecycle through statuses: Draft → Issued → In Progress → Completed → Closed
- **Purpose**: Maintain compliance and audit trail for all work permits
- **Trigger**: Admin changes status based on work progress
- **Progression**: Create draft → Issue to supervisor → Start work → Complete work → Close permit
- **Success criteria**: Status changes are tracked with timestamps, cannot skip required steps, closed permits are archived

## Edge Case Handling
- **Slow Network**: Show loading indicators, lazy load non-critical components, cache data locally
- **Initial Load**: Display branded loading screen with spinner until app is ready
- **Unauthenticated Users**: Show full read-only interface in user mode; hide all edit/delete controls
- **Wrong Password**: Show error message, prevent admin mode access
- **Missing Data**: Handle legacy entries gracefully with default values
- **Language Switching Mid-Edit**: Preserve form data when language changes
- **Concurrent Edits**: Use KV store for data consistency
- **Network Issues**: Queue changes and retry on reconnection
- **Empty Announcements**: Show friendly empty state encouraging first post
- **PTW Expiration**: Warn when PTWs approach 7-day validity limit
- **Team Size Limits**: Validate max 20 people per PTW (require HSE approval for more)
- **Duplicate PTW Numbers**: Auto-generate unique numbers based on year and sequence
- **Missing Personnel Assignments**: Validate required roles before issuing PTW

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
  - Tabs for main navigation (Personnel, Permits, Combined Works, Process, Roles, Rules, Analytics, Documents)
  - Card for personnel profiles, PTW forms, procedure sections, and information board
  - Dialog for add/edit personnel, PTW creation/editing, and admin login
  - Badge for role indicators, permit types, and status indicators
  - Button with primary/secondary/destructive variants
  - Input for text fields, search, dates, and password entry
  - Textarea for work descriptions, announcements, and notes
  - Select for role, PTW type, status, and language selection
  - Checkbox for combined works flag and team member selection
  - Scroll Area for long procedure lists and PTW details
  - Avatar for personnel identification
  - Separator for section division

- **Customizations**:
  - Custom role badges with specific colors (Issuer: Purple, Supervisor: Pink, Foreman: Amber, Worker: Indigo)
  - PTW status badges with color coding (Draft: Gray, Issued: Blue, In Progress: Green, Completed: Purple, Closed: Slate, Cancelled: Red)
  - PTW type badges showing document codes (STE-PTW-10-01 through 10-05)
  - Personnel sidebar with search and filter
  - Procedure sections with timeline layout
  - Stats cards for analytics dashboard
  - Information board with admin edit controls and chronological display
  - Admin/User mode toggle buttons with password protection
  - Combined works journal with multi-PTW linking
  - PTW form with role-based personnel assignment

- **States**:
  - Buttons: Admin-only buttons hidden for non-admins; hover states for interactive feedback
  - Cards: Selected personnel highlighted; hover elevation for clickable cards
  - Inputs: Admin-only with focus rings; disabled for non-admins

- **Icon Selection**:
  - UserPlus (Add personnel)
  - PencilSimple (Edit)
  - Trash (Delete)
  - Users (User mode / Combined works)
  - User (Switch to user mode)
  - FileText (Process/Documents/PTW)
  - ShieldCheck (Safety/Rules)
  - ChartBar (Analytics)
  - Globe (Language)
  - LockKey (Admin indicator/login)
  - SignIn (Login action)
  - SignOut (Logout)
  - Plus (Add announcement/PTW/entry)
  - Check (Save/Approve)
  - X (Cancel/Close)
  - Eye (View details)
  - Clock (In progress status)
  - CheckCircle (Completed status)
  - XCircle (Cancelled status)
  - CalendarBlank (Date)
  - MapPin (Location)

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

---

## 📦 Deployment & Sharing

### Production Ready:
- ✅ Optimized for fast loading (< 2 seconds initial load)
- ✅ Lazy loading for all heavy components
- ✅ Memoization for performance
- ✅ Loading screen for better UX
- ✅ All data persists automatically via Spark KV

### How to Share:
1. Copy the Spark share link
2. Send to colleagues
3. Anyone with link can access (view-only by default)
4. Admins enter password `123` for edit access

### Documentation:
- `README.md` - Quick overview in Russian & English
- `USER_GUIDE.md` - Complete user guide (RU/EN/TR)
- `DEPLOYMENT_GUIDE.md` - How to deploy and share
- `HOW_TO_SHARE.md` - Step-by-step sharing instructions
- `QUICK_START.md` - Get started in 1 minute
- `PERFORMANCE.md` - Technical performance details

---

**Status:** ✅ Production Ready | ⚡ Optimized | 🚀 Ready to Share
