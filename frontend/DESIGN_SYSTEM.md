# AI Career Adviser – Visual-Safe UI Specification

## CRITICAL RULE
**Do NOT invent sizes. Use ONLY the values defined below.**

---

## 1️⃣ Global Layout Rules

### App Container
- **Max width:** `1280px`
- **Page padding:**
  - Desktop: `px-8 py-6`
  - Tablet: `px-6 py-5`
  - Mobile: `px-4 py-4`
- **Background:** `#F8FAFC`

### Grid System
- **Desktop:** 12-column grid
- **Section gaps:**
  - Vertical section gap: `24px`
  - Card gap: `16px`
- **Rule:** Cards must never exceed 4 columns unless explicitly defined

---

## 2️⃣ Typography System

### Font
- **Family:** Inter
- **Line height:** `1.4` (default)
- **Letter spacing:** `-0.01em` (headings only)

### Font Scale (DO NOT CHANGE)

| Usage | Size | Weight |
|-------|------|--------|
| Page Title | `24px` | `600` |
| Section Title | `18px` | `600` |
| Card Title | `16px` | `600` |
| Body Text | `14px` | `400` |
| Secondary Text | `12px` | `400` |
| Badge / Label | `11px` | `500` |
| Large Stat Number | `32px` | `700` |

⚠️ **Rule:** No text may exceed `32px` anywhere.

---

## 3️⃣ Color Tokens (Only These)

```css
--primary: #2563EB
--success: #22C55E
--warning: #F97316
--bg: #F8FAFC
--card: #FFFFFF
--text-primary: #0F172A
--text-secondary: #64748B
--border: #E5E7EB
```

- ❌ No gradients
- ❌ No opacity below `0.6`

---

## 4️⃣ Card System

### Card Base
- **Border radius:** `12px`
- **Padding:** `16px`
- **Shadow:** `shadow-sm`
- **Border:** `1px solid #E5E7EB`
- **Background:** `#FFFFFF`

### Card Size Limits
- **Small card:** max height `120px`
- **Medium card:** max height `180px`
- **Large card:** max height `260px`

❌ **Cards must NEVER auto-expand vertically based on content**  
➡️ Use scroll inside if needed.

---

## 5️⃣ Navbar

- **Height:** `56px`
- **Logo size:** `24px`
- **Icon buttons:**
  - Size: `36px × 36px`
  - Icon inside: `18px`
- **Avatar:**
  - Size: `32px`
  - Circle only

---

## 6️⃣ Buttons (NO OVERSIZED BUTTONS)

### Primary Button
- **Height:** `40px`
- **Padding:** `px-4`
- **Font:** `14px / 500`
- **Border radius:** `8px`

### Secondary Button
- **Height:** `36px`
- **Border:** `1px solid #E5E7EB`

### Icon Button
- **Size:** `32px`
- **Icon size:** `16px`

---

## 7️⃣ Progress Bars & Indicators

### Linear Progress Bar
- **Height:** `6px`
- **Border radius:** `999px`
- **Background:** `#E5E7EB`
- **Fill:**
  - Success → Green
  - Active → Blue
  - Warning → Orange

### Circular Progress
- **Diameter:** `64px`
- **Stroke width:** `6px`
- **Center text:** `14px`

❌ **Do NOT exceed these sizes.**

---

## 8️⃣ Dashboard Page (Exact Layout)

### Row 1
- **Welcome Card** → 8 columns
- **Career Match Card** → 4 columns

### Row 2
- **Action Cards (3)**
  - Each: 4 columns
  - Height locked to `140px`

### CTA Section
- **Button width:** `200px`
- Center aligned

---

## 9️⃣ Career Quiz Page

### Question Card
- **Max width:** `720px`
- **Padding:** `24px`
- **Question text:** `18px / 600`

### Option Cards
- **Grid:** 2 columns
- **Card height:** `96px`
- **Icon:** `28px`
- **Text:** `14px`
- **Selected state:**
  - Border: `2px solid #2563EB`
  - Background: `#EFF6FF`

---

## 🔟 Career Insights Page

### Main Match Card
- **Height:** `180px`
- **Match % text:** `32px`
- **Badge circle:** `72px`

### Alternative Career List
- **Row height:** `48px`
- **Match badge:** `11px` text

---

## 1️⃣1️⃣ Career Pathway Timeline

### Timeline Height
- **Fixed:** `96px`

### Step Node
- **Circle size:** `24px`
- **Label text:** `12px`
- **Duration text:** `11px`

---

## 1️⃣2️⃣ Explore Careers Cards

- **Card height:** `160px`
- **Role title:** `16px`
- **Match %:** `12px`
- **Status badge height:** `20px`

---

## 1️⃣3️⃣ Skill Assessment Page

### Skill Bar
- **Height:** `8px`
- **Label text:** `14px`
- **Score number:** `16px / 600`

### Skill Groups
- **Vertical spacing:** `20px`

---

## 1️⃣4️⃣ Interview Prep Page

### Video Card
- **Height:** `180px`
- **Play icon:** `48px`

### Question List
- **Row height:** `44px`
- **Checkbox size:** `16px`

---

## 1️⃣5️⃣ Spacing System (Stop Visual Noise)

**Use ONLY:**
- `4px`
- `8px`
- `12px`
- `16px`
- `24px`

❌ If spacing is not one of these → **invalid**

---

## 1️⃣6️⃣ Animation Rules

- **Hover transition:** `150ms ease`
- **Progress animation:** `300ms ease`
- ❌ NO bounce
- ❌ NO spring

---

## 1️⃣7️⃣ Accessibility Baseline

- **Minimum contrast ratio:** `4.5`
- **Clickable area min height:** `36px`
- **All icons must have** `aria-label`

---

## Implementation Notes

This specification is **locked** and must be followed exactly. Any deviation requires explicit user approval.
