import React from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import {
  WifiOff,
  CloudUpload,
  Sparkles,
  ArrowRight,
  CreditCard,
  Tractor,
  GraduationCap,
  FileCheck,
  ShieldCheck,
  AlertTriangle
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
      description: 'Subsidized crop credit & agriculture term loans for small, marginal, and tenant farmers.'
    },
    {
      id: 'pm_kisan',
      title: 'PM-Kisan Samman Nidhi',
      category: 'Agriculture',
      icon: Tractor,
      description: 'Direct income support of ₹6,000 / year in three installments for landholding farmer families.'
    },
    {
      id: 'post_matric_scholarship',
      title: 'Post-Matric Rural Scholarship',
      category: 'Education',
      icon: GraduationCap,
      description: 'Full tuition reimbursement and study maintenance stipends for rural college students.'
    },
    {
      id: 'caste_income_certificate',
      title: 'Caste & Income Certificate',
      category: 'Revenue & Panchayat',
      icon: FileCheck,
      description: 'Official revenue certificate application with Gram Panchayat pickup or digital delivery.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Official Government Service Hero Banner */}
      <section className="rounded-xl bg-white border-2 border-[#CBD5E1] p-6 sm:p-10 shadow-sm space-y-6">
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-bold bg-[#EBF7F0] text-[#087443] border border-[#A3D9BE]">
            <ShieldCheck className="w-4 h-4" />
            <span>Digital Government Services for Rural Areas</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#172033] tracking-tight leading-tight">
            Apply for Government Welfare Services, Even with Zero Internet
          </h1>

          <p className="text-base sm:text-lg text-[#334155] leading-relaxed">
            Fill out forms offline without losing your progress. All data is saved directly on this device and automatically synchronizes to official portals as soon as mobile connectivity returns.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              to="/services"
              className="min-h-[48px] px-6 py-3 rounded-lg font-bold text-white bg-[#087443] hover:bg-[#065f37] border border-[#065f37] flex items-center gap-2 text-sm transition-colors cursor-pointer shadow-sm"
            >
              <span>View All Available Services</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/eligibility"
              className="min-h-[48px] px-6 py-3 rounded-lg font-bold text-[#007C83] bg-[#E6F5F6] hover:bg-[#CCEEF0] border border-[#007C83] flex items-center gap-2 text-sm transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#007C83]" />
              <span>Check Scheme Eligibility</span>
            </Link>
          </div>

          {/* Pending Sync Notice */}
          {totalPending > 0 && (
            <div className="p-4 rounded-lg bg-[#FEF3C7] border-2 border-[#D97706] flex items-center justify-between gap-4 mt-4">
              <div className="flex items-center gap-3">
                <CloudUpload className="w-5 h-5 text-[#D97706] flex-shrink-0" />
                <p className="text-xs sm:text-sm font-bold text-[#92400E]">
                  You have {totalPending} submission(s) saved locally on this device waiting to synchronize.
                </p>
              </div>
              <Link
                to="/tracker"
                className="text-xs font-bold text-[#92400E] underline whitespace-nowrap"
              >
                Open Tracker →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Featured Services Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#D1D5DB] pb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#172033]">
              Featured Citizen Services
            </h2>
            <p className="text-xs sm:text-sm text-[#475569] mt-0.5">
              Available offline for immediate application
            </p>
          </div>
          <Link
            to="/services"
            className="text-xs sm:text-sm font-bold text-[#087443] hover:underline flex items-center gap-1"
          >
            <span>All Services</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredServices.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.id}
                className="p-6 rounded-xl bg-white border-2 border-[#CBD5E1] hover:border-[#087443] transition-colors flex flex-col justify-between shadow-sm"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-lg bg-[#EBF7F0] border border-[#A3D9BE] flex items-center justify-center text-[#087443]">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#007C83]">
                      {service.category}
                    </span>
                    <h3 className="text-base font-bold text-[#172033] mt-1">
                      {service.title}
                    </h3>
                    <p className="text-xs text-[#475569] mt-2 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E5E7EB]">
                  <Link
                    to={`/services/${service.id}`}
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-lg text-xs font-bold text-white bg-[#087443] hover:bg-[#065f37] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>Fill Application</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3 Core Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl bg-white border border-[#CBD5E1] space-y-2.5 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-[#EBF7F0] text-[#087443] flex items-center justify-center font-bold">
            <WifiOff className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#172033]">Zero Data Loss</h3>
          <p className="text-xs text-[#475569] leading-relaxed">
            Data is stored securely on your smartphone or computer storage as you type. Submissions are never lost if network drops.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-white border border-[#CBD5E1] space-y-2.5 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-[#E6F5F6] text-[#007C83] flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#172033]">Scheme Eligibility Check</h3>
          <p className="text-xs text-[#475569] leading-relaxed">
            Answer 4 basic questions about land, income, and category to see which government schemes you qualify for without contacting an office.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-white border border-[#CBD5E1] space-y-2.5 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-[#FEF3C7] text-[#92400E] flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#172033]">Grievance Redressal</h3>
          <p className="text-xs text-[#475569] leading-relaxed">
            Register civic, ration, electricity, or water supply issues from your village. Auto-synced to authorities once connected.
          </p>
        </div>
      </section>
    </div>
  );
}
