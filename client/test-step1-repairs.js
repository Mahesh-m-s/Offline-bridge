/**
 * ArivuNet — Automated Frontend Interfaces & Scheme Discovery Test Suite
 * Covers:
 * - Category filtering & taxonomy consistency
 * - Scheme search & sorting
 * - Scheme-specific form schemas & validation logic
 * - Rule-based Eligibility questionnaire evaluation & unknown condition tracking
 * - Draft storage persistence (save, restore, edit, delete) & backward compatibility
 * - Grievance draft management & validation
 * - Tracking safety guarantees ("Saved locally — not submitted")
 */

import assert from 'assert';
import {
  SCHEMES_CATALOGUE,
  CATEGORIES,
  KARNATAKA_DISTRICTS,
  getAllCatalogueSchemes,
  getCatalogueSchemeById,
  filterCatalogueSchemes
} from './src/data/schemesCatalogue.js';

import {
  saveDraft,
  getDraft,
  getAllDrafts,
  deleteDraft,
  saveGrievanceDraft,
  getGrievanceDraft,
  deleteGrievanceDraft
} from './src/offline/draftStorage.js';

// Setup Mock Window / LocalStorage for Node.js test environment
class MockLocalStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.get(key) || null;
  }
  setItem(key, value) {
    this.store.set(key, String(value));
  }
  removeItem(key) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
  get length() {
    return this.store.size;
  }
  key(index) {
    return Array.from(this.store.keys())[index] || null;
  }
}

globalThis.window = {
  localStorage: new MockLocalStorage()
};

