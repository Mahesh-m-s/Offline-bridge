import Dexie from 'dexie';
import apiClient from '../api/apiClient';
import defaultSchemes from '../data/schemes.json';

export const db = new Dexie('OfflineBridgeDB');

// Version 2 keeps existing queues and adds durable drafts, catalog stores and a
// scheduling queue. These stores are local-first and never contain passwords.
db.version(1).stores({
  submissions: '&client_uuid, form_id, service_type, syncStatus, retryCount, created_at, synced_at',
  grievances: '&client_uuid, category, syncStatus, retryCount, created_at, synced_at',
  cachedForms: '&service_type, id, title',
  cachedSchemes: '&id, category',
  cachedServerSubmissions: '&client_uuid, id, user_id, status'
});
db.version(2).stores({
  submissions: '&client_uuid, form_id, service_type, syncStatus, retryCount, nextRetryAt, createdAt, syncedAt, serverId, user_id',
  grievances: '&client_uuid, category, syncStatus, retryCount, nextRetryAt, createdAt, syncedAt, serverId, user_id',
  cachedForms: '&service_type, id, title',
  cachedSchemes: '&id, category',
  cachedServerSubmissions: '&client_uuid, id, user_id, status',
  forms: '&service_type, id, title',
  schemes: '&id, category',
  drafts: '&key, serviceType, updatedAt',
  syncQueue: '&id, entityType, clientUuid, state, nextRetryAt',
  meta: '&key'
});

