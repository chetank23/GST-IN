# integration.md — Frontend

## Project
Smart GST Billing & Compliance Assistant for MSMEs

## Purpose
Build a mobile-first, production-ready frontend for a super-simple GST billing product used by kirana stores, small shops, and MSMEs. The UI must let a non-technical user generate an invoice in under 30 seconds with minimal typing.

This frontend is **not a demo UI**. It must be structured so it can ship with real backend APIs, real auth, real invoice generation, OCR upload, WhatsApp-assisted flows, analytics, and offline-first support.

---

## Product Principles

1. **Zero learning curve**  
   Every screen must use plain language. Avoid tax jargon wherever possible. Show labels like:
   - “Customer name” instead of “Buyer master”
   - “Product name” instead of “line item”
   - “Generate Bill” instead of “Create invoice”
   - “GST details” instead of “tax computation”

2. **Mobile-first**  
   The primary device is a low-end Android phone. Layout must work beautifully on 360px width and scale up gracefully to tablet and desktop.

3. **Fast actions over deep menus**  
   The main flow should be one screen: add product, quantity, price, tap generate.

4. **Regional language support**  
   English + Hindi + at least one additional regional language architecture must be built in from day one. Translation keys must be externalized.

5. **Voice and scan friendly**  
   The frontend must support:
   - voice input
   - image upload / camera capture
   - WhatsApp-generated invoice links
   - offline-safe draft saving

6. **Trust and clarity**  
   In every compliance step, show clear status:
   - Draft
   - Valid
   - Needs attention
   - Ready to send
   - Sent to IRP
   - PDF generated
   - Shared on WhatsApp

---

## Tech Stack Assumptions

Use:
- **Next.js 14+ App Router**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** for core components
- **Framer Motion** for subtle animations
- **React Hook Form** + **Zod** for forms
- **TanStack Query** or server actions for data fetching
- **Zustand** or lightweight app state for draft invoices and offline state
- **i18next / next-intl** for translations
- **Recharts** for charts
- **Workbox / PWA support** for offline mode
- **IndexedDB** via Dexie or similar for draft persistence

Do not over-engineer the UI. Keep it crisp, large-touch, and easy to use.

---

## Folder Responsibilities

This folder should contain only frontend concerns:

- pages / routes
- layout
- reusable components
- input forms
- client state
- language switching
- invoice preview
- chart components
- upload/scan screens
- WhatsApp share screens
- offline indicators
- loading / error / empty states
- accessibility

The frontend must not contain business-rule logic that belongs in backend services, except for lightweight UX validation and temporary previews.

---

## Information Architecture

### Main navigation
Use a bottom navigation on mobile:

1. **Home**
2. **Bill**
3. **Scan**
4. **Reports**
5. **More**

Desktop may use a side rail, but the mobile experience is the source of truth.

### Primary screen order
1. Dashboard
2. New Bill
3. Scan Bill
4. WhatsApp Assist
5. Reports
6. Customers
7. Inventory
8. Settings

---

## Core Screens

### 1) Onboarding / Business Setup
Collect only the minimum:
- business name
- owner name
- GSTIN
- state
- language preference
- invoice prefix
- optional logo upload

Rules:
- show progress in 2–3 tiny steps
- skip any optional fields
- save as draft
- show a “finish later” option

### 2) Home Dashboard
Show at a glance:
- today’s sales
- today’s expenses
- today’s profit
- GST payable
- low stock items
- pending payments
- “quick actions”

Quick actions:
- New Bill
- Scan Bill
- Add Expense
- WhatsApp Bill
- Voice Bill

Use cards, not dense tables.

### 3) New Bill Screen
This is the most important screen.

Required interaction:
- Customer name (optional)
- Product name
- Quantity
- Price
- GST auto-suggest visible but editable
- Add another item

The UI should support:
- one product at a time for speed
- add multiple items after first item
- item suggestions from recent sales
- quick chips for frequent items
- keyboard focus flow optimized for single-handed use

At the bottom:
- subtotal
- GST split
- total
- “Generate PDF”
- “Save Draft”
- “Share on WhatsApp”

