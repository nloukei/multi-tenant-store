# Tenantly — Multi-Tenant E-commerce SaaS Platform

> [!IMPORTANT]
> **PROPRIETARY & LICENSE WARNING**  
> Copyright © 2026 Keith Einlou Pogoy. All Rights Reserved.  
> This application is proprietary software. It is published publicly on GitHub solely as a **personal portfolio showcase** to demonstrate advanced full-stack software engineering, system design, and database architecture capabilities.  
> **Copying, distributing, modifying, hosting, or using this codebase (or any portion of its architecture, custom middlewares, and UI designs) for any private or commercial purpose is strictly prohibited.** See the [LICENSE](./LICENSE) file for full details.

---

**Tenantly** is a production-grade, multi-tenant e-commerce Software-as-a-Service (SaaS) platform built for business owners to dynamically provision and launch custom branded storefronts in seconds. 

The system leverages schema-isolated multi-tenancy, custom subdomains, Stripe subscription integrations, and a sleek, high-contrast, modern UI to deliver a seamless shopping and administration experience.

---

## 🌐 Live Production Demos

* **Central SaaS Portal**: [tenantly.software](https://tenantly.software) — *Plan selection, store provisioning, and developer registration.*
* **Example Tenant Storefront**: [blitz.tenantly.software](https://blitz.tenantly.software) — *Custom themed storefront with a cart system, reviews, product browsing, and complete checkout simulation.*

---

## 🚀 Key Features

### 🏢 Multi-Tenant Infrastructure
* **Schema-Based Database Isolation**: Automated tenant database migrations and connection switching dynamically handled on PostgreSQL using `stancl/tenancy`.
* **Dynamic Subdomain Provisioning**: Instant domain registration (`tenant.tenantly.software`) mapping the client host to their isolated tenant context.
* **Custom Domain Mapping**: Fully configured DNS capability enabling store owners to route their custom domains.

### 💰 Subscription & Billing Engine
* **Flexible Tiers**: Tiered platform packages including **Free**, **Basic**, and **Pro** subscriptions.
* **Stripe Checkout Integration**: Complete subscription lifecycle processing including instant tier switching, trials, and deferred cancellation models.
* **Trial Period Onboarding**: 14-day automated trial period enabled immediately upon store registration.

### 🔒 Enterprise-Grade Security & Stability
* **Global Input Sanitization**: Recursive XSS cleaning and HTML stripping middleware that secures all endpoint parameters while safely bypassing passwords and Stripe tokens.
* **Payload Protection**: Global verification preventing memory-exhaustion DDoS attacks by strictly rejecting oversized payloads (>10MB), deep-nesting (>10 levels), and excessive individual field lengths (>128KB).
* **Named Rate-Limiting**: Central and tenant middleware thottlers preventing API spam by IP and user tokens.

### 🎨 Storefront & Admin Control Center
* **Branded Customization**: Admin settings panel allowing dynamic theme primary colors, logos, banner texts, and customizable hero sliders.
* **Promo Code & Discount Engine**: Advanced percentage/fixed discount configurations with minimum purchase constraints.
* **Inventory & Order Tracker**: Complete cart system, order reviews, and live order preparation state toggles.

---

## 🛠️ Technology Stack

* **Backend**: Laravel 11 (PHP 8.2+)
* **Frontend**: React, TypeScript, Inertia.js, TailwindCSS
* **Database**: PostgreSQL (Supabase Connection Pooling)
* **Storage**: Supabase S3 Compatible Storage Bucket
* **Payments**: Stripe Checkout & Webhook API
* **DevOps**: Docker, Nginx, PHP-FPM, Render Cloud Infrastructure

---

## 💻 Technical Portfolio Showcase Highlights

If you are a recruiter or hiring manager reviewing this codebase, consider checking these custom implementations:

1. **Global Security & Sanitization**: [SanitizeAndValidateInput.php](app/Http/Middleware/SanitizeAndValidateInput.php) — A custom middleware that recursively strips tags and validates complex nested payloads at the HTTP layer.
2. **Central Tenant Controller & Billing**: [StoreController.php](app/Http/Controllers/Central/StoreController.php) — Manages the complex multi-tenant routing, postgres schema search paths, and Stripe checkout pipelines.
3. **Core Application Shell**: [app.tsx](resources/js/app.tsx) — Implements dynamic title updates and a custom animated SVG favicon loader during Inertia.js client-side page transitions.
4. **Premium Visual Styling**: [welcome.tsx](resources/js/pages/welcome.tsx) — A glassmorphic, high-contrast welcome interface with integrated responsive pricing plan cards.

---

## 👤 Developer & Contact

**Keith Einlou Pogoy**  
* **Portfolio**: [keithpogoy.tech](https://keithpogoy.tech)  
* **GitHub**: [@nloukei](https://github.com/nloukei)  

---

*Tenantly is a personal demonstration project built to showcase full-stack engineering proficiency. It is not an active commercial service.*