// Default seed forms to ensure 100% offline availability on initial load
export const defaultServiceForms = [
  {
    id: 1,
    service_type: 'kisan_credit',
    title: 'Kisan Credit Card (KCC) Application',
    description: 'Subsidized crop credit & agriculture term loans for small, marginal and tenant farmers.',
    icon: 'CreditCard',
    category: 'Agriculture',
    fields: [
      {
        id: 'fullName',
        label: 'Applicant Full Name',
        type: 'text',
        required: true,
        placeholder: 'e.g. Ramesh Gowda'
      },
      {
        id: 'aadhaarNumber',
        label: 'Aadhaar Number',
        type: 'text',
        required: true,
        placeholder: '12-digit Aadhaar number',
        pattern: '^[0-9]{12}$',
        helperText: 'Must be 12 numeric digits'
      },
      {
        id: 'landHoldingAcres',
        label: 'Total Cultivable Land Holding (in Acres)',
        type: 'number',
        required: true,
        min: 0.1,
        placeholder: 'e.g. 2.5'
      },
      {
        id: 'cropType',
        label: 'Primary Crop Type',
        type: 'select',
        required: true,
        options: [
          { label: 'Kharif (Paddy, Ragi, Maize, Cotton)', value: 'kharif' },
          { label: 'Rabi (Wheat, Gram, Mustard)', value: 'rabi' },
          { label: 'Horticulture & Vegetables', value: 'horticulture' },
          { label: 'Mixed / Year-round', value: 'mixed' }
        ]
      },
      {
        id: 'loanAmountRequested',
        label: 'Requested Credit Limit (INR)',
        type: 'number',
        required: true,
        min: 10000,
        placeholder: 'e.g. 100000'
      },
      {
        id: 'bankName',
        label: 'Preferred Bank / Grameen Bank',
        type: 'text',
        required: true,
        placeholder: 'e.g. Karnataka Gramin Bank'
      },
      {
        id: 'accountNumber',
        label: 'Bank Savings Account Number',
        type: 'text',
        required: true,
        placeholder: 'Enter bank account number'
      },
      {
        id: 'ifscCode',
        label: 'Bank IFSC Code',
        type: 'text',
        required: true,
        placeholder: 'e.g. PKGB0001234'
      }
    ]
  },
  {
    id: 2,
    service_type: 'pm_kisan',
    title: 'PM-Kisan Samman Nidhi Enrollment',
    description: 'Financial benefit of ₹6,000 per year in three equal installments to landholding farmer families.',
    icon: 'Tractor',
    category: 'Agriculture',
    fields: [
      {
        id: 'farmerName',
        label: 'Farmer Name (As per Land Records)',
        type: 'text',
        required: true,
        placeholder: 'Enter name as in RTC / Pahani'
      },
      {
        id: 'gender',
        label: 'Gender',
        type: 'select',
        required: true,
        options: [
          { label: 'Male', value: 'Male' },
          { label: 'Female', value: 'Female' },
          { label: 'Other', value: 'Other' }
        ]
      },
      {
        id: 'mobileNumber',
        label: 'Registered Mobile Number',
        type: 'tel',
        required: true,
        pattern: '^[0-9]{10}$',
        placeholder: '10-digit mobile number'
      },
      {
        id: 'khatoniNumber',
        label: 'Survey / Khata / Khatoni Number',
        type: 'text',
        required: true,
        placeholder: 'e.g. Sy No. 45/2'
      },
      {
        id: 'landCategory',
        label: 'Farmer Category by Land Size',
        type: 'select',
        required: true,
        options: [
          { label: 'Marginal (Less than 1 Hectare / 2.5 Acres)', value: 'marginal' },
          { label: 'Small (1 - 2 Hectares / 2.5 - 5 Acres)', value: 'small' },
          { label: 'Medium (2 - 4 Hectares)', value: 'medium' }
        ]
      },
      {
        id: 'village',
        label: 'Village / Gram Panchayat',
        type: 'text',
        required: true,
        placeholder: 'e.g. Hunsur Taluk, Bilikere'
      },
      {
        id: 'district',
        label: 'District',
        type: 'text',
        required: true,
        placeholder: 'e.g. Mysuru'
      }
    ]
  },
  {
    id: 3,
    service_type: 'post_matric_scholarship',
    title: 'Post-Matric Rural Youth Scholarship',
    description: 'Financial assistance covering college tuition, hostel allowances, and books for rural students.',
    icon: 'GraduationCap',
    category: 'Education',
    fields: [
      {
        id: 'studentName',
        label: 'Student Full Name',
        type: 'text',
        required: true,
        placeholder: 'e.g. Shruthi R'
      },
      {
        id: 'dateOfBirth',
        label: 'Date of Birth',
        type: 'date',
        required: true
      },
      {
        id: 'collegeName',
        label: 'College / Institute Name',
        type: 'text',
        required: true,
        placeholder: 'e.g. Government Polytechnic'
      },
      {
        id: 'courseLevel',
        label: 'Course / Degree Level',
        type: 'select',
        required: true,
        options: [
          { label: 'Higher Secondary / 11th-12th / PUC', value: 'puc' },
          { label: 'Diploma / ITI', value: 'diploma' },
          { label: 'Undergraduate (BA / BSc / BCom / BTech)', value: 'ug' },
          { label: 'Postgraduate (MA / MSc / MCom)', value: 'pg' }
        ]
      },
      {
        id: 'category',
        label: 'Social Category',
        type: 'select',
        required: true,
        options: [
          { label: 'SC (Scheduled Caste)', value: 'SC' },
          { label: 'ST (Scheduled Tribe)', value: 'ST' },
          { label: 'OBC (Other Backward Classes)', value: 'OBC' },
          { label: 'EWS (Economically Weaker Section)', value: 'EWS' },
          { label: 'General', value: 'General' }
        ]
      },
      {
        id: 'annualFamilyIncome',
        label: 'Annual Family Income (INR)',
        type: 'number',
        required: true,
        placeholder: 'Must be less than 2,50,000'
      },
      {
        id: 'previousMarksPercentage',
        label: 'Previous Academic Year Percentage',
        type: 'number',
        required: true,
        min: 35,
        max: 100,
        placeholder: 'e.g. 78.5'
      }
    ]
  },
  {
    id: 4,
    service_type: 'caste_income_certificate',
    title: 'Caste & Income Certificate Registration',
    description: 'Official Nadakacheri revenue certificate required for state subsidies, reservations, and schemes.',
    icon: 'FileCheck',
    category: 'Revenue & Certificates',
    fields: [
      {
        id: 'applicantName',
        label: 'Applicant Full Name',
        type: 'text',
        required: true,
        placeholder: 'e.g. Rajesh Naik'
      },
      {
        id: 'parentName',
        label: 'Father / Mother / Guardian Name',
        type: 'text',
        required: true,
        placeholder: 'Enter guardian name'
      },
      {
        id: 'casteCategory',
        label: 'Claimed Category & Sub-Caste',
        type: 'text',
        required: true,
        placeholder: 'e.g. Category 2A (Kuruba / Vokkaliga / etc.)'
      },
      {
        id: 'totalIncomeINR',
        label: 'Total Family Annual Income From All Sources (INR)',
        type: 'number',
        required: true,
        placeholder: 'e.g. 75000'
      },
      {
        id: 'residentialAddress',
        label: 'Permanent Rural Residential Address',
        type: 'textarea',
        required: true,
        placeholder: 'House number, Street, Village, Gram Panchayat, Taluk, PIN Code'
      },
      {
        id: 'deliveryPreference',
        label: 'Certificate Delivery Preference',
        type: 'select',
        required: true,
        options: [
          { label: 'Digital Copy (SMS link & PDF download)', value: 'digital' },
          { label: 'Physical Copy Pickup at Gram Panchayat Office', value: 'panchayat' }
        ]
      }
    ]
  }
];

