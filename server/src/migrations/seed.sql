-- OfflineBridge Seed Dataset
-- Migration: seed.sql

-- 1. Demo Citizen User (password: rural123)
-- bcrypt hash for 'rural123': $2a$10$w81k0v/89e5YfR7Jz.K24O1aZ4Ww9R1N8n0mN4lY2cT6nZ3fX7sKu
INSERT INTO users (name, phone, password_hash, role)
VALUES 
('Ramesh Gowda', '9876543210', '$2a$10$w81k0v/89e5YfR7Jz.K24O1aZ4Ww9R1N8n0mN4lY2cT6nZ3fX7sKu', 'citizen'),
('Suma Patil', '9123456780', '$2a$10$w81k0v/89e5YfR7Jz.K24O1aZ4Ww9R1N8n0mN4lY2cT6nZ3fX7sKu', 'citizen')
ON CONFLICT (phone) DO NOTHING;

-- 2. Service Forms
INSERT INTO service_forms (service_type, title, version, schema_json)
VALUES
(
    'kisan_credit',
    'Kisan Credit Card (KCC) Application',
    1,
    '{
        "service_type": "kisan_credit",
        "title": "Kisan Credit Card (KCC) Application",
        "description": "Subsidized crop credit & agriculture term loans for small, marginal and tenant farmers.",
        "icon": "CreditCard",
        "category": "Agriculture",
        "fields": [
            {
                "id": "fullName",
                "label": "Applicant Full Name",
                "type": "text",
                "required": true,
                "placeholder": "e.g. Ramesh Gowda"
            },
            {
                "id": "aadhaarNumber",
                "label": "Aadhaar Number",
                "type": "text",
                "required": true,
                "placeholder": "12-digit Aadhaar number",
                "pattern": "^[0-9]{12}$",
                "helperText": "Enter exact 12 digit Aadhaar number"
            },
            {
                "id": "landHoldingAcres",
                "label": "Total Cultivable Land Holding (in Acres)",
                "type": "number",
                "required": true,
                "min": 0.1,
                "placeholder": "e.g. 2.5"
            },
            {
                "id": "cropType",
                "label": "Primary Crop Type",
                "type": "select",
                "required": true,
                "options": [
                    {"label": "Kharif (Paddy, Ragi, Maize, Cotton)", "value": "kharif"},
                    {"label": "Rabi (Wheat, Gram, Mustard)", "value": "rabi"},
                    {"label": "Horticulture & Vegetables", "value": "horticulture"},
                    {"label": "Mixed / Year-round", "value": "mixed"}
                ]
            },
            {
                "id": "loanAmountRequested",
                "label": "Requested Credit Limit (INR)",
                "type": "number",
                "required": true,
                "min": 10000,
                "placeholder": "e.g. 100000"
            },
            {
                "id": "bankName",
                "label": "Preferred Bank / Grameen Bank",
                "type": "text",
                "required": true,
                "placeholder": "e.g. Karnataka Gramin Bank"
            },
            {
                "id": "accountNumber",
                "label": "Bank Savings Account Number",
                "type": "text",
                "required": true,
                "placeholder": "Enter account number"
            },
            {
                "id": "ifscCode",
                "label": "Bank IFSC Code",
                "type": "text",
                "required": true,
                "placeholder": "e.g. PKGB0001234"
            }
        ]
    }'::jsonb
),
(
    'pm_kisan',
    'PM-Kisan Samman Nidhi Enrollment',
    1,
    '{
        "service_type": "pm_kisan",
        "title": "PM-Kisan Samman Nidhi Enrollment",
        "description": "Financial benefit of ₹6,000 per year in three equal installments to landholding farmer families.",
        "icon": "Tractor",
        "category": "Agriculture",
        "fields": [
            {
                "id": "farmerName",
                "label": "Farmer Name (As per Land Records)",
                "type": "text",
                "required": true,
                "placeholder": "Enter name as in RTC / Pahani"
            },
            {
                "id": "gender",
                "label": "Gender",
                "type": "select",
                "required": true,
                "options": [
                    {"label": "Male", "value": "Male"},
                    {"label": "Female", "value": "Female"},
                    {"label": "Other", "value": "Other"}
                ]
            },
            {
                "id": "mobileNumber",
                "label": "Registered Mobile Number",
                "type": "tel",
                "required": true,
                "pattern": "^[0-9]{10}$",
                "placeholder": "10-digit mobile number"
            },
            {
                "id": "khatoniNumber",
                "label": "Survey / Khata / Khatoni Number",
                "type": "text",
                "required": true,
                "placeholder": "e.g. Sy No. 45/2"
            },
            {
                "id": "landCategory",
                "label": "Farmer Category by Land Size",
                "type": "select",
                "required": true,
                "options": [
                    {"label": "Marginal (Less than 1 Hectare / 2.5 Acres)", "value": "marginal"},
                    {"label": "Small (1 - 2 Hectares / 2.5 - 5 Acres)", "value": "small"},
                    {"label": "Medium (2 - 4 Hectares)", "value": "medium"}
                ]
            },
            {
                "id": "village",
                "label": "Village / Gram Panchayat",
                "type": "text",
                "required": true,
                "placeholder": "e.g. Hunsur Taluk, Bilikere"
            },
            {
                "id": "district",
                "label": "District",
                "type": "text",
                "required": true,
                "placeholder": "e.g. Mysuru"
            }
        ]
    }'::jsonb
),
(
    'post_matric_scholarship',
    'Post-Matric Rural Youth Scholarship',
    1,
    '{
        "service_type": "post_matric_scholarship",
        "title": "Post-Matric Rural Youth Scholarship",
        "description": "Financial assistance covering college tuition, hostel allowances, and books for rural students.",
        "icon": "GraduationCap",
        "category": "Education",
        "fields": [
            {
                "id": "studentName",
                "label": "Student Full Name",
                "type": "text",
                "required": true,
                "placeholder": "e.g. Shruthi R"
            },
            {
                "id": "dateOfBirth",
                "label": "Date of Birth",
                "type": "date",
                "required": true
            },
            {
                "id": "collegeName",
                "label": "College / Institute Name",
                "type": "text",
                "required": true,
                "placeholder": "e.g. Government Polytechnic"
            },
            {
                "id": "courseLevel",
                "label": "Course / Degree Level",
                "type": "select",
                "required": true,
                "options": [
                    {"label": "Higher Secondary / 11th-12th / PUC", "value": "puc"},
                    {"label": "Diploma / ITI", "value": "diploma"},
                    {"label": "Undergraduate (BA / BSc / BCom / BTech)", "value": "ug"},
                    {"label": "Postgraduate (MA / MSc / MCom)", "value": "pg"}
                ]
            },
            {
                "id": "category",
                "label": "Social Category",
                "type": "select",
                "required": true,
                "options": [
                    {"label": "SC (Scheduled Caste)", "value": "SC"},
                    {"label": "ST (Scheduled Tribe)", "value": "ST"},
                    {"label": "OBC (Other Backward Classes)", "value": "OBC"},
                    {"label": "EWS (Economically Weaker Section)", "value": "EWS"},
                    {"label": "General", "value": "General"}
                ]
            },
            {
                "id": "annualFamilyIncome",
                "label": "Annual Family Income (INR)",
                "type": "number",
                "required": true,
                "placeholder": "Must be less than 2,50,000"
            },
            {
                "id": "previousMarksPercentage",
                "label": "Previous Academic Year Percentage",
                "type": "number",
                "required": true,
                "min": 35,
                "max": 100,
                "placeholder": "e.g. 78.5"
            }
        ]
    }'::jsonb
),
(
    'caste_income_certificate',
    'Caste & Income Certificate Registration',
    1,
    '{
        "service_type": "caste_income_certificate",
        "title": "Caste & Income Certificate Registration",
        "description": "Official Nadakacheri revenue certificate required for state subsidies, reservations, and schemes.",
        "icon": "FileCheck",
        "category": "Revenue & Certificates",
        "fields": [
            {
                "id": "applicantName",
                "label": "Applicant Full Name",
                "type": "text",
                "required": true,
                "placeholder": "e.g. Rajesh Naik"
            },
            {
                "id": "parentName",
                "label": "Father / Mother / Guardian Name",
                "type": "text",
                "required": true,
                "placeholder": "Enter guardian name"
            },
            {
                "id": "casteCategory",
                "label": "Claimed Category & Sub-Caste",
                "type": "text",
                "required": true,
                "placeholder": "e.g. Category 2A (Kuruba / Vokkaliga / etc.)"
            },
            {
                "id": "totalIncomeINR",
                "label": "Total Family Annual Income From All Sources (INR)",
                "type": "number",
                "required": true,
                "placeholder": "e.g. 75000"
            },
            {
                "id": "residentialAddress",
                "label": "Permanent Rural Residential Address",
                "type": "textarea",
                "required": true,
                "placeholder": "House number, Street, Village, Gram Panchayat, Taluk, PIN Code"
            },
            {
                "id": "deliveryPreference",
                "label": "Certificate Delivery Preference",
                "type": "select",
                "required": true,
                "options": [
                    {"label": "Digital Copy (SMS link & PDF download)", "value": "digital"},
                    {"label": "Physical Copy Pickup at Gram Panchayat Office", "value": "panchayat"}
                ]
            }
        ]
    }'::jsonb
)
ON CONFLICT (service_type) DO UPDATE 
SET title = EXCLUDED.title,
    schema_json = EXCLUDED.schema_json,
    version = EXCLUDED.version;

