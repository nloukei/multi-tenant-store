/**
 * Copyright (c) 2026 Keith Einlou Pogoy. All Rights Reserved.
 * Proprietary and confidential. Unauthorized copying of this file is strictly prohibited.
 */

import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { themes } from '../themes';
import AppLogoIcon from '../components/app-logo-icon';

const features = [
    {
        icon: (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
            </svg>
        ),
        title: 'Multi-Tenant Stores',
        desc: 'Each tenant gets their own isolated storefront with custom domain, branding, and product catalog.',
    },
    {
        icon: (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
            </svg>
        ),
        title: 'Stripe Payments',
        desc: 'Integrated Stripe checkout for secure payments, with automatic order tracking and digital receipts.',
    },
    {
        icon: (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
            </svg>
        ),
        title: 'Promo Codes & Deals',
        desc: 'Create percentage or fixed-amount discount codes with expiry dates to drive sales and engagement.',
    },
    {
        icon: (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
            </svg>
        ),
        title: 'Product & Category Mgmt',
        desc: 'Organize products into categories with images, pricing, inventory tracking and rich descriptions.',
    },
    {
        icon: (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
        ),
        title: 'Cart & Checkout',
        desc: 'Full shopping cart experience with quantity controls, real-time totals, and seamless Stripe checkout.',
    },
    {
        icon: (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
        ),
        title: 'Role-Based Access',
        desc: 'Super admins oversee all stores while store admins manage their own tenant with full autonomy.',
    },
];

const steps = [
    { num: '01', title: 'Register', desc: 'Create your account in seconds with just your name and email.' },
    { num: '02', title: 'Create Store', desc: 'Set up your tenant store with a custom subdomain and branding.' },
    { num: '03', title: 'Add Products', desc: 'Upload products, set categories, pricing and manage inventory.' },
    { num: '04', title: 'Start Selling', desc: 'Share your store link and start accepting Stripe payments instantly.' },
];

