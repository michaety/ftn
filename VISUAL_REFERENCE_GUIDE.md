# Visual Reference Guide - CSS Implementation

## Purpose

This document provides visual descriptions and references for all CSS implementations in the `michaety/ftn` repository, serving as a verification guide for style rendering.

---

## Design System 1: Brutalist News Design

### Pages Using This Design
- Home page (`/`)
- Article listing (`/news`)
- Article detail pages (`/article/[slug]`, `/news/articles/[slug]`)

### Visual Characteristics

#### Color Palette
```
Background:  #f5f5dc (Beige - "Canvas")
Cards:       #ffffff (White)
Text:        #000000 (Pure Black)
Meta Text:   #808080 (Gray)
Borders:     #000000 (Black, 6px thick)
Actions:
  - Approve: #00ff00 (Pure Green)
  - Reject:  #ff0000 (Pure Red)
  - Edit:    #0000ff (Pure Blue)
```

#### Typography
- **Font Family**: Courier New (monospace)
- **Titles**: 2rem-3rem, bold (900), UPPERCASE
- **Body**: 1rem-1.1rem, regular
- **Meta**: 0.9rem, bold (700), UPPERCASE

#### Layout Elements

**Header**:
- Black background (#000000)
- White text (#ffffff)
- 6px solid black border on bottom
- Logo: 2.5rem, ultra-bold, UPPERCASE
- Navigation: White links with 3px underline on hover

**Article Cards**:
- White background
- 6px solid black border
- Image: 300px height (400px for featured)
- Object-fit: cover (no distortion)
- Thick 6px black border on images
- Title: 2rem, bold, UPPERCASE, black
- Hover: Slight upward movement (translateY -2px)

**Article Grid**:
- CSS Grid layout
- Auto-fill columns: minmax(350px, 1fr)
- Gap: 30px between cards
- Featured article: Full width (grid-column: 1 / -1)

**Footer**:
- Black background
- White text
- 6px solid black border on top
- Links with underline on hover (2px thickness)

#### Buttons
- Base: Black background, white text
- 3px solid borders
- Bold (700), UPPERCASE text
- Hover: Inverted colors
- Variants:
  - Approve: Green background → black background with green text
  - Reject: Red background → black background with red text
  - Edit: Blue background → black background with blue text

#### Forms
- White background
- 6px solid black border
- Canvas-colored inputs (#f5f5dc)
- Blue border on focus
- 3px borders on inputs

### Expected Visual Appearance

**Overall Feel**: Raw, functional, high-contrast, bold, industrial

**What You Should See**:
1. Warm beige background covering entire page
2. Stark black header with white text
3. White cards "floating" on beige background
4. Very thick (6px) black borders everywhere
5. Monospace font (like a typewriter)
6. ALL UPPERCASE titles and labels
7. Pure, vibrant colors (no gradients, no subtle shades)
8. Strong visual hierarchy through size and weight

**What You Should NOT See**:
- ❌ White/gray backgrounds
- ❌ Subtle shadows or gradients
- ❌ Sans-serif fonts (Arial, Helvetica)
- ❌ Rounded corners
- ❌ Thin borders (1px, 2px)
- ❌ Mixed case in titles
- ❌ Faded or muted colors

### Responsive Behavior

**Desktop (>768px)**:
- Multi-column grid (2-3 columns)
- Full-size typography
- Horizontal navigation

**Tablet (<=768px)**:
- 2-column grid or single column
- Reduced font sizes (3rem → 2rem)
- Stacked navigation

**Mobile (<=480px)**:
- Single column grid
- Further reduced fonts (3rem → 1.5rem)
- Image height: 200px
- Stacked elements

---

## Design System 2: Newspaper Design

### Pages Using This Design
- Login (`/login`)
- Signup (`/signup`)

### Visual Characteristics

#### Color Palette
```
Background:   #f5f0e6 (Aged Beige)
Paper:        #fdfaf5 (Off-white)
Ink:          #1a1a1a (Dark Black-Brown)
Sepia:        #8b7355 (Aged Brown)
```

#### Typography
- **Body Font**: Georgia (serif)
- **Display Font**: Playfair Display (loaded from Google Fonts)
- **Header**: 5.5em, ultra-bold (900), UPPERCASE, 8px letter-spacing
- **Decorative**: Text shadows, vintage feel

#### Background Effects
- **Texture**: External image from transparenttextures.com (old-wallpaper.png)
- **Overlay**: Repeating gradient for paper aging effect
- **Shadow**: Subtle shadows for depth

#### Layout Elements

**Header**:
- Off-white background (#fdfaf5)
- Centered text
- 4px double border on bottom
- 2px solid border on top
- Decorative horizontal lines above/below text
- Box shadow for depth
- Ornate, vintage newspaper masthead style

**Forms**:
- Paper-white background
- Vintage styling
- Serif fonts throughout
- Elegant, classic appearance

### Expected Visual Appearance

**Overall Feel**: Vintage newspaper, aged paper, classic typography, nostalgic

**What You Should See**:
1. Textured beige background (visible pattern)
2. Paper-like surfaces with subtle aging
3. Elegant serif fonts (Georgia, Playfair)
4. Decorative borders and lines
5. Centered, formal layouts
6. Vintage newspaper masthead
7. Shadows and depth effects

**What You Should NOT See**:
- ❌ Flat, modern design
- ❌ Sans-serif fonts
- ❌ Bright white backgrounds
- ❌ Sharp, digital appearance
- ❌ Monospace fonts

### External Dependencies
⚠️ **Note**: This design requires external resources:
- Google Fonts API (Playfair Display)
- transparenttextures.com (background texture)

If these are unavailable, fallback to:
- Georgia only for fonts
- Solid color background

---

## Design System 3: Admin Dashboard (Tailwind)

### Pages Using This Design
- Admin home (`/admin`)
- Customers (`/admin/customers`)
- Subscriptions (`/admin/subscriptions`)
- All admin/* routes

### Visual Characteristics

#### Color System
Uses CSS custom properties in HSL format:

```css
Light Mode:
--background: 0 0% 100%     (White)
--foreground: 0 0% 3.9%     (Near Black)
--primary: 0 0% 9%          (Dark Gray)
--muted: 0 0% 96.1%         (Light Gray)

Dark Mode:
--background: 0 0% 3.9%     (Near Black)
--foreground: 0 0% 98%      (Near White)
--primary: 0 0% 98%         (Near White)
```

#### Typography
- **Font Stack**: System fonts (ui-sans-serif, system-ui)
- **Sizing**: Tailwind scale (text-sm, text-base, text-lg, etc.)
- **Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

#### Components

**shadcn/ui Components**:
- Buttons (primary, secondary, outline, destructive, ghost)
- Tables (data tables with sorting/filtering)
- Dialogs/Modals
- Forms (inputs, labels, validation)
- Cards
- Badges

**Layout**:
- Clean, modern card-based layout
- Responsive grid system
- Proper spacing (Tailwind spacing scale)
- Consistent padding/margins

### Expected Visual Appearance

**Overall Feel**: Modern, clean, professional, component-driven

**What You Should See**:
1. Clean white background (or dark in dark mode)
2. Modern sans-serif fonts
3. Subtle borders (1px)
4. Rounded corners (border-radius)
5. Box shadows on cards
6. Smooth transitions
7. Consistent spacing
8. Interactive components (hover states, focus rings)

**What You Should NOT See**:
- ❌ Thick brutalist borders
- ❌ Monospace fonts
- ❌ Pure colors (black, red, green)
- ❌ Beige backgrounds
- ❌ Uppercase everything

### Component Examples

**Button Variants**:
- Default: Black background, white text
- Outline: Transparent with border
- Destructive: Red background
- Ghost: Transparent, no border
- All with subtle hover effects

**Tables**:
- Striped rows (subtle alternation)
- Hover highlighting
- Sortable columns
- Border between rows
- Responsive on mobile

---

## Verification Checklist

### General Checks (All Pages)

✅ **No Flash of Unstyled Content (FOUC)**
- Styles load immediately
- No white flash before styles apply
- Consistent appearance on first render

✅ **Responsive Design**
- Test at 1920px (desktop)
- Test at 768px (tablet)
- Test at 375px (mobile)
- No horizontal scrollbars
- Text remains readable
- Touch targets adequate on mobile

✅ **CSS Loading**
- Check Network tab in DevTools
- CSS files present (admin.*.css, login.*.css, _slug_.*.css)
- No 404 errors for CSS
- Files load quickly (<500ms)

### Brutalist Design Checks (/, /news, /article/*)

✅ **Colors**
- [ ] Beige background (#f5f5dc) visible
- [ ] Black header with white text
- [ ] White article cards
- [ ] 6px thick black borders

✅ **Typography**
- [ ] Courier New font (monospace look)
- [ ] Uppercase titles
- [ ] Bold weights (titles look heavy)

✅ **Layout**
- [ ] Grid layout with columns
- [ ] Cards have spacing
- [ ] Featured article spans full width

✅ **Interactive Elements**
- [ ] Hover on cards: slight lift
- [ ] Hover on links: underline appears
- [ ] Buttons invert colors on hover

### Newspaper Design Checks (/login, /signup)

✅ **Visual**
- [ ] Textured/patterned background
- [ ] Serif fonts (Georgia/Playfair)
- [ ] Vintage newspaper header
- [ ] Decorative borders

✅ **External Resources**
- [ ] Google Fonts loading (check Network tab)
- [ ] Background texture loading
- [ ] Fallback if external resources fail

### Admin Dashboard Checks (/admin/*)

✅ **Design**
- [ ] Clean white background
- [ ] Modern sans-serif fonts
- [ ] Subtle shadows and borders
- [ ] Rounded corners on components

✅ **Components**
- [ ] Buttons styled correctly
- [ ] Tables formatted properly
- [ ] Forms have proper validation styling
- [ ] Cards have shadows

✅ **Interactions**
- [ ] Hover states work
- [ ] Focus rings visible
- [ ] Smooth transitions
- [ ] Dark mode toggle works (if implemented)

---

## CSS File Mapping

For debugging, here's what CSS file loads on each page:

| Route | Generated CSS File | Source CSS | Design System |
|-------|-------------------|------------|---------------|
| `/` | `_slug_.*.css` | `main.css` | Brutalist |
| `/news` | `_slug_.*.css` | `main.css` | Brutalist |
| `/article/[slug]` | `_slug_.*.css` | `main.css` | Brutalist |
| `/news/articles/[slug]` | `_slug_.*.css` | `main.css` | Brutalist |
| `/login` | `login.*.css` | `news.css` | Newspaper |
| `/signup` | `login.*.css` | `news.css` | Newspaper |
| `/admin` | `admin.*.css` | `globals.css` + `admin.css` | Tailwind |
| `/admin/*` | `admin.*.css` | `globals.css` + `admin.css` | Tailwind |

*Note: Actual hash in filename (e.g., `_slug_.BN7EJjf7.css`) will vary between builds.*

---

## Common Issues & Visual Symptoms

### Issue: Tailwind Overriding Custom CSS

**Symptoms**:
- Beige pages appear white
- Courier New replaced by sans-serif
- Thick borders missing
- Looks like generic Tailwind site

**Check**:
```javascript
// astro.config.mjs should have:
tailwind({ applyBaseStyles: false })
```

**Visual Test**: If news pages look like admin pages, this is the issue.

### Issue: CSS Not Loading

**Symptoms**:
- Page appears with browser default styles
- Times New Roman font
- No background colors
- No layout (stacked elements)

**Check**:
- Network tab: Is CSS file loading?
- Is page using a layout component?
- Does `dist/_astro/` contain CSS files?

**Visual Test**: If page looks like unstyled HTML, CSS isn't loading.

### Issue: FOUC (Flash of Unstyled Content)

**Symptoms**:
- Brief flash of default styles
- Styles "pop in" after 1-2 seconds
- Jarring visual transition

**Check**:
- Are styles in `<head>` or loaded async?
- Using layout components?
- `applyBaseStyles: false` set?

**Visual Test**: Reload page multiple times, watch for flicker.

---

## Performance Metrics

### Target Metrics

- **CSS File Size**: <25KB per bundle
- **Load Time**: <200ms for CSS
- **First Contentful Paint**: <1.5s
- **No FOUC**: Styles visible in first frame

### Current Metrics (From Build)

```
admin.d_4-GldY.css     20.7 KB  ✅ (Within target)
login.Cv846QQN.css     10.3 KB  ✅ (Within target)
_slug_.BN7EJjf7.css     9.9 KB  ✅ (Within target)
```

All files minified and optimized.

---

## Maintenance Notes

### When Adding New Pages

1. **Choose Design System**: Decide brutalist, newspaper, or admin
2. **Use Appropriate Layout**: Match layout to design system
3. **Test Build**: Verify CSS generated
4. **Visual Check**: Confirm correct styles applied

### When Modifying Styles

1. **Edit Correct CSS File**: 
   - News → `main.css`
   - Login → `news.css`
   - Admin → `admin.css`
2. **Test All Affected Pages**: Changes may impact multiple routes
3. **Check Responsive**: Test at all breakpoints
4. **Verify No Conflicts**: Ensure other systems unaffected

### When Debugging Style Issues

1. **Check Network Tab**: Is CSS loading?
2. **Inspect Element**: What CSS rules are applied?
3. **Check Layout**: Which layout component is used?
4. **Verify Config**: Is `applyBaseStyles: false`?
5. **Build Output**: Are CSS files generated?

---

## Conclusion

This visual reference guide provides the criteria for verifying that all CSS implementations are rendering correctly. Use this document to:

- **Verify** new deployments render correctly
- **Debug** style issues by comparing to expected appearance
- **Onboard** new developers to the design systems
- **Document** visual specifications for testing

All three design systems are currently functional and properly isolated. This guide serves as the source of truth for what users should see when visiting each section of the application.

---

**Document Version**: 1.0  
**Last Updated**: 2025-11-19  
**Status**: Current visual reference validated
