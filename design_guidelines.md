# AI Tutor Avatar System - Design Guidelines

## Design Approach

**Reference-Based Approach** drawing inspiration from educational platforms like Duolingo, Khan Academy, and Notion, combined with modern productivity tools like Linear for clean typography and Stripe for sophisticated simplicity.

**Core Principles:**
- Warm and encouraging (not clinical or robotic)
- Clear visual hierarchy for learning flow
- Approachable interface that reduces learning anxiety
- Professional yet friendly aesthetic

## Color Palette

**Light Mode:**
- Primary: 210 95% 50% (Friendly blue - trust and learning)
- Secondary: 145 70% 45% (Success green for correct answers)
- Error: 0 75% 60% (Gentle red for incorrect - not harsh)
- Background: 210 15% 98% (Soft off-white)
- Surface: 0 0% 100% (Pure white cards)
- Text Primary: 220 20% 15% (Warm dark gray)
- Text Secondary: 220 15% 45%

**Dark Mode:**
- Primary: 210 85% 60% (Softer blue for dark)
- Secondary: 145 60% 50%
- Error: 0 65% 65%
- Background: 220 25% 8% (Deep navy-tinted dark)
- Surface: 220 20% 12% (Elevated surfaces)
- Text Primary: 210 10% 95%
- Text Secondary: 210 10% 65%

**Accent Colors:**
- Avatar Active: 270 70% 60% (Soft purple for avatar speaking state)
- Highlight: 45 95% 55% (Warm amber for achievements/streaks)

## Typography

**Font Families:**
- Primary: 'Inter' (Clean, readable for interface)
- Headings: 'Lexend' (Friendly, designed for readability)
- Code/Technical: 'JetBrains Mono' (For any code snippets in PDFs)

**Scale:**
- Display: text-5xl/text-6xl font-bold (Hero, welcome messages)
- H1: text-3xl/text-4xl font-semibold (Page titles)
- H2: text-2xl font-semibold (Section headers)
- H3: text-xl font-medium (Card titles, quiz questions)
- Body: text-base (Main content, explanations)
- Small: text-sm (Helper text, metadata)
- Tiny: text-xs (Timestamps, hints)

## Layout System

**Spacing Primitives:** Tailwind units of 3, 4, 6, 8, 12, 16
- Micro spacing: space-y-3, gap-3 (tight groupings)
- Component padding: p-4, p-6 (cards, buttons)
- Section spacing: py-8, py-12 (between major sections)
- Page margins: px-4 md:px-8 lg:px-12

**Container Strategy:**
- Max width: max-w-6xl (main content)
- Quiz interface: max-w-3xl (optimal reading width)
- Avatar section: max-w-4xl (when avatar is active)

## Component Library

### Navigation
- Top bar with logo, progress indicator (for auth users), account/guest toggle
- Clean minimal nav: Home, My Progress (auth only), Upload PDF
- Sticky on scroll with subtle shadow on dark mode

### Cards & Surfaces
- Rounded corners: rounded-xl (warm, friendly)
- Subtle shadows: shadow-sm on light, shadow-lg with colored glow on dark
- Border treatment: border border-gray-200 dark:border-gray-800
- Hover states: Gentle lift with shadow-md transition

### Quiz Interface
- Large, readable question cards with generous padding (p-8)
- MCQ options as interactive cards with hover states
- Selected state: border-2 border-primary with subtle background tint
- Correct/Incorrect states: Green/Red border with icon feedback
- Progress bar at top showing quiz completion

### Avatar Player Section
- Prominent placement when explaining concepts
- Video container: aspect-video with rounded-lg overflow-hidden
- Speaking state indicator: Subtle pulse animation on border
- Concept title above avatar: text-xl font-semibold
- Explanation text below avatar (if needed): text-base text-secondary

### Upload Section
- Drag-and-drop zone: Dashed border, large dropzone
- File preview with extracted concepts count
- Processing state: Animated gradient background during extraction

### Progress Dashboard (Auth Users)
- Stat cards in grid: 2-column on mobile, 4-column on desktop
- Weak concepts list with retry buttons
- Achievement badges (streaks, perfect scores)
- Recent activity timeline

### Authentication Modal
- Center modal overlay with backdrop blur
- Tab switcher: Login / Sign Up / Continue as Guest
- Guest mode explanation: "Try it now, save progress later"
- Social auth buttons (via Replit Auth)

### Buttons
- Primary: bg-primary hover:bg-primary/90 text-white
- Secondary: border-2 border-primary text-primary hover:bg-primary/5
- Ghost: text-primary hover:bg-primary/5
- Success: bg-green-600 (for correct answers feedback)
- Sizes: Regular (h-10 px-4), Large (h-12 px-6) for CTAs

### Forms
- Input fields: Dark mode compatible with proper contrast
- Focus states: ring-2 ring-primary ring-offset-2
- Error states: ring-red-500 with error message below
- PDF upload: Large dropzone with clear instructions

## Animations

**Minimal & Purposeful:**
- Avatar speaking: Gentle pulse on container border (2s ease-in-out)
- Question reveal: Fade + slide up (300ms)
- Answer feedback: Scale pulse on selection (200ms)
- Transition states: opacity and transform (200-300ms)
- NO complex scroll animations or parallax

## Images

**Hero Section Image:**
- Illustration or photo of friendly AI/robot tutor with student
- Placement: Right side on desktop (50% width), full-width on mobile
- Style: Warm, inviting, diverse representation of students
- Alternative: Abstract learning-themed illustration with nodes/connections

**Avatar Placeholder:**
- Before HeyGen loads: Friendly avatar silhouette or animated gradient
- Loading state: Subtle shimmer effect

**Empty States:**
- Upload section: Illustration of document with sparkles/AI elements
- No quizzes yet: Encouraging illustration with CTA

**Icons:**
- Use Heroicons for all UI icons
- Educational icons from specialized sets via CDN for concepts
- Trophy/badge icons for achievements

## Page-Specific Guidelines

### Landing/Welcome Page
- Hero: Large heading "Your AI Tutor, Always Ready to Help" with avatar image
- Value props in 3-column grid: Upload → Learn → Master
- Demo video or screenshot showcase
- Dual CTA: "Start Learning (Guest)" + "Sign Up for Progress Tracking"

### Quiz Interface
- Clean, focused layout with minimal distractions
- Question number indicator: "Question 3 of 10"
- Large question text with 4 answer options below
- Submit/Next button only enabled after selection
- Immediate feedback: checkmark/X with brief explanation

### Explanation Mode (Wrong Answer)
- Avatar video takes center stage (max-w-4xl)
- Concept title prominent above
- Avatar speaks Gemini-generated explanation
- Replay button if user wants to hear again
- "Got it! Next question" CTA below

### Dashboard (Auth)
- Welcome message: "Welcome back, [Name]!"
- Progress cards showing: Total concepts, Accuracy %, Weak areas, Streak
- Recent PDFs uploaded with "Resume Quiz" buttons
- Recommendations: "Focus on these concepts next"

## Accessibility & Quality

- WCAG AA contrast ratios maintained in both modes
- Focus indicators always visible
- Keyboard navigation for quiz interface
- Screen reader labels for all interactive elements
- Dark mode fully implemented including form inputs
- Reduced motion preference respected (disable animations)