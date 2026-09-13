import React from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import {
  WifiOff,
  CloudUpload,
  Sparkles,
  ClipboardList,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Tractor,
  GraduationCap,
  FileCheck,
  Zap
} from 'lucide-react';

export default function Home() {
  const pendingSubmissionsCount = useLiveQuery(
    () => db.submissions.where('syncStatus').equals('pending').count(),
    [],
    0
  );
  const pendingGrievancesCount = useLiveQuery(
    () => db.grievances.where('syncStatus').equals('pending').count(),
    [],
    0
  );

  const totalPending = (pendingSubmissionsCount || 0) + (pendingGrievancesCount || 0);

  const featuredServices = [
    {
      id: 'kisan_credit',
      title: 'Kisan Credit Card (KCC)',
      category: 'Agriculture',
      icon: CreditCard,
      description: 'Subsidized crop credit & agriculture term loans with simple land record entry.',
      gradient: 'from-emerald-500/20 to-teal-500/20',
      border: 'border-emerald-500/30'
    },
    {
      id: 'pm_kisan',
      title: 'PM-Kisan Samman Nidhi',
      category: 'Agriculture',
      icon: Tractor,
      description: 'Direct income support of ₹6,000 / year in three installments for landholding farmers.',
      gradient: 'from-amber-500/20 to-orange-500/20',
      border: 'border-amber-500/30'
    },
    {
      id: 'post_matric_scholarship',
      title: 'Post-Matric Rural Scholarship',
      category: 'Education',
      icon: GraduationCap,
      description: 'Full tuition fee reimbursement and living stipends for rural college students.',
      gradient: 'from-blue-500/20 to-indigo-500/20',
      border: 'border-blue-500/30'
    },
    {
      id: 'caste_income_certificate',
      title: 'Caste & Income Certificate',
      category: 'Revenue',
      icon: FileCheck,
      description: 'Official revenue certificate registration with Gram Panchayat delivery options.',
      gradient: 'from-purple-500/20 to-pink-500/20',
      border: 'border-purple-500/30'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-6 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-teal-950/90 text-teal-300 border border-teal-700/50 shadow-sm">
            <Zap className="w-3.5 h-3.5 text-teal-400" />
            <span>100% Offline-First Architecture for Rural India</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Government Services That Work{' '}
            <span className="bg-gradient-to-r from-teal-400 via-emerald-300 to-amber-300 bg-clip-text text-transparent">
              Even When Internet Fails.
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Fill applications and report grievances without network delays. Your data is encrypted and saved locally in IndexedDB, and automatically synchronizes to the server the second signal returns.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              to="/services"
              className="px-6 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 shadow-lg shadow-teal-900/40 flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
            >
              <span>Explore All Services</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/eligibility"
              className="px-6 py-3.5 rounded-xl font-semibold text-teal-200 bg-slate-900/90 hover:bg-slate-800 border border-teal-700/40 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>Scheme Eligibility Check</span>
            </Link>
          </div>

          {/* Offline Pending Quick Notice */}
          {totalPending > 0 && (
            <div className="mt-4 p-4 rounded-2xl bg-amber-950/40 border border-amber-600/40 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CloudUpload className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <p className="text-xs sm:text-sm text-amber-200">
                  <span className="font-bold">{totalPending} item(s)</span> saved on your device waiting for connection.
                </p>
              </div>
              <Link
                to="/tracker"
                className="text-xs font-semibold text-amber-300 underline hover:text-amber-200 whitespace-nowrap"
              >
                View in Tracker
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Featured Services Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Popular Government Services</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Available offline with instant local storage</p>
          </div>
          <Link
            to="/services"
            className="text-xs sm:text-sm font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredServices.map((service) => {
            const Icon = service.icon;
            return (
              <Link
                key={service.id}
                to={`/services/${service.id}`}
                className={`group relative p-6 rounded-2xl bg-slate-900/80 border ${service.border} hover:border-teal-500/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-teal-950/50 flex flex-col justify-between`}
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                      {service.category}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1 group-hover:text-teal-300 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-teal-400">
                  <span>Open Form</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4 Core Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-teal-950/80 border border-teal-700/50 flex items-center justify-center text-teal-400">
            <WifiOff className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Never Lose Work</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            IndexedDB caches drafts and completed submissions as you type. If your signal drops mid-form, nothing is lost.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-700/50 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Rule-Based Eligibility</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Answer 4 simple questions on land, income, and category to see which welfare schemes you qualify for — completely offline.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-amber-950/80 border border-amber-700/50 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Citizen Grievance Redressal</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Report electricity, water, ration, or road issues directly from your village. Auto-syncs to authorities when in network range.
          </p>
        </div>
      </section>
    </div>
  );
}
