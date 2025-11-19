# Fishtank News - Style Guide

This document explains the CSS architecture, design system, and guidelines for maintaining and extending the Fishtank News brutalist design.

## 🎨 Design Philosophy

Fishtank News uses a **brutalist design** approach characterized by:
- Bold, high-contrast colors
- Heavy borders and thick lines
- Monospace typography (Courier New)
- Uppercase text for emphasis
- Minimal use of rounded corners or shadows
- Raw, functional aesthetics

## 📁 CSS Organization

### Main Stylesheet
**Location:** `src/styles/main.css`

All styles are contained in a single, well-organized stylesheet that includes:
1. CSS Custom Properties (variables)
2. Base reset and typography
3. Layout components (container, grid)
4. Header and footer styles
5. Article card and detail styles
6. Button variants
7. Form elements
8. Dashboard components
9. Responsive breakpoints

## 🎨 CSS Variables

All core design values are defined as CSS custom properties in the `:root` selector:

### Colors
```css
--ftn-canvas: #f5f5dc;      /* Beige background */
--ftn-black: #000000;        /* Primary text and borders */
--ftn-white: #ffffff;        /* Card backgrounds */
--ftn-gray: #808080;         /* Meta text */
--ftn-light-gray: #d3d3d3;   /* Secondary backgrounds */
--ftn-red: #ff0000;          /* Reject/delete actions */
--ftn-green: #00ff00;        /* Approve/success actions */
--ftn-blue: #0000ff;         /* Edit actions and links */
```

### Usage
To use these variables in your CSS:
```css
.my-element {
  background-color: var(--ftn-canvas);
  color: var(--ftn-black);
  border: 6px solid var(--ftn-black);
}
```

## 🏗️ Layout System

### Container
```html
<div class="ftn-container">
  <!-- Content -->
</div>
```
- Max-width: 1200px
- Centered with auto margins
- 20px horizontal padding

### Article Grid
```html
<div class="ftn-articles-grid">
  <!-- Article cards -->
</div>
```
- CSS Grid layout
- Responsive columns: `repeat(auto-fill, minmax(350px, 1fr))`
- 30px gap between items
- Featured articles can span full width with `ftn-featured-article` class

## 🧩 Component Classes

### Header
- `.ftn-header` - Main header container with black background
- `.ftn-logo` - Site logo with uppercase text (2.5rem)
- `.ftn-nav` - Navigation flex container
- `.ftn-user` - Displays logged-in username
- `.ftn-logout-btn` - Red logout button

### Footer
- `.ftn-footer` - Black footer with white text
- `.ftn-footer-content` - Flex container for footer content
- `.ftn-footer-links` - Navigation links in footer

### Article Cards
- `.ftn-article-card` - Card container with white background and thick border
- `.ftn-article-image` - Image container with 300px height
- `.ftn-article-content` - Card content padding area
- `.ftn-article-title` - Bold, uppercase title (2rem)
- `.ftn-article-excerpt` - Article summary text
- `.ftn-article-meta` - Author and date info

### Article Detail
- `.ftn-article-detail` - Full article container (max-width: 900px)
- `.ftn-article-hero` - Hero image with border
- `.ftn-article-body` - Parsed markdown content
  - Headings: uppercase, bold
  - Links: blue with underline
  - Code blocks: black bg with green text
  - Blockquotes: canvas background with left border

### Buttons
- `.ftn-btn` - Base button (black with white text)
- `.ftn-btn-approve` - Green button for approval
- `.ftn-btn-reject` - Red button for rejection
- `.ftn-btn-edit` - Blue button for editing
- `.ftn-btn-delete` - Red button for deletion

All buttons have 3px borders and transform on hover.

### Forms
- `.ftn-form` - Form container with border
- `.ftn-form-title` - Form heading (2.5rem)
- `.ftn-form-group` - Input group with margin
- `.ftn-label` - Uppercase, bold labels
- `.ftn-input` - Text input with canvas background
- `.ftn-textarea` - Multi-line input
- `.ftn-error` - Red error message box
- `.ftn-success` - Green success message box

### Dashboard
- `.ftn-dashboard` - Dashboard wrapper
- `.ftn-dashboard-title` - Page title (3rem, centered)
- `.ftn-dashboard-section` - Section container
- `.ftn-section-title` - Section heading with bottom border

## 📱 Responsive Design

### Mobile-First Approach
Base styles target mobile devices, with enhancements for larger screens.

### Breakpoints
```css
/* Tablets and small desktops */
@media (max-width: 768px) {
  /* Reduced font sizes, stacked layouts */
}

/* Mobile phones */
@media (max-width: 480px) {
  /* Further size reductions */
}
```

### Key Responsive Changes
- **Header:** Stacks vertically on mobile
- **Grid:** Single column on mobile, multi-column on desktop
- **Typography:** Scales down (3rem → 2rem → 1.5rem for titles)
- **Images:** Reduced height on mobile (300px → 200px)

## 🖼️ Images and R2 Integration