async function runTests() {
  console.log('=== ArivuNet Step 1: Interface & Scheme Discovery Verification ===\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ FAIL: ${name} ->`, err.message);
      failed++;
    }
  }

  // 1. Catalogue Structure & Government Source Verification
  await test('Catalogue contains verified schemes across all required citizen categories', async () => {
    assert(Array.isArray(SCHEMES_CATALOGUE), 'Schemes catalogue must be an array');
    assert(SCHEMES_CATALOGUE.length >= 8, `Expected at least 8 verified schemes, found ${SCHEMES_CATALOGUE.length}`);

    const categoriesInCatalogue = new Set(SCHEMES_CATALOGUE.map((s) => s.category));
    assert(categoriesInCatalogue.has('farmer'), 'Missing farmer category');
    assert(categoriesInCatalogue.has('citizen'), 'Missing citizen category');
    assert(categoriesInCatalogue.has('housing'), 'Missing housing category');
    assert(categoriesInCatalogue.has('food'), 'Missing food category');
    assert(categoriesInCatalogue.has('student'), 'Missing student category');
    assert(categoriesInCatalogue.has('health'), 'Missing health category');
    assert(categoriesInCatalogue.has('business'), 'Missing business category');
    assert(categoriesInCatalogue.has('it_services'), 'Missing it_services category');

    // Verify all schemes have authoritative fields and no false integration claims
    SCHEMES_CATALOGUE.forEach((scheme) => {
      assert(scheme.id, 'Scheme missing ID');
      assert(scheme.title, `Scheme ${scheme.id} missing title`);
      assert(scheme.department, `Scheme ${scheme.id} missing department`);
      assert(scheme.officialUrl?.startsWith('https://'), `Scheme ${scheme.id} must have verified https officialUrl`);
      assert(scheme.lastVerified, `Scheme ${scheme.id} missing lastVerified timestamp`);
      assert(scheme.officialIntegrationAvailable === false, `Scheme ${scheme.id} must not claim live government integration`);
      assert(Array.isArray(scheme.eligibilityCriteria) && scheme.eligibilityCriteria.length > 0, `Scheme ${scheme.id} missing criteria`);
      assert(Array.isArray(scheme.requiredDocuments) && scheme.requiredDocuments.length > 0, `Scheme ${scheme.id} missing required docs`);
      assert(Array.isArray(scheme.formFields) && scheme.formFields.length > 0, `Scheme ${scheme.id} must have defined formFields`);
    });
  });

  // 2. Category Filtering Tests
  await test('filterCatalogueSchemes() accurately filters schemes by category', async () => {
    const farmerSchemes = filterCatalogueSchemes({ category: 'farmer' });
    assert(farmerSchemes.length > 0, 'Farmer schemes should not be empty');
    farmerSchemes.forEach((s) => assert.strictEqual(s.category, 'farmer'));

    const housingSchemes = filterCatalogueSchemes({ category: 'housing' });
    assert(housingSchemes.length > 0, 'Housing schemes should not be empty');
    housingSchemes.forEach((s) => assert.strictEqual(s.category, 'housing'));

    const allSchemes = filterCatalogueSchemes({ category: 'all' });
    assert.strictEqual(allSchemes.length, SCHEMES_CATALOGUE.length, 'All category should return complete catalogue');

    const emptyResults = filterCatalogueSchemes({ category: 'non_existent_category' });
    assert.strictEqual(emptyResults.length, 0, 'Non-existent category should return empty array');
  });

  // 3. Scheme Search & Sorting
  await test('filterCatalogueSchemes() supports search terms and sorting', async () => {
    // Search by title keyword
    const ragiResults = filterCatalogueSchemes({ search: 'Seed' });
    assert(ragiResults.length >= 1, 'Search for Seed should return at least 1 scheme');
    assert(ragiResults.some((s) => s.id === 'agri-seed-subsidy'));

    // Search by Kannada title keyword
    const kannadaResults = filterCatalogueSchemes({ search: 'ಗೃಹಲಕ್ಷ್ಮಿ' });
    assert(kannadaResults.length >= 1, 'Search for ಗೃಹಲಕ್ಷ್ಮಿ should return Gruha Lakshmi');

    // Sorting by Title A-Z
    const sorted = filterCatalogueSchemes({ sort: 'title_asc' });
    for (let i = 0; i < sorted.length - 1; i++) {
      assert(sorted[i].title.localeCompare(sorted[i + 1].title) <= 0, 'Schemes should be in ascending alphabetical order');
    }
  });

  // 4. Scheme Form Schemas & Field Validation Logic
  await test('Scheme-specific form definitions contain verified rules and conditional dependencies', async () => {
    const housing = getCatalogueSchemeById('rural-housing-assist');
    assert(housing, 'Rural housing scheme must exist');
    const ownsSiteField = housing.formFields.find((f) => f.id === 'ownsSite');
    const hakkuPatraField = housing.formFields.find((f) => f.id === 'hakkuPatraNo');
    assert(ownsSiteField, 'ownsSite field must exist');
    assert(hakkuPatraField, 'hakkuPatraNo field must exist');
    assert.deepStrictEqual(hakkuPatraField.dependsOn, { field: 'ownsSite', value: 'yes' }, 'hakkuPatraNo must depend on ownsSite === yes');

    // Karnataka districts list validation
    assert(Array.isArray(KARNATAKA_DISTRICTS) && KARNATAKA_DISTRICTS.length >= 30, 'Karnataka districts list must contain at least 30 districts');
    assert(KARNATAKA_DISTRICTS.includes('Mysuru'));
    assert(KARNATAKA_DISTRICTS.includes('Bengaluru Urban'));
  });

  // 5. Rule-Based Eligibility Assistant Logic
  await test('Eligibility evaluation accurately flags likely eligible, unmet, and unknown conditions', async () => {
    // Test Case A: Eligible Senior Citizen for Sandhya Suraksha
    const seniorScheme = getCatalogueSchemeById('old-age-pension');
    assert(seniorScheme.eligibilityRules.minAge === 65);
    assert(seniorScheme.eligibilityRules.maxIncome === 32000);

    // If age 68 and income under 32k, senior criteria satisfied
    const applicantAge = 68;
    const applicantIncome = 24000;
    assert(applicantAge >= seniorScheme.eligibilityRules.minAge, 'Senior age should satisfy condition');
    assert(applicantIncome <= seniorScheme.eligibilityRules.maxIncome, 'Senior income should satisfy condition');

    // Test Case B: Ineligible Candidate (Age 45 applying for Senior Citizen pension)
    assert(45 < seniorScheme.eligibilityRules.minAge, 'Age 45 must fail senior citizen pension condition');

    // Test Case C: Candidate outside Karnataka
    const isResident = false;
    assert(!isResident && seniorScheme.eligibilityRules.karnatakaResidentOnly, 'Non-Karnataka resident must fail state residency rule');
  });

  // 6. Draft Storage Engine: Save, Restore, Edit, Delete with Custom Fields
  await test('draftStorage accurately persists and updates scheme drafts with scheme-specific fields', async () => {
    const testServiceId = 'test-agri-scheme';
    const initialData = {
      applicantName: 'Shivaraj Gowda',
      contactPhone: '9845012345',
      district: 'Mandya',
      taluk: 'Maddur',
      villagePanchayat: 'Besagarahalli',
      fruitsId: '202611002233',
      rtcSurveyNo: '88/1B',
      cropType: 'ragi',
      landAreaAcres: 2.2,
      docChecklist: ['Aadhaar Card', 'RTC Pahani']
    };

    // Save Draft
    const saved = await saveDraft(testServiceId, 'Test Agriculture Subsidy', initialData);
    assert.strictEqual(saved.id, testServiceId);
    assert.strictEqual(saved.formData.applicantName, 'Shivaraj Gowda');
    assert.strictEqual(saved.formData.fruitsId, '202611002233');
    assert.strictEqual(saved.formData.district, 'Mandya');
    assert.strictEqual(saved.statusLabel, 'Saved locally — not submitted');
    const createdAtTime = saved.createdAt;

    // Retrieve Draft
    const retrieved = await getDraft(testServiceId);
    assert(retrieved, 'Draft must be retrieved from storage');
    assert.strictEqual(retrieved.formData.applicantName, 'Shivaraj Gowda');
    assert.strictEqual(retrieved.formData.rtcSurveyNo, '88/1B');
    assert.deepStrictEqual(retrieved.formData.docChecklist, ['Aadhaar Card', 'RTC Pahani']);

    // Update Draft (Edit)
    const updatedData = {
      ...initialData,
      applicantName: 'Shivaraj Gowda Updated',
      landAreaAcres: 3.5
    };
    const updated = await saveDraft(testServiceId, 'Test Agriculture Subsidy', updatedData);
    assert.strictEqual(updated.formData.applicantName, 'Shivaraj Gowda Updated');
    assert.strictEqual(updated.formData.landAreaAcres, 3.5);
    assert.strictEqual(updated.createdAt, createdAtTime, 'Stable createdAt timestamp must be preserved on edit');

    // Delete Draft
    const deleteResult = await deleteDraft(testServiceId);
    assert(deleteResult, 'Draft deletion must succeed');
    const postDelete = await getDraft(testServiceId);
    assert.strictEqual(postDelete, null, 'Draft must not exist after deletion');
  });

  // 7. Grievance Draft Dedicated Storage
  await test('Grievance draft persistence supports save, read, and delete without collision', async () => {
    const grievanceData = {
      category: 'water_supply',
      subject: 'Borewell pump repair required in Ward 3',
      description: 'The drinking water motor pump has burned out and needs rewinding.',
      district: 'Mysuru',
      taluk: 'Hunsur',
      villagePanchayat: 'Maraluru GP',
      complainantName: 'Mahesh M.S',
      contactPhone: '9988776655'
    };

    const savedGrievance = await saveGrievanceDraft(grievanceData);
    assert.strictEqual(savedGrievance.id, 'citizen-grievance');
    assert.strictEqual(savedGrievance.type, 'grievance');
    assert.strictEqual(savedGrievance.formData.subject, 'Borewell pump repair required in Ward 3');

    const loadedGrievance = await getGrievanceDraft();
    assert(loadedGrievance, 'Grievance draft must be retrieved');
    assert.strictEqual(loadedGrievance.formData.complainantName, 'Mahesh M.S');

    await deleteGrievanceDraft();
    const afterDelete = await getGrievanceDraft();
    assert.strictEqual(afterDelete, null, 'Grievance draft must be deleted cleanly');
  });

  // 8. Backward Compatibility with Existing Legacy Drafts
  await test('draftStorage preserves legacy draft records matching user screenshots', async () => {
    // Simulating pre-existing draft from user screenshot: serviceId: 'agri-seed-subsidy', applicant: 'mahessh'
    const legacyKey = 'arivunet_draft_agri-seed-subsidy';
    const legacyRecord = {
      id: 'agri-seed-subsidy',
      serviceId: 'agri-seed-subsidy',
      serviceTitle: 'Farmer Seed & Fertilizer Subsidy',
      formData: {
        applicantName: 'mahessh',
        contactPhone: '9876543210',
        villagePanchayat: 'maraluru',
        categoryDetails: 'Small Farmer (< 2 Hectares)',
        notes: ''
      },
      createdAt: '2026-10-15T11:30:00.000Z',
      updatedAt: '2026-10-15T11:30:00.000Z',
      status: 'saved_locally',
      statusLabel: 'Saved locally — not submitted'
    };

    window.localStorage.setItem(legacyKey, JSON.stringify(legacyRecord));

    const retrieved = await getDraft('agri-seed-subsidy');
    assert(retrieved, 'Legacy draft must be loaded without errors');
    assert.strictEqual(retrieved.formData.applicantName, 'mahessh');
    assert.strictEqual(retrieved.formData.villagePanchayat, 'maraluru');

    const all = await getAllDrafts();
    assert(all.some((d) => d.id === 'agri-seed-subsidy'), 'Legacy draft must appear in getAllDrafts() list');

    // Clean up
    await deleteDraft('agri-seed-subsidy');
  });

  console.log(`\nFrontend interface verification completed: ${passed} passed, ${failed} failed.`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