export default function Welcome({ plans = [] }: { plans?: any[] }) {
    const { auth } = usePage<SharedData>().props;
    const [scrolled, setScrolled] = useState(false);

    const resolvedPlans = plans.length > 0 ? plans.map(p => ({
        name: p.name,
        price: parseFloat(p.price).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
        desc: p.description,
        features: Array.isArray(p.features) ? p.features : [],
        cta: parseFloat(p.price) > 0 ? 'Choose Plan' : 'Get Started Free',
        popular: p.slug === 'pro',
    })) : [
        {
            name: 'Free',
            price: '0',
            desc: 'Perfect for testing out your storefront ideas.',
            features: ['1 Tenant Storefront', 'Standard Subdomain', 'Community Support', 'Basic Analytics'],
            cta: 'Get Started Free',
            popular: false,
        },
        {
            name: 'Basic',
            price: '15,000',
            desc: 'For growing businesses ready to start selling.',
            features: ['Custom Domain Ready', 'Stripe Checkout Integrated', 'Promo Code Engine', 'Priority Support', 'Unlimited Products'],
            cta: 'Choose Basic',
            popular: false,
        },
        {
            name: 'Pro',
            price: '50,000',
            desc: 'Maximum performance and complete platform access.',
            features: ['Unlimited Multi-Tenant Stores', 'Premium Theme Access', 'Dedicated Account Mgr', 'Advanced Multi-Tenant Analytics', '0% Extra Platform Fees'],
            cta: 'Choose Pro',
            popular: true,
        },
    ];

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <>
            <Head title="Launch Your Online Store">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=inter:300,400,500,600,700,800,900" rel="stylesheet" />
                <style>{`
                    body { font-family: 'Inter', sans-serif; }
                    @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
                    @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
                    @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
                    @keyframes pulse-glow { 0%,100% { opacity: 0.4; } 50% { opacity: 0.8; } }
                    .fade-up { animation: fadeUp 0.7s ease-out both; }
                    .fade-up-1 { animation-delay: 0.1s; }
                    .fade-up-2 { animation-delay: 0.2s; }
                    .fade-up-3 { animation-delay: 0.3s; }
                    .fade-up-4 { animation-delay: 0.4s; }
                    .float-anim { animation: float 6s ease-in-out infinite; }
                    .shimmer-text { background: ${themes.gradients.shimmer}; background-size: 200% auto; animation: shimmer 3s linear infinite; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
                    .glass { background: ${themes.colors.glass.background}; backdrop-filter: blur(16px); border: 1px solid ${themes.colors.glass.border}; }
                    .card-hover { transition: all 0.3s ease; }
                    .card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.15); }
                `}</style>
            </Head>

            <div className="min-h-screen text-white overflow-x-hidden" style={{ backgroundColor: themes.colors.background }}>

                {/* Navbar */}
                <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'backdrop-blur-xl border-b border-white/5 py-3' : 'py-5'}`} style={{ backgroundColor: scrolled ? `${themes.colors.background}E6` : 'transparent' }}>
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
                        <div className="flex items-center gap-2.5">
                            <AppLogoIcon className="h-8 w-8 fill-current" />
                            <span className="text-lg font-bold tracking-tight">Tenantly</span>
                        </div>
                        <div className="flex items-center gap-3">
                            {auth.user ? (
                                <Link href={route('dashboard')} className="rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2 text-sm font-medium transition hover:opacity-90">
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link href={route('login')} className="rounded-full px-5 py-2 text-sm font-medium text-white/70 transition hover:text-white">
                                        Log in
                                    </Link>
                                    <Link href={route('register')} className="rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2 text-sm font-medium transition hover:opacity-90 hover:shadow-lg hover:shadow-violet-500/25">
                                        Get Started Free
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </nav>

                {/* Hero */}
                <section className="relative flex min-h-screen items-center justify-center px-6 pt-20">
                    {/* BG Glow */}
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/4 rounded-full bg-violet-600/20 blur-[120px]" style={{ animation: 'pulse-glow 4s ease-in-out infinite' }} />
                        <div className="absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-indigo-500/10 blur-[100px]" />
                        <div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-fuchsia-500/10 blur-[100px]" />
                    </div>

                    <div className="relative z-10 mx-auto max-w-4xl text-center">
                        <div className="fade-up fade-up-1 mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/60 backdrop-blur-sm">
                            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            Multi-tenant ecommerce platform
                        </div>
                        <h1 className="fade-up fade-up-2 text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
                            Launch your
                            <span className="shimmer-text"> online store </span>
                            in minutes
                        </h1>
                        <p className="fade-up fade-up-3 mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/50">
                            Create, manage, and scale multiple tenant storefronts from a single dashboard.
                            Built-in Stripe payments, product management, promo codes, and more.
                        </p>
                        <div className="fade-up fade-up-4 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                            {auth.user ? (
                                <Link href={route('dashboard')} className="group relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-3.5 text-sm font-semibold transition-all hover:shadow-xl hover:shadow-violet-500/25">
                                    Go to Dashboard
                                    <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
                                </Link>
                            ) : (
                                <>
                                    <Link href={route('register')} className="group relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-3.5 text-sm font-semibold transition-all hover:shadow-xl hover:shadow-violet-500/25">
                                        Start Building Free
                                        <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
                                    </Link>
                                    <Link href={route('login')} className="inline-flex items-center gap-2 rounded-full border border-white/10 px-8 py-3.5 text-sm font-medium text-white/70 transition hover:border-white/20 hover:text-white">
                                        Sign in to your account
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="fade-up mt-20 grid grid-cols-3 gap-8 border-t border-white/5 pt-10" style={{ animationDelay: '0.6s' }}>
                            {[
                                ['Unlimited', 'Tenant Stores'],
                                ['Stripe', 'Payments Built-in'],
                                ['Real-time', 'Order Tracking'],
                            ].map(([val, label]) => (
                                <div key={label}>
                                    <div className="text-2xl font-bold text-white sm:text-3xl">{val}</div>
                                    <div className="mt-1 text-sm text-white/40">{label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section className="relative py-28 px-6" id="features">
                    <div className="mx-auto max-w-6xl">
                        <div className="text-center">
                            <p className="text-sm font-semibold uppercase tracking-widest text-violet-400">Features</p>
                            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Everything you need to sell online</h2>
                            <p className="mx-auto mt-4 max-w-xl text-white/50">
                                A complete multi-tenant commerce platform with all the tools to launch, manage, and grow your stores.
                            </p>
                        </div>
                        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {features.map((f, i) => (
                                <div key={i} className="card-hover group rounded-2xl border border-white/5 bg-white/[0.02] p-7 transition-colors hover:border-violet-500/30 hover:bg-white/[0.04]">
                                    <div className="mb-4 inline-flex rounded-xl bg-violet-500/10 p-3 text-violet-400 transition-colors group-hover:bg-violet-500/20">
                                        {f.icon}
                                    </div>
                                    <h3 className="text-lg font-semibold">{f.title}</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-white/45">{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="relative py-28 px-6">
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div className="absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/10 blur-[120px]" />
                    </div>
                    <div className="relative z-10 mx-auto max-w-5xl">
                        <div className="text-center">
                            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-400">How It Works</p>
                            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Up and running in 4 simple steps</h2>
                        </div>
                        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                            {steps.map((s, i) => (
                                <div key={i} className="card-hover relative rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center">
                                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-600/20 to-indigo-600/20 text-lg font-bold text-violet-400">
                                        {s.num}
                                    </div>
                                    <h3 className="text-base font-semibold">{s.title}</h3>
                                    <p className="mt-2 text-sm text-white/45">{s.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Pricing Plans */}
                <section className="relative py-28 px-6" id="pricing">
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div className="absolute right-1/4 top-1/2 h-[500px] w-[500px] rounded-full bg-fuchsia-600/10 blur-[130px]" />
                        <div className="absolute left-1/4 bottom-0 h-[400px] w-[400px] rounded-full bg-violet-600/10 blur-[120px]" />
                    </div>
                    <div className="relative z-10 mx-auto max-w-6xl">
                        <div className="text-center">
                            <p className="text-sm font-semibold uppercase tracking-widest text-violet-400">Pricing</p>
                            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Choose the right plan for your business</h2>
                            <p className="mx-auto mt-4 max-w-xl text-white/50">
                                Simple, transparent pricing designed to grow with your business. Select a plan to start your 14-day trial.
                            </p>
                        </div>

                        <div className="mt-16 grid gap-8 md:grid-cols-3">
                            {resolvedPlans.map((plan, i) => (
                                <div
                                    key={i}
                                    className={`card-hover relative flex flex-col justify-between rounded-3xl border p-8 backdrop-blur-sm transition-all duration-300 ${plan.popular
                                        ? 'border-violet-500/50 bg-white/[0.04] shadow-2xl shadow-violet-500/10 md:scale-[1.04]'
                                        : 'border-white/5 bg-white/[0.02] hover:border-violet-500/30'
                                        }`}
                                >
                                    {plan.popular && (
                                        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
                                            Most Popular
                                        </span>
                                    )}

                                    <div>
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                                        </div>
                                        <p className="mt-3 text-sm text-white/50 leading-relaxed min-h-[40px]">{plan.desc}</p>
                                        <div className="mt-6 flex items-baseline">
                                            <span className="text-4xl font-extrabold tracking-tight text-white">₱{plan.price}</span>
                                            <span className="ml-1 text-sm font-medium text-white/40">/month</span>
                                        </div>

                                        <ul className="mt-8 space-y-4 border-t border-white/5 pt-6">
                                            {plan.features.map((feature, idx) => (
                                                <li key={idx} className="flex items-start gap-3 text-sm text-white/70">
                                                    <svg className="h-5 w-5 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                                    </svg>
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-white/5">
                                        <Link
                                            href={auth.user ? route('dashboard') : route('register')}
                                            className={`flex w-full items-center justify-center rounded-full py-3 text-sm font-semibold transition-all duration-200 ${plan.popular
                                                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:opacity-90 hover:shadow-lg hover:shadow-violet-500/20'
                                                : 'border border-white/10 text-white/90 hover:border-white/20 hover:bg-white/5'
                                                }`}
                                        >
                                            {plan.cta}
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="relative py-28 px-6">
                    <div className="relative z-10 mx-auto max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-600/10 via-indigo-600/10 to-fuchsia-600/10 p-12 text-center backdrop-blur-sm sm:p-16">
                        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-violet-500/20 blur-[80px]" />
                        <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-indigo-500/20 blur-[80px]" />
                        <h2 className="relative text-3xl font-bold sm:text-4xl">Ready to launch your store?</h2>
                        <p className="relative mx-auto mt-4 max-w-lg text-white/50">
                            Join the platform and start selling today. No credit card required to get started.
                        </p>
                        <div className="relative mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <Link href={auth.user ? route('dashboard') : route('register')} className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-3.5 text-sm font-semibold transition hover:shadow-xl hover:shadow-violet-500/25">
                                {auth.user ? 'Go to Dashboard' : 'Get Started Free'}
                                <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-white/5 py-12 px-6">
                    <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                        <div className="flex flex-col items-center md:items-start gap-2">
                            <div className="flex items-center gap-2">
                                <div className="rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 p-1 text-white">
                                    <AppLogoIcon />
                                </div>
                                <span className="text-sm font-semibold">Tenantly</span>
                            </div>
                            <p className="text-xs text-white/40 mt-1 max-w-md leading-relaxed">
                                Disclaimer: This is a personal project only and not an actual running business. Built for demonstration and showcase purposes.
                            </p>
                        </div>
                        <div className="flex flex-col items-center md:items-end gap-2 text-sm text-white/50">
                            <p>
                                Made by{" "}
                                <a
                                    href="https://keithpogoy.tech"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-semibold text-violet-400 hover:text-violet-300 transition-colors"
                                >
                                    Keith Einlou Pogoy
                                </a>
                            </p>
                            <div className="flex items-center gap-4 text-xs text-white/30">
                                <span>&copy; {new Date().getFullYear()} Tenantly</span>
                                <span>&bull;</span>
                                <a
                                    href="https://github.com/nloukei"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-white transition-colors"
                                >
                                    GitHub (@nloukei)
                                </a>
                                <span>&bull;</span>
                                <a
                                    href="https://keithpogoy.tech"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-white transition-colors"
                                >
                                    Portfolio
                                </a>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
