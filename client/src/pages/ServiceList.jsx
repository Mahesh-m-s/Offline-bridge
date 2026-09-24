import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, defaultServiceForms } from '../db/db';
import apiClient from '../api/apiClient';
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
    const list = await db.cachedForms.toArray();
    return list.length > 0 ? list : defaultServiceForms;
  }, [], defaultServiceForms);

  useEffect(() => {
    if (navigator.onLine) {
      apiClient.get('/forms/all')
        .then((res) => {
          if (res.data?.forms && res.data.forms.length > 0) {
            const mapped = res.data.forms.map(f => ({
              id: f.id,
              service_type: f.service_type,
              title: f.title,
              version: f.version,
              ...f.schema_json
            }));
            db.cachedForms.bulkPut(mapped);
          }
        })
        .catch(() => {});
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
            className="w-full min-h-[48px] pl-11 pr-4 py-3 rounded-lg bg-white border-2 border-[#CBD5E1] text-[#172033] placeholder-[#94A3B8] font-medium focus:outline-none focus:border-[#087443] text-sm"
          />
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <Filter className="w-4 h-4 text-[#475569] hidden sm:block mr-1 flex-shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`min-h-[44px] px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#087443] text-white'
                  : 'bg-white text-[#172033] hover:bg-[#EBF7F0] border border-[#CBD5E1]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-white border border-[#CBD5E1] space-y-2">
          <FileText className="w-10 h-10 text-[#64748B] mx-auto" />
          <h3 className="text-base font-bold text-[#172033]">No matching services found</h3>
          <p className="text-xs text-[#64748B]">Try searching with a different term or choose 'All' categories.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredServices.map((service) => {
            const Icon = iconMap[service.icon] || FileText;
            return (
              <div
                key={service.service_type}
                className="p-6 rounded-xl bg-white border-2 border-[#CBD5E1] hover:border-[#087443] transition-colors flex flex-col justify-between shadow-sm space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-lg bg-[#EBF7F0] border border-[#A3D9BE] flex items-center justify-center text-[#087443]">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-md bg-[#F1F5F9] text-[#172033] border border-[#CBD5E1]">
                      {service.category || 'Government'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-[#172033]">
                      {service.title}
                    </h3>
                    <p className="text-xs text-[#475569] mt-2 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-between">
                  <span className="text-xs text-[#087443] font-bold">
                    ✓ Offline Available
                  </span>
                  <Link
                    to={`/services/${service.service_type}`}
                    className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-xs text-white bg-[#087443] hover:bg-[#065f37] transition-colors cursor-pointer"
                  >
                    <span>Fill Application</span>
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
