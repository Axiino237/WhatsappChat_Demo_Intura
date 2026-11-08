# Intura Design Studio — WhatsApp AI Concierge Demo
> **Interactive Concept Demonstration created by Axiino Technologies for Intura Design Studio**
> *"Interiors With Aura"*

---

## 🌟 Overview
This is a standalone, responsive, interactive WhatsApp-inspired client onboarding simulation built for **Intura Design Studio**. It allows homeowners to explore design services, choose their property type, specify location and square footage, simulate floor plan uploading, select interior design scopes, and receive an instant structured project enquiry summary.

---

## 🚀 Key Features

1. **WhatsApp-Inspired Chat Interface**:
   - WhatsApp brand aesthetics with official color palette (`#008069`, `#efeae2` doodle background).
   - Dynamic typing indicators, timestamps, message tails, and double blue ticks (`✓✓`).
   - Device switcher toggle: **📱 Smartphone Device View** (with iPhone dynamic island bezel) and **💻 WhatsApp Web View** (full-width desktop with left chat list).
   - Audio synthesized feedback for incoming/outgoing interactions (Web Audio API, no external MP3 dependencies).

2. **Intura Design Studio Branding**:
   - Official logo and brand palette (Purple `#502b85` & Orange `#f05423`).
   - Tagline: *"Interiors With Aura"*.
   - Verified WhatsApp Business badge.

3. **Homeowner Discovery Journey**:
   - **Step 1: Welcome & Property Type**: Apartment / Flat, Luxury Villa, Independent House, Penthouse / Duplex.
   - **Step 2: Property Location**: Quick Bangalore/regional hubs (Whitefield, Indiranagar, HSR, Sarjapur, etc.) + freeform text support.
   - **Step 3: Approximate Square Footage**: 2 BHK (1,100–1,450 sq ft), 3 BHK (1,500–2,100 sq ft), 4 BHK / Villa (2,200–3,400 sq ft), Luxury Estate (3,500+ sq ft), or custom input.
   - **Step 4: Simulated Floor Plan Upload**:
     - Live file picker for user's own floor plan (image or PDF).
     - One-click *Sample 3BHK Blueprint (1,850 sq ft)* with instant architectural CAD layout preview.
     - Simulated progress bar and interactive WhatsApp document attachment bubble with click-to-enlarge modal.
     - Option to skip.
   - **Step 5: Interior Requirements / Scope**: Interactive multi-select chips (Modular Kitchen, Living Room TV Wall, Wardrobes, False Ceiling, Pooja Mandir, Balcony, etc.) or Full Turnkey package.
   - **Step 6: Final Structured Enquiry Dossier**:
     - Reference ID (e.g. `IDS-2026-X839`).
     - Priority Queue & Verification badge.
     - Assigned Senior Architect (`Ar. Priya Sharma`).
     - Turnkey timeline estimate & Next steps.
     - **Actions**: Download / Print Summary Brief, Request Callback simulation, or Restart Demo.

4. **100% Frontend Only**:
   - No backend, no WhatsApp API tokens, and no external AI API keys needed.
   - Zero runtime dependencies.
   - Works immediately out of the box.

---

## 🛠️ How to Run Locally

### Option 1: Direct in Browser
Simply double-click `index.html` or drag it into any web browser (Chrome, Edge, Safari, Firefox).

### Option 2: Local HTTP Server
```bash
npx serve .
```

---

## ☁️ Deployment to Vercel

### One-Click Deploy via Vercel CLI:
```bash
npx vercel
```
Or import this directory into your GitHub account and link it in the [Vercel Dashboard](https://vercel.com). Vercel will automatically detect `index.html` and deploy it instantly as a high-performance static website.

