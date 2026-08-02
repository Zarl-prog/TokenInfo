---
name: Aurelian Logic
colors:
  surface: '#fcf9f5'
  surface-dim: '#dcdad6'
  surface-bright: '#fcf9f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3ef'
  surface-container: '#f0ede9'
  surface-container-high: '#eae8e4'
  surface-container-highest: '#e5e2de'
  on-surface: '#1c1c1a'
  on-surface-variant: '#57423f'
  inverse-surface: '#31302e'
  inverse-on-surface: '#f3f0ec'
  outline: '#8a716e'
  outline-variant: '#dec0bc'
  surface-tint: '#a63932'
  primary: '#480003'
  on-primary: '#ffffff'
  primary-container: '#6b0d0d'
  on-primary-container: '#f7756a'
  inverse-primary: '#ffb4ab'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e2dfde'
  on-secondary-container: '#636262'
  tertiary: '#231f18'
  on-tertiary: '#ffffff'
  tertiary-container: '#39342c'
  on-tertiary-container: '#a39c92'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad6'
  primary-fixed-dim: '#ffb4ab'
  on-primary-fixed: '#410002'
  on-primary-fixed-variant: '#85221d'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#eae1d6'
  tertiary-fixed-dim: '#cec5ba'
  on-tertiary-fixed: '#1f1b14'
  on-tertiary-fixed-variant: '#4b463e'
  background: '#fcf9f5'
  on-background: '#1c1c1a'
  surface-variant: '#e5e2de'
typography:
  display-lg:
    fontFamily: Bodoni Moda
    fontSize: 64px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Bodoni Moda
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Bodoni Moda
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Bodoni Moda
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.5'
    letterSpacing: 0.02em
  label-caps:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.1em
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-safe: 32px
  stack-sm: 16px
  stack-md: 40px
  stack-lg: 80px
---

## Brand & Style

The design system is built upon a "designary" and editorial aesthetic, merging the authoritative weight of traditional high-end publishing with the precision of modern artificial intelligence. It targets a sophisticated audience that values clarity, intentionality, and intellectual rigor. 

The style is **Minimalist-Editorial**. It leverages generous whitespace to create a sense of "calm intelligence," ensuring that AI-generated insights are never overwhelmed by the interface. Visual interest is driven by high-contrast typography and a restricted, prestigious color palette rather than decorative elements. The UI should feel like a premium digital broadsheet—structured, deliberate, and timeless.

## Colors

The palette is anchored by a warm, tactile base and high-status accents.

- **Primary (#6B0D0D):** A deep burgundy used for core brand moments, primary actions, and critical emphasis. It conveys heritage and seriousness.
- **Secondary (#1A1A1A):** A dense "Ink" used for body text, iconography, and structural borders.
- **Tertiary (#E0D7CC):** A muted "Parchment" shade used for subtle dividers and secondary surface backgrounds to maintain warmth without breaking the cream aesthetic.
- **Surface (#FCF9F5):** The "Cream" foundation. All interfaces should utilize this as the primary background color to evoke a paper-like, editorial feel.

Avoid pure blacks or pure whites. Success, error, and warning states should be desaturated to fit the editorial tone (e.g., a muted sage for success rather than a vibrant green).

## Typography

Typography is the primary vehicle for the brand's "designary" feel. 

- **Headlines (Bodoni Moda):** Use this high-contrast serif for all primary headings. It provides the editorial "voice." For large displays, use the italic variant to highlight specific words or AI-generated concepts.
- **Body (Hanken Grotesk):** A precise, contemporary sans-serif used for all long-form text and interface elements. It ensures readability and a modern SaaS feel.
- **Data & Technical (JetBrains Mono):** Use this for AI confidence scores, code snippets, or timestamp data to emphasize the technical "logic" behind the elegant surface.

Maintain tight tracking on display headings and generous line-height on body text to preserve the premium feel.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy on desktop to mimic the structured columns of a luxury magazine. 

- **Grid:** A 12-column grid with 24px gutters. Use asymmetrical layouts (e.g., a 4-column sidebar with an 8-column content area) to create visual interest.
- **Vertical Rhythm:** Use the "Stack" variables to maintain breathing room. Sections should be separated by `stack-lg` (80px) to prevent the "cramped" feel common in SaaS.
- **Margins:** On mobile, margins reduce to 20px, and the grid collapses to a single column, though serif headlines should remain prominent and centered to maintain the brand identity.

## Elevation & Depth

This design system eschews shadows in favor of **Tonal Layers** and **Low-Contrast Outlines**.

- **Surfaces:** Depth is created by layering #E0D7CC (Parchment) containers over the #FCF9F5 (Cream) base. 
- **Borders:** Use thin, 1px lines in #1A1A1A at 10-15% opacity for most containers. This "Ghost Border" technique defines space without adding visual weight.
- **Interactive Depth:** On hover, an element should not "lift" with a shadow, but rather shift its background color slightly or gain a more defined 1px solid border in the primary burgundy.

## Shapes

The shape language is **Sharp (0px)**. To align with a sophisticated, editorial aesthetic, all buttons, input fields, and card containers must have 0px corner radii. This creates a rigorous, architectural feel that distinguishes the product from the "bubbly" aesthetic of typical consumer apps. 

The only exception is for circular avatars or specialized status pips, which should remain perfect circles.

## Components

- **Buttons:** Primary buttons use a solid burgundy (#6B0D0D) background with cream text. Secondary buttons use a 1px ink border with transparent backgrounds. Labels are in Hanken Grotesk, Bold, All-Caps.
- **Inputs:** Simple bottom-border only (border-bottom: 1px solid #1A1A1A). Labels use the `data-mono` style.
- **Cards:** No shadows. Defined by a subtle 1px border or a slight shift to the Tertiary color background. 
- **Chips/Tags:** Small, sharp rectangles with a 1px border. Use `data-mono` typography for tag content.
- **Lists:** Editorial-style lists with horizontal dividers (1px solid, low-opacity ink) between items. Use Bodoni Moda for list item titles if they are significant.
- **AI Response Block:** Highlighted by a thin burgundy left-border (4px) to denote "AI Thinking" or "Generated Content," maintaining the look of a pull-quote in a magazine.