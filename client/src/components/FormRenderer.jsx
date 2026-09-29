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
      <div className="p-6 text-center text-[#475569] bg-[#F8F9FA] rounded-lg border border-[#D1D5DB]">
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
                className="block text-sm font-bold text-[#172033]"
              >
                {field.label}
                {field.required && <span className="text-[#DC2626] ml-1 font-bold">*</span>}
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
                  className={`w-full min-h-[48px] px-4 py-3 rounded-lg bg-white border text-[#172033] placeholder-[#94A3B8] font-medium text-sm focus:outline-none transition-colors ${
                    errorMsg
                      ? 'border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20'
                      : 'border-[#94A3B8] focus:border-[#087443] focus:ring-2 focus:ring-[#087443]/20'
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
                    className={`w-full min-h-[48px] px-4 py-3 rounded-lg bg-white border text-[#172033] font-medium text-sm focus:outline-none transition-colors appearance-none ${
                      errorMsg
                        ? 'border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20'
                        : 'border-[#94A3B8] focus:border-[#087443] focus:ring-2 focus:ring-[#087443]/20'
                    }`}
                  >
                    <option value="" disabled className="text-[#94A3B8]">
                      -- Select an option --
                    </option>
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value} className="text-[#172033]">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#475569]">
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
                  className={`w-full min-h-[100px] p-4 rounded-lg bg-white border text-[#172033] placeholder-[#94A3B8] font-medium text-sm focus:outline-none transition-colors ${
                    errorMsg
                      ? 'border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20'
                      : 'border-[#94A3B8] focus:border-[#087443] focus:ring-2 focus:ring-[#087443]/20'
                  }`}
                />
              )}

              {/* Helper text or Error */}
              {errorMsg ? (
                <p className="flex items-center gap-1.5 text-xs font-bold text-[#991B1B] mt-1">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-[#DC2626]" />
                  <span>{errorMsg}</span>
                </p>
              ) : field.helperText ? (
                <p className="text-xs text-[#64748B] mt-1">{field.helperText}</p>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t border-[#D1D5DB] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#087443]">
          <CheckCircle2 className="w-4 h-4 text-[#087443] flex-shrink-0" />
          <span>Offline Ready: Data saves immediately to this device.</span>
        </div>

        {/* High-Contrast Large Touch Target Primary Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto min-h-[48px] px-8 py-3 rounded-lg font-bold text-white bg-[#087443] hover:bg-[#065f37] active:bg-[#044427] border border-[#065f37] flex items-center justify-center gap-2 transition-colors cursor-pointer text-sm shadow-sm"
        >
          <span>{isSubmitting ? 'Saving to Device...' : 'Submit Application'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