### Article Images
Images are served from Cloudflare R2 storage:

```astro
const imageUrl = article.featured_image 
  ? `${r2PublicUrl}/${article.featured_image}`
  : null;
```

### Fallback Handling
If an article has no `featured_image`, the image container is hidden:
```astro
{imageUrl && (
  <div class="ftn-article-image">
    <img src={imageUrl} alt={article.title} loading="lazy" />
  </div>
)}
```

### Image Styling
- Fixed height for consistency (300px in cards, 400px for featured)
- `object-fit: cover` to prevent distortion
- 6px solid black border
- Lazy loading enabled with `loading="lazy"`

## ✏️ Customization Guide

### Changing Colors

To update the color scheme, modify the CSS variables in `:root`:

```css
:root {
  --ftn-canvas: #yourcolor;
  --ftn-black: #yourcolor;
  /* etc. */
}
```

All components will automatically update.

### Changing Spacing

Key spacing values to adjust:
- Container padding: `.ftn-container { padding: 0 20px; }`
- Grid gap: `.ftn-articles-grid { gap: 30px; }`
- Component padding: `.ftn-article-content { padding: 30px; }`

### Changing Typography

The site uses Courier New throughout. To change:
```css
body {
  font-family: 'Your Font', monospace;
}
```

Font sizes are relative (rem-based) and scale automatically on mobile.

### Changing Border Thickness

The brutalist style uses thick borders. Key values:
- Primary borders: `6px solid var(--ftn-black)`
- Secondary borders: `3px solid var(--ftn-black)`

To adjust globally, search and replace these values.

## 🆕 Adding New Components

When creating new components:

1. **Use existing CSS variables** for colors and spacing
2. **Follow naming convention**: `ftn-component-name`
3. **Apply brutalist principles**: bold, high-contrast, thick borders
4. **Ensure mobile responsiveness**: test at 768px and 480px breakpoints
5. **Use uppercase for headings and buttons**

### Example Component
```css
.ftn-my-component {
  background-color: var(--ftn-white);
  border: 6px solid var(--ftn-black);
  padding: 30px;
}

.ftn-my-component-title {
  font-size: 2rem;
  font-weight: 900;
  text-transform: uppercase;
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .ftn-my-component {
    padding: 20px;
  }
  
  .ftn-my-component-title {
    font-size: 1.5rem;
  }
}
```

## 🎯 Best Practices

1. **Always use CSS variables** for colors instead of hardcoded hex values
2. **Test responsive design** at multiple breakpoints
3. **Maintain thick borders** (6px for primary, 3px for secondary)
4. **Use uppercase sparingly** (headings, buttons, labels only)
5. **Keep high contrast** for accessibility
6. **Lazy load images** to improve performance
7. **Avoid inline styles** (use classes instead)
8. **Follow mobile-first** approach (base styles for mobile, media queries for desktop)

## 🔧 Tools and Resources

- **Font:** Courier New (system font, no external requests)
- **Colors:** Named colors or hex values
- **Layout:** CSS Grid and Flexbox
- **Build:** Astro with SSR
- **Hosting:** Cloudflare Workers

## 📚 Component Reference

### Using MainLayout
```astro
---
import MainLayout from '@/layouts/MainLayout.astro';
import Header from '@/components/Header.astro';
import Footer from '@/components/Footer.astro';
---

<MainLayout title="Page Title" description="Page description">
  <Header role="public" />
  <main>
    <!-- Your content -->
  </main>
  <Footer />
</MainLayout>
```

### Using ArticleCard
```astro
---
import ArticleCard from '@/components/ArticleCard.astro';
---

<ArticleCard 
  article={article} 
  r2PublicUrl={r2PublicUrl} 
  featured={false} 
/>
```

### Using Header
```astro
<Header role="public" />          <!-- Public site -->
<Header role="admin" userName="John" />   <!-- Admin dashboard -->
<Header role="editor" userName="Jane" />  <!-- Editor dashboard -->
```

## 🐛 Troubleshooting

### Images not loading
- Verify R2_PUBLIC_URL is set in environment
- Check article.featured_image field in database
- Ensure R2 bucket has public access configured

### Styles not applying
- Verify main.css is imported in MainLayout or NewsLayout
- Clear browser cache
- Check for CSS syntax errors in browser console

### Layout breaking on mobile
- Test at 768px and 480px breakpoints
- Ensure grid uses `auto-fill` with `minmax()`
- Check for fixed widths that don't scale

## 📄 File Structure

```
src/
├── styles/
│   └── main.css              # Main stylesheet
├── layouts/
│   ├── MainLayout.astro      # Base HTML layout
│   └── NewsLayout.astro      # News-specific layout
├── components/
│   ├── Header.astro          # Site header
│   ├── Footer.astro          # Site footer
│   └── ArticleCard.astro     # Article preview card
└── pages/
    ├── index.astro           # Homepage
    └── [slug].astro          # Article detail page
```

---

**Last Updated:** 2025-11-19
**Version:** 1.0.0
**Maintainer:** Fishtank News Team