export const initializeDbSeed = async () => {
  try {
    await db.transaction('rw', db.forms, db.cachedForms, db.schemes, db.cachedSchemes, db.meta, async () => {
      if (!(await db.forms.count())) await db.forms.bulkPut(defaultServiceForms);
      if (!(await db.cachedForms.count())) await db.cachedForms.bulkPut(defaultServiceForms);
      if (!(await db.schemes.count())) await db.schemes.bulkPut(defaultSchemes);
      if (!(await db.cachedSchemes.count())) await db.cachedSchemes.bulkPut(defaultSchemes);
      await db.meta.put({ key: 'schemaVersion', value: 2, updatedAt: new Date().toISOString() });
    });
  } catch (err) {
    console.warn('[OfflineBridge DB Seed Warning]:', err);
  }
};

const normalizeForm = (row) => ({
  ...(row.schema_json || {}), ...row,
  service_type: row.service_type || row.service_key,
  id: row.id || row.schema_json?.id
});

export async function refreshCatalog() {
  if (!navigator.onLine) return { refreshed: false, reason: 'offline' };
  const [formsResult, schemesResult] = await Promise.allSettled([
    apiClient.get('/forms'), apiClient.get('/schemes')
  ]);
  const forms = formsResult.status === 'fulfilled'
    ? (formsResult.value.data.data || formsResult.value.data.forms || []).map(normalizeForm) : null;
  const schemes = schemesResult.status === 'fulfilled'
    ? (schemesResult.value.data.data || schemesResult.value.data.schemes || []).map((row) => ({
      ...(defaultSchemes.find((item) => item.id === row.scheme_key) || {}), ...row,
      id: row.scheme_key || row.id,
      rules: row.eligibility_rules_json || row.rules,
      benefits: row.benefit || row.benefits
    })) : null;
  await db.transaction('rw', db.forms, db.cachedForms, db.schemes, db.cachedSchemes, db.meta, async () => {
    if (forms?.length) { await db.forms.bulkPut(forms); await db.cachedForms.bulkPut(forms); }
    if (schemes?.length) { await db.schemes.bulkPut(schemes); await db.cachedSchemes.bulkPut(schemes); }
    await db.meta.put({ key: 'lastCatalogRefresh', value: new Date().toISOString() });
  });
  return { refreshed: Boolean(forms?.length || schemes?.length), forms: forms?.length || 0, schemes: schemes?.length || 0 };
}

export async function saveDraft(key, serviceType, data) {
  await db.drafts.put({ key, serviceType, data, updatedAt: new Date().toISOString() });
}

export const getDraft = (key) => db.drafts.get(key);
export const deleteDraft = (key) => db.drafts.delete(key);

export async function queueOfflineItem(entityType, payload, record) {
  const table = entityType === 'submission' ? db.submissions : db.grievances;
  const now = new Date().toISOString();
  const queued = {
    ...record, client_uuid: payload.client_uuid, payload,
    syncStatus: 'pending', retryCount: 0, nextRetryAt: null,
    createdAt: now, created_at: record.created_at || now, syncedAt: null
  };
  await db.transaction('rw', table, db.syncQueue, async () => {
    await table.put(queued);
    await db.syncQueue.put({ id: `${entityType}:${payload.client_uuid}`, entityType,
      clientUuid: payload.client_uuid, state: 'pending', nextRetryAt: null, createdAt: now });
  });
  return queued;
}
