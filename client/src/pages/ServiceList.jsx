import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, defaultServiceForms, refreshCatalog } from '../db/db';
import {
  FileText,
  Search,
  ArrowRight,
  Filter,
  CreditCard,
  Tractor,
  GraduationCap,
  FileCheck,
  Building
} from 'lucide-react';

const iconMap = {
  CreditCard,
  Tractor,
  GraduationCap,
  FileCheck,
  Building
};

export default function ServiceList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const cachedForms = useLiveQuery(async () => {
    const list = await db.forms.toArray();
    return list.length > 0 ? list : defaultServiceForms;
  }, [], defaultServiceForms);

  useEffect(() => {
    if (navigator.onLine) {
      refreshCatalog().catch(() => {});
    }
  }, []);

  const categories = ['All', 'Agriculture', 'Education', 'Revenue & Certificates'];

  const filteredServices = (cachedForms || defaultServiceForms).filter((service) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      (service.category && service.category.toLowerCase() === selectedCategory.toLowerCase());

    const matchesSearch =
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (service.description && service.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-[#D1D5DB] pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033]">
          Citizen Service Forms Directory
        </h1>
        <p className="text-sm text-[#475569] mt-1">
          Select any government service below to fill out your application. Works completely offline.
        </p>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by scheme name or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full min-h-[48px] pl-11 pr-10 py-3 rounded-xl bg-white border-2 border-[#CBD5E1] text-[#172033] placeholder-[#94A3B8] font-medium focus:outline-none focus:border-[#0284C7] text-sm shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold p-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <Filter className="w-4 h-4 text-[#475569] hidden sm:block mr-1 flex-shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-gradient-btn-primary text-white shadow-md scale-105'
                  : 'bg-white text-[#172033] hover:bg-[#F8FAFC] border-2 border-[#CBD5E1]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border-2 border-dashed border-[#CBD5E1] space-y-3">
          <FileText className="w-12 h-12 text-[#64748B] mx-auto opacity-50" />
          <h3 className="text-base font-bold text-[#172033]">No matching services found</h3>
          <p className="text-xs text-[#64748B]">Try searching with a different term or reset your category filter.</p>
          <button
            onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
            className="ob-btn-primary text-xs py-2 px-4 min-h-[38px]"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredServices.map((service) => {
            const Icon = iconMap[service.icon] || FileText;
            return (
              <div
                key={service.service_type}
                className="interactive-card p-6 rounded-2xl bg-white border-2 border-[#E2E8F0] hover:border-[#BAE6FD] flex flex-col justify-between shadow-sm space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 shadow-xs">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#EFF6FF] text-[#0369A1] border border-[#BAE6FD]">
                      {service.category || 'Government'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-extrabold text-[#172033]">
                      {service.title}
                    </h3>
                    <p className="text-xs text-[#475569] mt-2 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#F1F5F9] flex items-center justify-between">
                  <span className="text-xs text-[#059669] font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#10B981] inline-block animate-pulse" />
                    Offline Ready
                  </span>
                  <Link
                    to={`/services/${service.service_type}`}
                    className="ob-btn-primary text-xs font-bold py-2.5 px-5 min-h-[42px] rounded-xl"
                  >
                    <span>Apply Offline</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
