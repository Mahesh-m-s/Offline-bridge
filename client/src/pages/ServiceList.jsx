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

  // Load from Dexie cache
  const cachedForms = useLiveQuery(async () => {
    const list = await db.cachedForms.toArray();
    return list.length > 0 ? list : defaultServiceForms;
  }, [], defaultServiceForms);

  // Sync latest schema from backend if online
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
        .catch(() => {
          // offline fallback is already active
        });
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
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Digital Government Services
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Select a service to start your application. All forms can be saved and submitted without internet.
        </p>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by scheme name or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 transition-all text-sm"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block mr-1 flex-shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-950'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
          <FileText className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">No matching services found</h3>
          <p className="text-xs text-slate-500">Try adjusting your search terms or selecting 'All' categories.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {filteredServices.map((service) => {
            const Icon = iconMap[service.icon] || FileText;
            return (
              <div
                key={service.service_type}
                className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/60 transition-all duration-300 flex flex-col justify-between group shadow-lg"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-teal-950/80 border border-teal-700/50 flex items-center justify-center text-teal-400 group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-800 text-teal-300 border border-slate-700">
                      {service.category || 'Government'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-teal-300 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  <div className="text-xs text-slate-500 flex items-center gap-2 pt-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{service.fields?.length || 5} required form fields</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-emerald-400 font-medium">Offline available</span>
                  <Link
                    to={`/services/${service.service_type}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-teal-600 hover:bg-teal-500 active:scale-95 transition-all shadow-md shadow-teal-950 cursor-pointer"
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
