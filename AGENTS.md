---
name: vibe-coding
description: Build complete web applications, SaaS products, and features using plain English descriptions. Based on Andrej Karpathy's vibe coding philosophy — describe intent, not code. Covers full-stack builds, screenshot-to-code, database design, UX specs, bug fixes, feature additions, and AI-driven iteration. Use when user wants to build something from a description, add features to existing apps, fix bugs by describing symptoms, or iterate on an application using only natural language.
compatibility: Created for Zo Computer
metadata:
  author: pap.zo.computer
---

# Vibe Coding Protocol & Philosophy

Describe what you want. Build anything.

Based on Andrej Karpathy's vibe coding philosophy: **the future of software isn't writing code — it's describing intent**. Translate plain English into complete, working applications.

## Core Workflows

### 1. Describe-to-Deploy
Build an entire application from a plain English description.
- Requirement translation → precise technical specification
- Tech stack selection → simplest stack, no over-engineering
- Frontend → every page, component, button, form fully implemented
- Backend → server, API routes, database, authentication
- Database design → tables, relationships, seed data
- User flow → landing → signup → core action → result
- Responsive design → phone, tablet, desktop
- Error handling → bad input, network failure, empty states
- One-command deployment → rapid production readiness
- Iteration protocol → describe changes in English, get them implemented

### 2. Screenshot-to-Code
Convert any screenshot, mockup, or sketch into pixel-perfect working code.
- Layout replication → exact structure, spacing, hierarchy
- Component identification → buttons, inputs, cards, nav, modals
- Colour extraction → match every colour, gradient, shadow
- Typography matching → font styles, sizes, weights, line heights
- Interactive elements → every button clickable, every form functional
- Responsive adaptation → works on mobile from desktop screenshots
- Hover states and animations → micro-interactions, transitions, loading
- Real content → actual text and images, not Lorem Ipsum
- Missing states → login, error, empty, loading pages

### 3. Feature Addition
Add new features to existing applications using only plain English.
- Feature understanding → restate back to confirm alignment
- Impact assessment → what changes, what new code
- UI changes → new buttons, pages, modals, interactions
- Data changes → new fields, tables, relationships
- Business logic → rules, calculations, conditions
- Edge cases → empty data, duplicates, permission conflicts
- Integration points → connects to existing features
- Testing plan → scenarios to verify before going live
- Rollback plan → undo without losing data

### 4. Bug Fixing
Fix bugs by describing the symptom, not the code.
- Symptom translation → identify likely technical cause
- Root cause analysis → explain WHY it's happening
- Reproduction steps → confirm how to trigger the bug
- The fix → exact code change needed
- Side effect check → does this break anything else
- Prevention measure → guard to prevent recurrence
- Testing verification → confirm fix works manually
- Common related bugs → fix similar bugs proactively

### 5. Database Design
Design a complete database from plain English description.
- Data identification → every type of information to store
- Table creation → columns and data types for each
- Relationships → logical connections between tables
- Required fields → mandatory vs optional
- Unique constraints → no duplicate emails, usernames
- Default values → sensible defaults
- Sample data → realistic rows for testing
- Query library → common queries ready-to-use
- Search functionality → find by name, date, category, keyword

### 6. UX Design
Design a complete user interface from plain English feel description.
- Layout structure → header, sidebar, main content, footer placement
- Navigation flow → page movement, menu system
- Component selection → dropdown vs radio, modal vs page, toggle vs checkbox
- Visual hierarchy → what user sees first, second, third
- Empty states → first-time user experience
- Loading states → waiting experience
- Error states → clear messages, not technical errors
- Mobile adaptation → phone reorganization
- Accessibility → works for visual, motor, cognitive differences
- Micro-interactions → animations and responsive feedback

### 7. MVP Launch
Ship a live, usable product by end of today.
- Ruthless scoping → features that MUST work for V1 value
- Rapid path → single page that does one thing well
- Deploy fast with GitHub push
- Landing page → what it does, for whom, CTA
- Feedback mechanism → simple way for users to report issues

### 8. AI Iteration Loop
Continuously improve an existing application through AI-driven iteration.
- Current state audit → biggest weaknesses
- Priority ranking → biggest impact, least risk
- Performance optimisation → slow queries, re-renders, bloated bundles
- Code cleanup → messy, duplicated, fragile code
- Security hardening → vulnerabilities, exposed keys, unprotected routes
- Missing error handling → crash points with white screens
- SEO implementation → meta tags, OpenGraph, structured data, sitemap
- Accessibility pass → WCAG violations
- Mobile performance → slow connections, touch interactions

### 9. Full SaaS Builder
Build an entire SaaS application from a single English description.
- Landing page → hero, features, pricing, testimonials, signup CTA
- Authentication → signup, login, logout, forgot password, protected routes
- Dashboard → main screen with data and primary actions
- Core feature → the ONE thing users pay for, fully built
- Settings page → account, profile, subscription
- Pricing and payment → billing portal, checkout
- Database → tables, relationships, queries
- API → every endpoint with authentication
- Admin panel → users, revenue, system health

## Usage Guidelines

1. **Start with the description** — Describe what you want in plain English
2. **Confirm understanding** — Restate what we're building to align on intent
3. **Choose the right workflow** — Match the request to the appropriate pattern above
4. **Build incrementally** — Complete, working implementations
5. **Test before shipping** — Verify every interactive element works
6. **Iterate based on feedback** — Describe changes, get them implemented immediately

## Vibe Principles

- **Describe intent, not code** — "I want a button that does X" beats "write an onClick handler"
- **Design IS the specification** — The screenshot, mockup, or sketch IS the code spec
- **Symptom over diagnosis** — "When I click X, Y happens" is enough to fix the bug
- **Ship first, perfect later** — Get to working reality fast, iterate based on real feedback
- **Technology is invisible** — Speak in terms of outcomes, aesthetics, feel, and features
