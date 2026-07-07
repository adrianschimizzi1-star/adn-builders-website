# [Business Name] Website

## Overview

A professional single-page marketing website for [Business Name],
a residential builder serving [suburb/region]. The site showcases
past project work, builds trust through licence and experience
details, and converts visitors into enquiries via a quote form
and click-to-call phone links. It is a static site with no user
accounts and no database.

## Goals

1. A visitor can submit a quote enquiry that arrives in
   [Dad's name]'s email inbox
2. A visitor on mobile can call the business in one tap
   from any section of the page
3. The project gallery loads fast and presents past work
   as the primary proof of quality

## Core User Flow

1. Visitor lands on the hero and immediately understands
   what the business does and where it operates
2. Visitor scrolls through services and the project gallery
3. Visitor checks the About section for licence, insurance,
   and experience details
4. Visitor either taps "Call [phone]" or fills in the quote
   enquiry form
5. Form submission is sent via Formspree to [email], and the
   visitor sees a clear success confirmation

## Features

### Conversion

- Sticky/prominent "Get a Free Quote" and "Call" buttons
- Quote enquiry form: name, phone, email, service type
  dropdown, message
- Click-to-call phone links (`tel:`) throughout

### Trust & Proof

- Filterable project photo gallery with lightbox
  (filters: Renovations & Extensions, New Builds,
  Bathrooms, Decks & Outdoor)
- About section with photo, years of experience,
  licence number, insured status
- Licence number repeated in the footer

### Content Sections

- Hero with tagline and dual call-to-action buttons
- Services: four cards (Renovations & Extensions,
  New Home Builds, Bathrooms, Decks Fencing & Outdoor)
- Footer with phone, email, service area, licence number

## Scope

### In Scope

- Single-page responsive site (mobile-first)
- Formspree-powered enquiry form (no backend)
- Image optimization for gallery photos
- Local SEO basics: title, meta description, heading
  structure, image alt text, Open Graph tags

### Out of Scope

- User accounts, logins, or admin panel
- CMS or database of any kind
- Blog
- Online payments or booking calendar
- Multi-page routing (single page with anchor links only)

## Success Criteria

1. Submitting the quote form delivers an email to [email]
   and shows the visitor a success state
2. Every phone number on the page is tappable on mobile
   and initiates a call
3. Lighthouse performance score of 90+ on mobile despite
   a photo-heavy gallery
4. Site displays correctly on a 375px-wide phone screen
   and a desktop screen
5. `npm run build` produces a deployable static bundle
   with no errors