### 4) Invoice Preview Screen
Show:
- invoice number
- seller details
- buyer details
- line items
- tax breakup
- totals
- QR/IRN status
- print/download/share buttons

Need a clearly visible compliance badge:
- Draft
- Valid
- Ready for IRP
- IRN generated
- Rejected
- Needs correction

### 5) Scan Bill Screen
Allow:
- camera capture
- file upload
- drag and drop on desktop

After OCR:
- show extracted items
- let user review before saving
- highlight uncertain fields
- allow “confirm all” and “fix one row”

### 6) WhatsApp Assist Screen
Show:
- chat-like interface
- sample commands
- recognized text
- system response
- generated invoice preview
- send via WhatsApp button

This screen should feel like:
“Send a message → get a bill”

### 7) Reports Screen
Show:
- daily / weekly / monthly toggles
- sales line chart
- expense bar chart
- GST pie or donut chart
- profit trend
- top products
- category split

Keep chart labels readable on small screens.

### 8) Customers / Credit / Udhaar
Show:
- customer list
- pending dues
- last purchase date
- reminder button
- payment status

### 9) Inventory
Show:
- stock on hand
- low-stock warnings
- fast-moving items
- restock shortcut
- imported purchase updates from scan flow

### 10) Settings
Show:
- business profile
- language
- voice settings
- offline sync
- backup
- notification preferences
- WhatsApp integration status
- printer settings
- tax preferences
- user roles

---

## Frontend State Model

Create stable frontend state slices for:
- auth/session
- business profile
- invoice draft
- invoice history
- scanner result
- OCR confidence
- language settings
- offline queue
- notification status
- WhatsApp delivery status
- analytics filters
- inventory cache

Recommended pattern:
- server state via TanStack Query
- local draft state via Zustand
- offline persistence in IndexedDB

---

## Component Library Requirements

Create reusable UI components:
- `PrimaryButton`
- `SecondaryButton`
- `QuickActionCard`
- `StatCard`
- `CurrencyInput`
- `QuantityInput`
- `ProductAutocomplete`
- `GSTRateChip`
- `InvoiceStatusBadge`
- `EmptyState`
- `OfflineBanner`
- `SyncStatusDot`
- `LanguageToggle`
- `VoiceInputButton`
- `ScanUploadCard`
- `WhatsAppCommandCard`
- `MiniTrendChart`
- `SectionHeader`
- `BottomActionBar`

All buttons must be large enough for thumb usage.

---

## UX / UI Rules

### Must
- large touch targets
- minimal text
- strong hierarchy
- visible primary action
- zero clutter
- simple empty states
- loading skeletons
- accessible contrast
- readable font sizes
- sticky bottom action bars where useful

### Must not
- tables on the main billing screen
- crowded forms
- hidden critical actions
- tax-heavy language
- tiny icons without labels
- multi-step bill flow unless absolutely necessary

---

## Billing Flow UI Spec

### Goal
User should be able to finish a bill in three actions:
1. add product
2. enter quantity and price
3. tap generate

### Recommended layout
Top:
- invoice number
- customer field

Middle:
- item row editor
- add another item
- quick recent items

Bottom sticky:
- subtotal
- GST
- total
- generate button

### UX shortcuts
- pressing Enter moves focus to next field
- product autocomplete based on recent items
- auto-fill GST rate preview
- duplicate last item button
- “same as above” for repeated purchase items

---

## AI-Assisted UX

The frontend must support AI suggestions but not depend on them for core actions.

AI surfaces:
- GST rate suggestion
- product classification hint
- HSN/SAC suggestion
- OCR field correction
- low stock prediction
- expense anomaly warning

UI behavior:
- show AI suggestion as a chip
- allow one-tap accept
- always allow manual override
- show confidence only when helpful

Do not expose raw model jargon to users.

---

## OCR UX Spec

Flow:
1. user uploads bill image
2. system shows “Reading bill…”
3. extracted data appears in editable card list
4. fields with low confidence are highlighted
5. user taps “Save as Purchase” or “Save as Expense”

