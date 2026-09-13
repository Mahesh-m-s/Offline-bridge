import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export default function FormRenderer({ schema, initialData = {}, onSubmit, isSubmitting = false }) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData(initialData);
    }
  }, [initialData]);

  if (!schema || !schema.fields) {
    return (
      <div className="p-6 text-center text-slate-400 bg-slate-900/60 rounded-xl border border-slate-800">
        <p>No valid form schema found.</p>
      </div>
    );
  }

  const validateField = (field, value) => {
    if (field.required && (value === undefined || value === null || String(value).trim() === '')) {
      return `${field.label} is required.`;
    }
    if (field.pattern && value) {
      const regex = new RegExp(field.pattern);
      if (!regex.test(value)) {
        return field.helperText || `Invalid format for ${field.label}.`;
      }
    }
    if (field.type === 'number' && value !== undefined && value !== '') {
      const num = Number(value);
      if (isNaN(num)) return `${field.label} must be a valid number.`;
      if (field.min !== undefined && num < field.min) return `Minimum value is ${field.min}.`;
      if (field.max !== undefined && num > field.max) return `Maximum value is ${field.max}.`;
    }
    return null;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field.id]: value }));
    if (touched[field.id]) {
      const err = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field.id]: err }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field.id]: true }));
    const err = validateField(field, formData[field.id]);
    setErrors((prev) => ({ ...prev, [field.id]: err }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    let hasError = false;

    schema.fields.forEach((field) => {
      const err = validateField(field, formData[field.id]);
      if (err) {
        newErrors[field.id] = err;
        hasError = true;
      }
    });

    setErrors(newErrors);
    setTouched(
      schema.fields.reduce((acc, f) => ({ ...acc, [f.id]: true }), {})
    );

    if (!hasError) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {schema.fields.map((field) => {
          const isFullWidth = field.type === 'textarea' || field.fullWidth;
          const errorMsg = touched[field.id] && errors[field.id];

          return (
            <div
              key={field.id}
              className={`space-y-1.5 ${isFullWidth ? 'md:col-span-2' : ''}`}
            >
              <label
                htmlFor={`field-${field.id}`}
                className="block text-sm font-semibold text-slate-200"
              >
                {field.label}
                {field.required && <span className="text-rose-400 ml-1">*</span>}
              </label>

              {/* Text / Number / Tel / Date inputs */}
              {field.type !== 'select' && field.type !== 'textarea' && (
                <input
                  id={`field-${field.id}`}
                  name={field.id}
                  type={field.type}
                  value={formData[field.id] ?? ''}
                  placeholder={field.placeholder || ''}
                  onChange={(e) => handleChange(field, e.target.value)}
                  onBlur={() => handleBlur(field)}
                  className={`w-full min-h-[48px] px-4 py-3 rounded-xl bg-slate-900/90 border text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                    errorMsg
                      ? 'border-rose-500/80 focus:ring-rose-500/30'
                      : 'border-slate-700/80 focus:border-teal-500 focus:ring-teal-500/20'
                  }`}
                />
              )}

              {/* Select Input */}
              {field.type === 'select' && (
                <div className="relative">
                  <select
                    id={`field-${field.id}`}
                    name={field.id}
                    value={formData[field.id] ?? ''}
                    onChange={(e) => handleChange(field, e.target.value)}
                    onBlur={() => handleBlur(field)}
                    className={`w-full min-h-[48px] px-4 py-3 rounded-xl bg-slate-900/90 border text-slate-100 focus:outline-none focus:ring-2 transition-all appearance-none ${
                      errorMsg
                        ? 'border-rose-500/80 focus:ring-rose-500/30'
                        : 'border-slate-700/80 focus:border-teal-500 focus:ring-teal-500/20'
                    }`}
                  >
                    <option value="" disabled className="bg-slate-900 text-slate-500">
                      Select an option
                    </option>
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-100">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                    ▼
                  </div>
                </div>
              )}

              {/* Textarea Input */}
              {field.type === 'textarea' && (
                <textarea
                  id={`field-${field.id}`}
                  name={field.id}
                  rows={4}
                  value={formData[field.id] ?? ''}
                  placeholder={field.placeholder || ''}
                  onChange={(e) => handleChange(field, e.target.value)}
                  onBlur={() => handleBlur(field)}
                  className={`w-full min-h-[100px] px-4 py-3 rounded-xl bg-slate-900/90 border text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                    errorMsg
                      ? 'border-rose-500/80 focus:ring-rose-500/30'
                      : 'border-slate-700/80 focus:border-teal-500 focus:ring-teal-500/20'
                  }`}
                />
              )}

              {/* Helper text or Error */}
              {errorMsg ? (
                <p className="flex items-center gap-1.5 text-xs text-rose-400 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </p>
              ) : field.helperText ? (
                <p className="text-xs text-slate-400 mt-1">{field.helperText}</p>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Offline safe: All submissions save locally to device storage instantly.</span>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto min-h-[50px] px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 active:scale-98 shadow-lg shadow-teal-900/40 focus:outline-none focus:ring-2 focus:ring-teal-400 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
        >
          <span>{isSubmitting ? 'Saving Locally...' : 'Submit Application'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