-- 3. Schemes with Eligibility Rules
INSERT INTO schemes (name, description, eligibility_rules_json)
VALUES
(
    'PM-Kisan Samman Nidhi',
    'Direct income support of ₹6,000 per year for eligible landholding farmer families across India.',
    '{
        "id": "pm_kisan",
        "category": "Agriculture",
        "benefits": "₹6,000 annual direct transfer in 3 installments of ₹2,000",
        "rules": {
            "maxLandAcres": 5.0,
            "maxIncome": 200000,
            "occupation": ["Farmer", "Agricultural Laborer"],
            "allowedCategories": ["All"]
        }
    }'::jsonb
),
(
    'Post-Matric Rural Scholarship',
    '100% tuition reimbursement and maintenance allowances for rural students in higher education.',
    '{
        "id": "rural_scholarship",
        "category": "Education",
        "benefits": "Tuition fees + ₹1,200/month hostel & study allowance",
        "rules": {
            "minAge": 16,
            "maxAge": 28,
            "isStudent": true,
            "maxIncome": 250000,
            "allowedCategories": ["SC", "ST", "OBC", "EWS"]
        }
    }'::jsonb
),
(
    'Pradhan Mantri Awas Yojana (Gramin)',
    'Financial assistance for construction of pucca houses with clean cooking spaces and sanitation.',
    '{
        "id": "pmay_gramin",
        "category": "Housing & Welfare",
        "benefits": "₹1,20,000 grant for house construction + 90 days MGNREGA labor",
        "rules": {
            "maxIncome": 150000,
            "landOwnership": ["Landless", "Marginal"],
            "hasPuccaHouse": false,
            "allowedCategories": ["All"]
        }
    }'::jsonb
),
(
    'National Social Assistance - Old Age Pension',
    'Monthly pension support for senior citizens living in rural areas under the poverty threshold.',
    '{
        "id": "old_age_pension",
        "category": "Social Security",
        "benefits": "₹1,500 monthly direct bank transfer pension",
        "rules": {
            "minAge": 60,
            "maxIncome": 100000,
            "allowedCategories": ["All"]
        }
    }'::jsonb
),
(
    'Agricultural Equipment Subsidy Scheme',
    'Subsidy up to 50% for purchasing solar pumps, power tillers, sprayers, and drip irrigation kits.',
    '{
        "id": "agri_equipment",
        "category": "Agriculture",
        "benefits": "Up to 50% subsidy (max ₹1,00,000) on approved farm machinery",
        "rules": {
            "occupation": ["Farmer"],
            "maxLandAcres": 5.0,
            "maxIncome": 300000,
            "allowedCategories": ["All"]
        }
    }'::jsonb
),
(
    'Rural Girl Child Higher Education Grant',
    'One-time grant to encourage girl students from rural villages to enroll in college degrees.',
    '{
        "id": "girl_education",
        "category": "Women & Youth",
        "benefits": "₹50,000 one-time higher education incentive deposit",
        "rules": {
            "isFemale": true,
            "isStudent": true,
            "maxIncome": 300000,
            "minAge": 17,
            "maxAge": 24,
            "allowedCategories": ["All"]
        }
    }'::jsonb
);