Required UI states:
- uploading
- processing
- extracted
- review required
- saved
- failed

---

## WhatsApp UX Spec

WhatsApp-related frontend behavior:
- show connected number
- show sample commands
- show delivery status
- support PDF preview before send
- show “copy message” fallback
- show retry if WhatsApp API fails

Example command styles:
- `Rice 2kg 100`
- `Add expense 500 electricity`
- `Show today sales`
- `GST report`
- `Send bill to Ramesh`

---

## Offline Mode UX

The app must work in bad internet conditions.

Frontend offline behavior:
- allow draft invoice creation
- cache recent customers/items
- keep OCR result reviewable
- queue invoice submission
- show sync state clearly
- let the user continue working even when backend is unavailable

Visible states:
- Online
- Offline
- Syncing
- Draft saved locally
- Sent later

---

## Accessibility Requirements

- keyboard navigable
- screen-reader labels
- high contrast mode
- minimum touch area should be generous
- avoid color-only meaning
- language switch should be accessible
- invoice preview should be printable and readable

---

## Responsive Layout Rules

### Mobile
- bottom nav
- sticky actions
- single-column layout

### Tablet
- two-column dashboard
- side panel preview for invoice

### Desktop
- workspace layout with:
  - left nav
  - main form
  - right preview

---

## API Contract Expectations

The frontend must expect these backend entities:
- business profile
- invoice draft
- invoice response
- OCR extraction response
- GST suggestion response
- analytics summary
- WhatsApp send response
- sync status

Do not hardcode API URLs directly in components. Centralize them in:
- `src/lib/api`
- `src/lib/queryKeys`
- `src/lib/types`

---

## Error Handling

Every failed operation must have:
- plain language error
- recommended next step
- retry button

Examples:
- “GSTIN looks invalid”
- “No internet. Saved locally.”
- “Could not read bill clearly”
- “WhatsApp send failed. Try again.”

---

## Non-Functional Requirements

The frontend must be:
- fast to load
- lightweight
- robust on low-end Android devices
- usable with one hand
- resilient to intermittent network
- production-grade
- maintainable by a small team

---

## Frontend Feature Flags

Prepare toggles for:
- voice billing
- OCR
- WhatsApp
- e-invoicing
- multi-language
- offline sync
- analytics cards
- credit reminders
- fraud alerts

Use feature flags so modules can ship independently.

---

## Suggested Frontend Folder Structure

```txt
frontend/
  src/
    app/
    components/
    features/
      billing/
      dashboard/
      scan/
      whatsapp/
      reports/
      inventory/
      customers/
      settings/
      onboarding/
    hooks/
    lib/
    store/
    i18n/
    styles/
    types/
    utils/
    assets/
  public/
  package.json
  tailwind.config.ts
  next.config.js
```

---

## Implementation Order

Build in this order:

1. App shell and navigation
2. Design system and reusable components
3. Onboarding flow
4. New bill flow
5. Invoice preview and PDF export screen
6. OCR upload and review
7. Dashboard and reports
8. WhatsApp assist screen
9. Offline sync UX
10. Language support
11. Accessibility refinement
12. Performance optimization

---

## Acceptance Criteria

Frontend is complete when:

- a user can create an invoice in under 30 seconds
- the UI is understandable without training
- mobile flow works on a low-end Android screen
- OCR review flow is clear
- WhatsApp invoice flow feels native
- dashboard shows sales, expenses, profit, and GST
- offline draft creation works
- language switch works
- invoice preview is print-ready
- all major screens have empty/error/loading states

---

## Prompt for GPT-Codex
When modifying or generating frontend code, always:
- preserve the mobile-first UX
- avoid unnecessary complexity
- keep field labels simple
- keep the main billing flow to the fewest possible steps
- make all screens production-ready
- create reusable components instead of duplicated UI
- keep the codebase scalable
- never break offline draft persistence
- never hide important actions
- ensure accessibility and responsiveness
- keep translation keys externalized
- use mock data only as temporary placeholders, never as final architecture
