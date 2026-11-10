--
-- PostgreSQL database dump
--

\restrict ZPUmUjVma69h73eReInypzRDsxe51XjOdMjDzdsEE2uJ4NEckrTIlKw6S8u5YEq

-- Dumped from database version 16.15
-- Dumped by pg_dump version 16.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _schema_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._schema_migrations (
    id character varying(255) NOT NULL,
    applied_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public._schema_migrations OWNER TO postgres;

--
-- Name: application_status_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.application_status_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    application_id uuid NOT NULL,
    status character varying(32) NOT NULL,
    remarks text,
    changed_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.application_status_history OWNER TO postgres;

--
-- Name: applications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.applications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    scheme_id character varying(64) NOT NULL,
    local_draft_id character varying(100),
    form_data jsonb DEFAULT '{}'::jsonb NOT NULL,
    status character varying(32) DEFAULT 'submitted'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    client_submission_id character varying(100),
    source_provenance jsonb DEFAULT '{}'::jsonb
);


ALTER TABLE public.applications OWNER TO postgres;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    actor_id uuid,
    actor_role character varying(32),
    action character varying(64) NOT NULL,
    resource_type character varying(64) NOT NULL,
    resource_id character varying(100),
    ip_address character varying(45),
    status character varying(16) DEFAULT 'success'::character varying NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: grievances; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.grievances (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    category character varying(100) NOT NULL,
    description text NOT NULL,
    village_panchayat character varying(150) NOT NULL,
    contact_phone character varying(20),
    status character varying(32) DEFAULT 'submitted'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    client_submission_id character varying(100),
    source_provenance jsonb DEFAULT '{}'::jsonb
);


ALTER TABLE public.grievances OWNER TO postgres;

--
-- Name: knowledge_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.knowledge_documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    scheme_id character varying(64),
    title character varying(255) NOT NULL,
    content text NOT NULL,
    source_url text,
    provenance jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.knowledge_documents OWNER TO postgres;

--
-- Name: schemes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.schemes (
    id character varying(64) NOT NULL,
    title character varying(200) NOT NULL,
    department character varying(150) NOT NULL,
    category character varying(100) NOT NULL,
    description text NOT NULL,
    eligibility_criteria text,
    eligibility_rules jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.schemes OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    full_name character varying(120) NOT NULL,
    phone character varying(20),
    role character varying(32) DEFAULT 'citizen'::character varying NOT NULL,
    village_panchayat character varying(150),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    password_hash character varying(255),
    is_active boolean DEFAULT true NOT NULL,
    CONSTRAINT chk_users_role CHECK (((role)::text = ANY ((ARRAY['citizen'::character varying, 'official'::character varying, 'admin'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: _schema_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._schema_migrations (id, applied_at) FROM stdin;
001_initial_schema	2026-11-10 14:27:13.858068+00
002_phase3_security_and_idempotency	2026-11-10 14:27:14.039176+00
\.


--
-- Data for Name: application_status_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.application_status_history (id, application_id, status, remarks, changed_by, created_at) FROM stdin;
\.


--
-- Data for Name: applications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.applications (id, user_id, scheme_id, local_draft_id, form_data, status, created_at, updated_at, client_submission_id, source_provenance) FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, actor_id, actor_role, action, resource_type, resource_id, ip_address, status, metadata, created_at) FROM stdin;
9e76a3f5-ac8a-41a9-83a3-9bd3eccd79a5	\N	system	SCHEME_UPSERTED	scheme	agri-seed-subsidy	127.0.0.1	success	{"title": "Farmer Seed & Fertilizer Subsidy (Raitha Siri)", "category": "farmer", "department": "Department of Agriculture, Govt. of Karnataka"}	2026-11-10 14:27:14.672839+00
1f8aea63-136d-41b4-9e30-dca32fce7106	\N	system	SCHEME_UPSERTED	scheme	old-age-pension	127.0.0.1	success	{"title": "Senior Citizen Pension Scheme (Sandhya Suraksha)", "category": "citizen", "department": "Directorate of Social Security and Pensions, Revenue Dept."}	2026-11-10 14:27:14.681083+00
86722ecb-c589-4b94-ab17-c4439896046a	\N	system	SCHEME_UPSERTED	scheme	rural-housing-assist	127.0.0.1	success	{"title": "Rural Pucca Housing Grant (Basava Vasathi Yojana)", "category": "housing", "department": "Rajiv Gandhi Housing Corporation Limited (RGHCL)"}	2026-11-10 14:27:14.686249+00
18c10925-7998-4a7a-8991-62db481fd7f1	\N	system	SCHEME_UPSERTED	scheme	ration-card-update	127.0.0.1	success	{"title": "Priority Ration Card Services (Ahara / Food & Civil Supplies)", "category": "food", "department": "Food, Civil Supplies and Consumer Affairs Department"}	2026-11-10 14:27:14.696618+00
d79d37ce-f979-4279-9f86-5063e176dc12	\N	system	SCHEME_UPSERTED	scheme	gruha-lakshmi	127.0.0.1	success	{"title": "Gruha Lakshmi Scheme (₹2,000 Monthly DBT)", "category": "citizen", "department": "Department of Women and Child Development"}	2026-11-10 14:27:14.702604+00
d3613338-d6d0-4985-bab0-ef3da6ff240a	\N	system	SCHEME_UPSERTED	scheme	yuva-nidhi	127.0.0.1	success	{"title": "Yuva Nidhi Scheme (Graduate & Diploma Stipend)", "category": "student", "department": "Department of Skill Development, Entrepreneurship and Livelihood"}	2026-11-10 14:27:14.707898+00
4d2a47aa-eeb6-4c6e-8f64-d44b0121a3cb	\N	system	SCHEME_UPSERTED	scheme	ssp-scholarship	127.0.0.1	success	{"title": "State Scholarship Portal (SSP) Post-Matric Scholarships", "category": "student", "department": "Social Welfare & Backward Classes Welfare Departments"}	2026-11-10 14:27:14.713261+00
798ebb96-7ff7-4608-ad65-a135438bb84b	\N	system	SCHEME_UPSERTED	scheme	arogya-karnataka	127.0.0.1	success	{"title": "Arogya Karnataka (Ayushman Bharat — SAST)", "category": "health", "department": "Health and Family Welfare / Suvarna Arogya Suraksha Trust"}	2026-11-10 14:27:14.718238+00
9f4c604f-2bf3-4ff5-9ae1-63738b88da89	\N	system	SCHEME_UPSERTED	scheme	msme-artisan-subsidy	127.0.0.1	success	{"title": "Dr. B.R. Ambedkar Rural Micro-Enterprise & Artisan Subsidy", "category": "business", "department": "Commerce and Industries / Development Corporations"}	2026-11-10 14:27:14.723369+00
bfc7c373-ebfe-42db-be8f-532f2ff1168a	\N	system	SCHEME_UPSERTED	scheme	kaveri-ec-services	127.0.0.1	success	{"title": "Kaveri 2.0 — Property Encumbrance Certificate (EC) & Deeds", "category": "it_services", "department": "Department of Stamps and Registration"}	2026-11-10 14:27:14.728847+00
511ccc40-1c93-4b29-9162-7bfb0ba1f7b0	\N	system	SCHEME_UPSERTED	scheme	agri-seed-subsidy	\N	success	{"title": "Farmer Seed Subsidy (Raitha Siri)", "category": "farmer", "department": "Department of Agriculture"}	2026-11-10 15:53:34.477725+00
\.


--
-- Data for Name: grievances; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.grievances (id, user_id, category, description, village_panchayat, contact_phone, status, created_at, updated_at, client_submission_id, source_provenance) FROM stdin;
\.


--
-- Data for Name: knowledge_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.knowledge_documents (id, scheme_id, title, content, source_url, provenance, created_at) FROM stdin;
1bf4bc6c-587e-4f5d-9d27-d3b779f6065d	\N	Dedup Title	Unique entitlement text for deduplication verification.	\N	{"page": 1, "section": "Intro", "language": "en", "chunkIndex": 0, "department": "Revenue", "documentId": "doc-dedup-test", "contentHash": "841fef807f7fac40a4b313e94d704cc65b59756a1e1b14ccae447e7599a5eed5", "totalChunks": 1, "documentTitle": "Dedup Title", "verificationStatus": "officially_verified"}	2026-11-10 15:54:08.335993+00
1f99d67d-ef57-4b3b-9273-fc725d885b20	agri-seed-subsidy	Farmer Seed & Fertilizer Subsidy (Raitha Siri)	Scheme Name: Farmer Seed & Fertilizer Subsidy (Raitha Siri) Department: Department of Agriculture, Govt. of Karnataka Category: farmer Official Portal: https://fruits.karnataka.gov.in Department Helpline: Janaspandana 1902	https://fruits.karnataka.gov.in	{"page": 1, "section": "Scheme: Farmer Seed & Fertilizer Subsidy (Raitha Siri)", "language": "en", "createdAt": "2026-11-10T15:54:08.354Z", "chunkIndex": 0, "department": "Department of Agriculture, Govt. of Karnataka", "documentId": "scheme-agri-seed-subsidy-en", "contentHash": "24157393dab66e733149af78475a5ea0af8d49743abdc05883dd5c233aa3d3e6", "totalChunks": 6, "documentTitle": "Farmer Seed & Fertilizer Subsidy (Raitha Siri)", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.360086+00
2a0a5913-f86b-4ee7-adce-c572f7c32df2	agri-seed-subsidy	Farmer Seed & Fertilizer Subsidy (Raitha Siri)	Details unavailable.	https://fruits.karnataka.gov.in	{"page": 1, "section": "Overview and Objectives", "language": "en", "createdAt": "2026-11-10T15:54:08.354Z", "chunkIndex": 1, "department": "Department of Agriculture, Govt. of Karnataka", "documentId": "scheme-agri-seed-subsidy-en", "contentHash": "34b7bc3dfa0c1f8c7e3abde6cf7e274d2e93a37fc262b6d403afcd4f0d7a6a0e", "totalChunks": 6, "documentTitle": "Farmer Seed & Fertilizer Subsidy (Raitha Siri)", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.365516+00
a2079af8-c961-465b-855d-8c5a4086f999	agri-seed-subsidy	Farmer Seed & Fertilizer Subsidy (Raitha Siri)	₹10,000 per hectare direct credit for millet cultivation and up to 50% subsidy on certified seeds through Raitha Samparka Kendras (RSK).	https://fruits.karnataka.gov.in	{"page": 1, "section": "Benefits and Financial Assistance", "language": "en", "createdAt": "2026-11-10T15:54:08.354Z", "chunkIndex": 2, "department": "Department of Agriculture, Govt. of Karnataka", "documentId": "scheme-agri-seed-subsidy-en", "contentHash": "e038077ca9140cad88fc39d90c0c728a3789ed67f94e4c2e0d114929106b976f", "totalChunks": 6, "documentTitle": "Farmer Seed & Fertilizer Subsidy (Raitha Siri)", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.369622+00
02438f2b-0552-499b-8244-2bb2d0872a79	agri-seed-subsidy	Farmer Seed & Fertilizer Subsidy (Raitha Siri)	- Must be a permanent resident farmer in Karnataka. - Must possess cultivable agricultural land registered in FRUITS with valid FID. - Must cultivate notified food grains, oilseeds, pulses, or millets. - Bank account must be active and linked to Aadhaar (NPCI mapped).	https://fruits.karnataka.gov.in	{"page": 1, "section": "Eligibility Criteria", "language": "en", "createdAt": "2026-11-10T15:54:08.354Z", "chunkIndex": 3, "department": "Department of Agriculture, Govt. of Karnataka", "documentId": "scheme-agri-seed-subsidy-en", "contentHash": "b5e7be1e5505fcb7d76a2dc899424aec3e03f6923dad40d7dca0ab0e55a3d969", "totalChunks": 6, "documentTitle": "Farmer Seed & Fertilizer Subsidy (Raitha Siri)", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.373451+00
a7b9f647-db62-44eb-be7d-dce0d5930fe4	agri-seed-subsidy	Farmer Seed & Fertilizer Subsidy (Raitha Siri)	- Aadhaar Card of the farmer - FRUITS ID (FID) Certificate - Land Ownership Record (RTC / Pahani) - Bank Passbook photocopy showing IFSC and Account Number	https://fruits.karnataka.gov.in	{"page": 1, "section": "Required Documents", "language": "en", "createdAt": "2026-11-10T15:54:08.354Z", "chunkIndex": 4, "department": "Department of Agriculture, Govt. of Karnataka", "documentId": "scheme-agri-seed-subsidy-en", "contentHash": "32b0b36840806b7721a85d461da9757d3367b05feecf0b648774c3e88bb761c2", "totalChunks": 6, "documentTitle": "Farmer Seed & Fertilizer Subsidy (Raitha Siri)", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.377229+00
b13bbf43-3a79-41e7-a454-00f05ece11f2	agri-seed-subsidy	Farmer Seed & Fertilizer Subsidy (Raitha Siri)	- Fill and save your application draft in ArivuNet completely offline. - Obtain or verify your 12-digit FRUITS Farmer ID (FID) at the nearest Raitha Samparka Kendra (RSK). - Submit the verified draft details along with your RTC / Pahani record at your local RSK or Agriculture Assistant office before sowing season. - Upon biometric verification, collect subsidised certified seeds directly from the RSK distribution counter.	https://fruits.karnataka.gov.in	{"page": 1, "section": "Application Procedure and Official Portals", "language": "en", "createdAt": "2026-11-10T15:54:08.354Z", "chunkIndex": 5, "department": "Department of Agriculture, Govt. of Karnataka", "documentId": "scheme-agri-seed-subsidy-en", "contentHash": "60abf236d919761e5edf25eb37ca842abeccca41a72b455e5d0d45cb09cb79a9", "totalChunks": 6, "documentTitle": "Farmer Seed & Fertilizer Subsidy (Raitha Siri)", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.38074+00
402d7cf4-3f5c-4a0f-b326-ad2614d397f0	agri-seed-subsidy	ರೈತ ಸಿರಿ — ಬಿತ್ತನೆ ಬೀಜ ಮತ್ತು ರಸಗೊಬ್ಬರ ಸಹಾಯಧನ	ಯೋಜನೆಯ ಹೆಸರು: ರೈತ ಸಿರಿ — ಬಿತ್ತನೆ ಬೀಜ ಮತ್ತು ರಸಗೊಬ್ಬರ ಸಹಾಯಧನ ಇಲಾಖೆ: ಕೃಷಿ ಇಲಾಖೆ, ಕರ್ನಾಟಕ ಸರ್ಕಾರ ವರ್ಗ: farmer ಅಧಿಕೃತ ಪೋರ್ಟಲ್: https://fruits.karnataka.gov.in ಸಹಾಯವಾಣಿ: ಜನಸ್ಪಂದನ 1902	https://fruits.karnataka.gov.in	{"page": 1, "section": "ಯೋಜನೆ: ರೈತ ಸಿರಿ — ಬಿತ್ತನೆ ಬೀಜ ಮತ್ತು ರಸಗೊಬ್ಬರ ಸಹಾಯಧನ", "language": "kn", "createdAt": "2026-11-10T15:54:08.354Z", "chunkIndex": 0, "department": "ಕೃಷಿ ಇಲಾಖೆ, ಕರ್ನಾಟಕ ಸರ್ಕಾರ", "documentId": "scheme-agri-seed-subsidy-kn", "contentHash": "f6d49387b96d9f081f76ddeb7328a0ecd9ad0a2267517eda5594c3c823032f90", "totalChunks": 5, "documentTitle": "ರೈತ ಸಿರಿ — ಬಿತ್ತನೆ ಬೀಜ ಮತ್ತು ರಸಗೊಬ್ಬರ ಸಹಾಯಧನ", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.384206+00
423d7c0e-03f0-4611-b888-d514bb5c36a3	old-age-pension	Senior Citizen Pension Scheme (Sandhya Suraksha)	- Applicant must be 65 years of age or older. - Must be a resident of Karnataka for at least 3 consecutive years. - Combined annual income of applicant and spouse must be below ₹32,000 (rural) or ₹40,000 (urban). - Applicant must not be receiving any other government, freedom fighter, or EPF pension.	https://nadakacheri.karnataka.gov.in	{"page": 1, "section": "Eligibility Criteria", "language": "en", "createdAt": "2026-11-10T15:54:08.355Z", "chunkIndex": 3, "department": "Directorate of Social Security and Pensions, Revenue Dept.", "documentId": "scheme-old-age-pension-en", "contentHash": "c8712c3d2f387907938149886f3a2fce59f31069e685c423a77e1ba0f4a9b21e", "totalChunks": 6, "documentTitle": "Senior Citizen Pension Scheme (Sandhya Suraksha)", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.410719+00
afbcba16-81ae-4311-a85d-85a4beb92261	agri-seed-subsidy	ರೈತ ಸಿರಿ — ಬಿತ್ತನೆ ಬೀಜ ಮತ್ತು ರಸಗೊಬ್ಬರ ಸಹಾಯಧನ	ಸಿರಿಧಾನ್ಯ ಬೆಳೆಗಾರರಿಗೆ ಹೆಕ್ಟೇರ್‌ಗೆ ₹10,000 ನೇರ ನಗದು ವರ್ಗಾವಣೆ ಮತ್ತು ರೈತ ಸಂಪರ್ಕ ಕೇಂದ್ರಗಳ ಮೂಲಕ ಪ್ರಮಾಣೀಕೃತ ಬೀಜಗಳಿಗೆ ಶೇ.50 ರಿಯಾಯಿತಿ.	https://fruits.karnataka.gov.in	{"page": 1, "section": "ಸೌಲಭ್ಯಗಳು ಮತ್ತು ಆರ್ಥಿಕ ನೆರವು", "language": "kn", "createdAt": "2026-11-10T15:54:08.354Z", "chunkIndex": 1, "department": "ಕೃಷಿ ಇಲಾಖೆ, ಕರ್ನಾಟಕ ಸರ್ಕಾರ", "documentId": "scheme-agri-seed-subsidy-kn", "contentHash": "187c56bb748fbbd0be597806f8f04d38e5f4ce75cd35c7485db899ba094bf92f", "totalChunks": 5, "documentTitle": "ರೈತ ಸಿರಿ — ಬಿತ್ತನೆ ಬೀಜ ಮತ್ತು ರಸಗೊಬ್ಬರ ಸಹಾಯಧನ", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.387665+00
8b9fb017-8c2e-47b5-b23d-9845c5ef1af0	agri-seed-subsidy	ರೈತ ಸಿರಿ — ಬಿತ್ತನೆ ಬೀಜ ಮತ್ತು ರಸಗೊಬ್ಬರ ಸಹಾಯಧನ	- Must be a permanent resident farmer in Karnataka. - Must possess cultivable agricultural land registered in FRUITS with valid FID. - Must cultivate notified food grains, oilseeds, pulses, or millets. - Bank account must be active and linked to Aadhaar (NPCI mapped).	https://fruits.karnataka.gov.in	{"page": 1, "section": "ಅರ್ಹತಾ ಮಾನದಂಡಗಳು", "language": "kn", "createdAt": "2026-11-10T15:54:08.354Z", "chunkIndex": 2, "department": "ಕೃಷಿ ಇಲಾಖೆ, ಕರ್ನಾಟಕ ಸರ್ಕಾರ", "documentId": "scheme-agri-seed-subsidy-kn", "contentHash": "26ab957a9f0814115b20798bfb2230ab11677c00cd09024b6d0b22776d60a463", "totalChunks": 5, "documentTitle": "ರೈತ ಸಿರಿ — ಬಿತ್ತನೆ ಬೀಜ ಮತ್ತು ರಸಗೊಬ್ಬರ ಸಹಾಯಧನ", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.391332+00
7eb1e04c-2290-46f2-8790-adc6199ea0c7	agri-seed-subsidy	ರೈತ ಸಿರಿ — ಬಿತ್ತನೆ ಬೀಜ ಮತ್ತು ರಸಗೊಬ್ಬರ ಸಹಾಯಧನ	- Aadhaar Card of the farmer - FRUITS ID (FID) Certificate - Land Ownership Record (RTC / Pahani) - Bank Passbook photocopy showing IFSC and Account Number	https://fruits.karnataka.gov.in	{"page": 1, "section": "ಅಗತ್ಯ ದಾಖಲೆಗಳು", "language": "kn", "createdAt": "2026-11-10T15:54:08.354Z", "chunkIndex": 3, "department": "ಕೃಷಿ ಇಲಾಖೆ, ಕರ್ನಾಟಕ ಸರ್ಕಾರ", "documentId": "scheme-agri-seed-subsidy-kn", "contentHash": "a7912440a748ddf29b41cacc64272d13f9a28b964e7152a1dd12d6332afa7743", "totalChunks": 5, "documentTitle": "ರೈತ ಸಿರಿ — ಬಿತ್ತನೆ ಬೀಜ ಮತ್ತು ರಸಗೊಬ್ಬರ ಸಹಾಯಧನ", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.394563+00
07e4077c-6974-4469-b318-961035520392	agri-seed-subsidy	ರೈತ ಸಿರಿ — ಬಿತ್ತನೆ ಬೀಜ ಮತ್ತು ರಸಗೊಬ್ಬರ ಸಹಾಯಧನ	- Fill and save your application draft in ArivuNet completely offline. - Obtain or verify your 12-digit FRUITS Farmer ID (FID) at the nearest Raitha Samparka Kendra (RSK). - Submit the verified draft details along with your RTC / Pahani record at your local RSK or Agriculture Assistant office before sowing season. - Upon biometric verification, collect subsidised certified seeds directly from the RSK distribution counter.	https://fruits.karnataka.gov.in	{"page": 1, "section": "ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ವಿಧಾನ ಮತ್ತು ಅಧಿಕೃತ ಸಂಪರ್ಕ", "language": "kn", "createdAt": "2026-11-10T15:54:08.354Z", "chunkIndex": 4, "department": "ಕೃಷಿ ಇಲಾಖೆ, ಕರ್ನಾಟಕ ಸರ್ಕಾರ", "documentId": "scheme-agri-seed-subsidy-kn", "contentHash": "94d49fac7b27fd99666d982aac9609b9c87142d1a63c30d401f9d8db0bdc6618", "totalChunks": 5, "documentTitle": "ರೈತ ಸಿರಿ — ಬಿತ್ತನೆ ಬೀಜ ಮತ್ತು ರಸಗೊಬ್ಬರ ಸಹಾಯಧನ", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.397376+00
9cb03960-dde7-42b6-89d0-51545cee18cc	old-age-pension	Senior Citizen Pension Scheme (Sandhya Suraksha)	Scheme Name: Senior Citizen Pension Scheme (Sandhya Suraksha) Department: Directorate of Social Security and Pensions, Revenue Dept. Category: citizen Official Portal: https://nadakacheri.karnataka.gov.in Department Helpline: Janaspandana 1902	https://nadakacheri.karnataka.gov.in	{"page": 1, "section": "Scheme: Senior Citizen Pension Scheme (Sandhya Suraksha)", "language": "en", "createdAt": "2026-11-10T15:54:08.355Z", "chunkIndex": 0, "department": "Directorate of Social Security and Pensions, Revenue Dept.", "documentId": "scheme-old-age-pension-en", "contentHash": "3241d892302db7056f4fba8e8685e3fd54b402c9b5e3ada97c07b7314101f5a4", "totalChunks": 6, "documentTitle": "Senior Citizen Pension Scheme (Sandhya Suraksha)", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.400083+00
8813ce61-026a-412f-9292-a45bdedf940f	old-age-pension	Senior Citizen Pension Scheme (Sandhya Suraksha)	Details unavailable.	https://nadakacheri.karnataka.gov.in	{"page": 1, "section": "Overview and Objectives", "language": "en", "createdAt": "2026-11-10T15:54:08.355Z", "chunkIndex": 1, "department": "Directorate of Social Security and Pensions, Revenue Dept.", "documentId": "scheme-old-age-pension-en", "contentHash": "51a8b139eb4d6663c26dc8b2d235e653c5b0345bd31bb67d32ddaae1a6645858", "totalChunks": 6, "documentTitle": "Senior Citizen Pension Scheme (Sandhya Suraksha)", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.403678+00
b90e3dbb-c88d-40ce-bb21-7fa8e7cc3c59	old-age-pension	Senior Citizen Pension Scheme (Sandhya Suraksha)	Direct monthly pension credit of ₹1,200 to beneficiary bank or postal account.	https://nadakacheri.karnataka.gov.in	{"page": 1, "section": "Benefits and Financial Assistance", "language": "en", "createdAt": "2026-11-10T15:54:08.355Z", "chunkIndex": 2, "department": "Directorate of Social Security and Pensions, Revenue Dept.", "documentId": "scheme-old-age-pension-en", "contentHash": "f6d1b439a9a7709ebd5502b7fa5b266987ee3901aefcfca279271c7c499b7efd", "totalChunks": 6, "documentTitle": "Senior Citizen Pension Scheme (Sandhya Suraksha)", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.407211+00
676bf1ed-d5cd-4d6c-b3e1-973a592ade98	ration-card-update	Priority Ration Card Services (Ahara / Food & Civil Supplies)	Guaranteed access to monthly Anna Bhagya food grain entitlement and subsidized essential commodities.	https://ahara.kar.nic.in	{"page": 1, "section": "Benefits and Financial Assistance", "language": "en", "createdAt": "2026-11-10T15:54:08.355Z", "chunkIndex": 2, "department": "Food, Civil Supplies and Consumer Affairs Department", "documentId": "scheme-ration-card-update-en", "contentHash": "e61faa65db7ae7e2b09fa49de62b363117f5bcce4e62bd9bb187be93e75a9f87", "totalChunks": 6, "documentTitle": "Priority Ration Card Services (Ahara / Food & Civil Supplies)", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.47225+00
91142d1b-62f0-4da9-b991-7fdc70b2ce23	old-age-pension	Senior Citizen Pension Scheme (Sandhya Suraksha)	- Age Proof (Voter ID, Aadhaar Card, or Birth Certificate) - Income Certificate issued by Tahsildar / Nadakacheri (RD Number) - Domicile / Residence Certificate (proof of 3 years stay in Karnataka) - Bank Account Passbook / Postal Savings Account details	https://nadakacheri.karnataka.gov.in	{"page": 1, "section": "Required Documents", "language": "en", "createdAt": "2026-11-10T15:54:08.355Z", "chunkIndex": 4, "department": "Directorate of Social Security and Pensions, Revenue Dept.", "documentId": "scheme-old-age-pension-en", "contentHash": "e795d922440dd467797ede13d05f598cab2e23fc97f675557ce3d3dd98fcebab", "totalChunks": 6, "documentTitle": "Senior Citizen Pension Scheme (Sandhya Suraksha)", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.414577+00
ec84f1c7-19c7-4dd8-a663-c7e4d1574985	old-age-pension	Senior Citizen Pension Scheme (Sandhya Suraksha)	- Fill personal and income details into the offline draft on your device. - Obtain an annual Income Certificate (RD Number) from Nadakacheri or Atalji Janasnehi Kendra showing family income under ₹32,000. - Submit the application at your local Nadakacheri, Bangalore One, or Grama One centre with age and residence proof. - Revenue Inspector conducts local verification within 21 working days under Sakala standards.	https://nadakacheri.karnataka.gov.in	{"page": 1, "section": "Application Procedure and Official Portals", "language": "en", "createdAt": "2026-11-10T15:54:08.355Z", "chunkIndex": 5, "department": "Directorate of Social Security and Pensions, Revenue Dept.", "documentId": "scheme-old-age-pension-en", "contentHash": "3066c2a2f9fb1ba007033a2e369d338f224cc245363c7f3ac8690212619b669c", "totalChunks": 6, "documentTitle": "Senior Citizen Pension Scheme (Sandhya Suraksha)", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.417502+00
208a3d43-e945-4391-bafc-23001cc96d2d	old-age-pension	ಸಂಧ್ಯಾ ಸುರಕ್ಷಾ — ಹಿರಿಯ ನಾಗರಿಕರ ಮಾಸಾಶನ ಯೋಜನೆ	ಯೋಜನೆಯ ಹೆಸರು: ಸಂಧ್ಯಾ ಸುರಕ್ಷಾ — ಹಿರಿಯ ನಾಗರಿಕರ ಮಾಸಾಶನ ಯೋಜನೆ ಇಲಾಖೆ: ಕಂದಾಯ ಇಲಾಖೆ — ಸಾಮಾಜಿಕ ಭದ್ರತೆ ಮತ್ತು ಪಿಂಚಣಿಗಳ ನಿರ್ದೇಶನಾಲಯ ವರ್ಗ: citizen ಅಧಿಕೃತ ಪೋರ್ಟಲ್: https://nadakacheri.karnataka.gov.in ಸಹಾಯವಾಣಿ: ಜನಸ್ಪಂದನ 1902	https://nadakacheri.karnataka.gov.in	{"page": 1, "section": "ಯೋಜನೆ: ಸಂಧ್ಯಾ ಸುರಕ್ಷಾ — ಹಿರಿಯ ನಾಗರಿಕರ ಮಾಸಾಶನ ಯೋಜನೆ", "language": "kn", "createdAt": "2026-11-10T15:54:08.355Z", "chunkIndex": 0, "department": "ಕಂದಾಯ ಇಲಾಖೆ — ಸಾಮಾಜಿಕ ಭದ್ರತೆ ಮತ್ತು ಪಿಂಚಣಿಗಳ ನಿರ್ದೇಶನಾಲಯ", "documentId": "scheme-old-age-pension-kn", "contentHash": "2de6c665a811fe179b8127168a15dd37ee3e30b7cd8e86688004a6780b2966c4", "totalChunks": 5, "documentTitle": "ಸಂಧ್ಯಾ ಸುರಕ್ಷಾ — ಹಿರಿಯ ನಾಗರಿಕರ ಮಾಸಾಶನ ಯೋಜನೆ", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.420705+00
2e4b9d24-0b41-4835-abf8-c43af250fe00	old-age-pension	ಸಂಧ್ಯಾ ಸುರಕ್ಷಾ — ಹಿರಿಯ ನಾಗರಿಕರ ಮಾಸಾಶನ ಯೋಜನೆ	ಫಲಾನುಭವಿಯ ಬ್ಯಾಂಕ್ ಅಥವಾ ಅಂಚೆ ಖಾತೆಗೆ ಪ್ರತಿ ತಿಂಗಳು ₹1,200 ನೇರ ಜಮೆ.	https://nadakacheri.karnataka.gov.in	{"page": 1, "section": "ಸೌಲಭ್ಯಗಳು ಮತ್ತು ಆರ್ಥಿಕ ನೆರವು", "language": "kn", "createdAt": "2026-11-10T15:54:08.355Z", "chunkIndex": 1, "department": "ಕಂದಾಯ ಇಲಾಖೆ — ಸಾಮಾಜಿಕ ಭದ್ರತೆ ಮತ್ತು ಪಿಂಚಣಿಗಳ ನಿರ್ದೇಶನಾಲಯ", "documentId": "scheme-old-age-pension-kn", "contentHash": "aeec85a01ddacb7e0b51df4b4b5e15dd8e776c2efbc6f91bfe930e50f928927f", "totalChunks": 5, "documentTitle": "ಸಂಧ್ಯಾ ಸುರಕ್ಷಾ — ಹಿರಿಯ ನಾಗರಿಕರ ಮಾಸಾಶನ ಯೋಜನೆ", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.423907+00
a20e963a-7ae9-4330-a013-24f19905d15d	old-age-pension	ಸಂಧ್ಯಾ ಸುರಕ್ಷಾ — ಹಿರಿಯ ನಾಗರಿಕರ ಮಾಸಾಶನ ಯೋಜನೆ	- Applicant must be 65 years of age or older. - Must be a resident of Karnataka for at least 3 consecutive years. - Combined annual income of applicant and spouse must be below ₹32,000 (rural) or ₹40,000 (urban). - Applicant must not be receiving any other government, freedom fighter, or EPF pension.	https://nadakacheri.karnataka.gov.in	{"page": 1, "section": "ಅರ್ಹತಾ ಮಾನದಂಡಗಳು", "language": "kn", "createdAt": "2026-11-10T15:54:08.355Z", "chunkIndex": 2, "department": "ಕಂದಾಯ ಇಲಾಖೆ — ಸಾಮಾಜಿಕ ಭದ್ರತೆ ಮತ್ತು ಪಿಂಚಣಿಗಳ ನಿರ್ದೇಶನಾಲಯ", "documentId": "scheme-old-age-pension-kn", "contentHash": "0e6a81372ad1112d8a0c9a6ab18e13baf7dad712559be91b7559500737f9cde0", "totalChunks": 5, "documentTitle": "ಸಂಧ್ಯಾ ಸುರಕ್ಷಾ — ಹಿರಿಯ ನಾಗರಿಕರ ಮಾಸಾಶನ ಯೋಜನೆ", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.427029+00
574310be-a5e6-49d7-b99f-f3e6b087c816	old-age-pension	ಸಂಧ್ಯಾ ಸುರಕ್ಷಾ — ಹಿರಿಯ ನಾಗರಿಕರ ಮಾಸಾಶನ ಯೋಜನೆ	- Age Proof (Voter ID, Aadhaar Card, or Birth Certificate) - Income Certificate issued by Tahsildar / Nadakacheri (RD Number) - Domicile / Residence Certificate (proof of 3 years stay in Karnataka) - Bank Account Passbook / Postal Savings Account details	https://nadakacheri.karnataka.gov.in	{"page": 1, "section": "ಅಗತ್ಯ ದಾಖಲೆಗಳು", "language": "kn", "createdAt": "2026-11-10T15:54:08.355Z", "chunkIndex": 3, "department": "ಕಂದಾಯ ಇಲಾಖೆ — ಸಾಮಾಜಿಕ ಭದ್ರತೆ ಮತ್ತು ಪಿಂಚಣಿಗಳ ನಿರ್ದೇಶನಾಲಯ", "documentId": "scheme-old-age-pension-kn", "contentHash": "38e1c0cd7dce634d781f8da507cf3c3b22e306cf75aefd4016477fb27a306b94", "totalChunks": 5, "documentTitle": "ಸಂಧ್ಯಾ ಸುರಕ್ಷಾ — ಹಿರಿಯ ನಾಗರಿಕರ ಮಾಸಾಶನ ಯೋಜನೆ", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.429584+00
6f3ee2d2-37ad-4c2c-b170-77659f9ed0c3	ration-card-update	Priority Ration Card Services (Ahara / Food & Civil Supplies)	- Existing Ration Card Number - Aadhaar Card of Head of Family (Female Head of Household) - Aadhaar Card of member being added or corrected - Birth Certificate (if adding newborn) or Marriage Certificate (if adding spouse) - Electricity Bill / Gram Panchayat Tax Receipt (if updating address)	https://ahara.kar.nic.in	{"page": 1, "section": "Required Documents", "language": "en", "createdAt": "2026-11-10T15:54:08.355Z", "chunkIndex": 4, "department": "Food, Civil Supplies and Consumer Affairs Department", "documentId": "scheme-ration-card-update-en", "contentHash": "4970a5121e670f7b88a334f58797118335d4b6820e678a349a4eebc0c14faa6c", "totalChunks": 6, "documentTitle": "Priority Ration Card Services (Ahara / Food & Civil Supplies)", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.477304+00
3f059db5-e6d6-46a0-b893-a6f265f7e1cb	old-age-pension	ಸಂಧ್ಯಾ ಸುರಕ್ಷಾ — ಹಿರಿಯ ನಾಗರಿಕರ ಮಾಸಾಶನ ಯೋಜನೆ	- Fill personal and income details into the offline draft on your device. - Obtain an annual Income Certificate (RD Number) from Nadakacheri or Atalji Janasnehi Kendra showing family income under ₹32,000. - Submit the application at your local Nadakacheri, Bangalore One, or Grama One centre with age and residence proof. - Revenue Inspector conducts local verification within 21 working days under Sakala standards.	https://nadakacheri.karnataka.gov.in	{"page": 1, "section": "ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ವಿಧಾನ ಮತ್ತು ಅಧಿಕೃತ ಸಂಪರ್ಕ", "language": "kn", "createdAt": "2026-11-10T15:54:08.355Z", "chunkIndex": 4, "department": "ಕಂದಾಯ ಇಲಾಖೆ — ಸಾಮಾಜಿಕ ಭದ್ರತೆ ಮತ್ತು ಪಿಂಚಣಿಗಳ ನಿರ್ದೇಶನಾಲಯ", "documentId": "scheme-old-age-pension-kn", "contentHash": "052bb68bccfa5d13ad260744a5ec8c364957c924a71a6b006bfa840dbc19df83", "totalChunks": 5, "documentTitle": "ಸಂಧ್ಯಾ ಸುರಕ್ಷಾ — ಹಿರಿಯ ನಾಗರಿಕರ ಮಾಸಾಶನ ಯೋಜನೆ", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.432265+00
7eea88ad-ad2e-4c13-976c-8b1fd02449fc	rural-housing-assist	Rural Pucca Housing Grant (Basava Vasathi Yojana)	Scheme Name: Rural Pucca Housing Grant (Basava Vasathi Yojana) Department: Rajiv Gandhi Housing Corporation Limited (RGHCL) Category: housing Official Portal: https://ashraya.karnataka.gov.in Department Helpline: Janaspandana 1902	https://ashraya.karnataka.gov.in	{"page": 1, "section": "Scheme: Rural Pucca Housing Grant (Basava Vasathi Yojana)", "language": "en", "createdAt": "2026-11-10T15:54:08.355Z", "chunkIndex": 0, "department": "Rajiv Gandhi Housing Corporation Limited (RGHCL)", "documentId": "scheme-rural-housing-assist-en", "contentHash": "420e4dc0e69160eaa9da059e8bce9d55e3fa2739073e0c131d0d1b45b3fa7ae4", "totalChunks": 6, "documentTitle": "Rural Pucca Housing Grant (Basava Vasathi Yojana)", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.434955+00
6656a865-8ea8-4e01-bd0d-69cf61c880c5	rural-housing-assist	Rural Pucca Housing Grant (Basava Vasathi Yojana)	Details unavailable.	https://ashraya.karnataka.gov.in	{"page": 1, "section": "Overview and Objectives", "language": "en", "createdAt": "2026-11-10T15:54:08.355Z", "chunkIndex": 1, "department": "Rajiv Gandhi Housing Corporation Limited (RGHCL)", "documentId": "scheme-rural-housing-assist-en", "contentHash": "ae8cd94e8dd0b31d35eb35bb327a589de89bf4dedfc169f17a23c9bf5615b625", "totalChunks": 6, "documentTitle": "Rural Pucca Housing Grant (Basava Vasathi Yojana)", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.438882+00
35fad636-1248-4706-931c-1f48f0221a86	rural-housing-assist	Rural Pucca Housing Grant (Basava Vasathi Yojana)	Direct benefit subsidy of ₹1,200,000 released in 4 geo-tagged construction stages.	https://ashraya.karnataka.gov.in	{"page": 1, "section": "Benefits and Financial Assistance", "language": "en", "createdAt": "2026-11-10T15:54:08.355Z", "chunkIndex": 2, "department": "Rajiv Gandhi Housing Corporation Limited (RGHCL)", "documentId": "scheme-rural-housing-assist-en", "contentHash": "93b34faab12397f80e82c19e2032cf6f594ec45984040183232ba833938ec331", "totalChunks": 6, "documentTitle": "Rural Pucca Housing Grant (Basava Vasathi Yojana)", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.442822+00
253573e5-b716-4922-b3ef-48f70d655265	rural-housing-assist	Rural Pucca Housing Grant (Basava Vasathi Yojana)	- Applicant must be a permanent resident of a rural Gram Panchayat in Karnataka. - Family must hold an active BPL Ration Card. - Must own a residential site / plot sanctioned by Gram Panchayat or ancestral land. - Must not own any pucca residential house anywhere in India. - Annual household income must be below ₹32,000.	https://ashraya.karnataka.gov.in	{"page": 1, "section": "Eligibility Criteria", "language": "en", "createdAt": "2026-11-10T15:54:08.355Z", "chunkIndex": 3, "department": "Rajiv Gandhi Housing Corporation Limited (RGHCL)", "documentId": "scheme-rural-housing-assist-en", "contentHash": "cf745f91dd8865aec8d9d5a40a2adeec423428bcd501e4b93caf5071bd58f069", "totalChunks": 6, "documentTitle": "Rural Pucca Housing Grant (Basava Vasathi Yojana)", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.445312+00
1044d440-0ab1-4d1f-946a-19391edf1418	rural-housing-assist	Rural Pucca Housing Grant (Basava Vasathi Yojana)	- BPL Ration Card - Aadhaar Cards of all adult family members - Plot Ownership Document / Hakku Patra / GP Form 9 & 11 - Income Certificate issued by Revenue Authority - Photograph of existing katcha house or vacant site	https://ashraya.karnataka.gov.in	{"page": 1, "section": "Required Documents", "language": "en", "createdAt": "2026-11-10T15:54:08.355Z", "chunkIndex": 4, "department": "Rajiv Gandhi Housing Corporation Limited (RGHCL)", "documentId": "scheme-rural-housing-assist-en", "contentHash": "1c488042a08d5bdfd6cfa427a3ac6baccc4915e8e4ff8f88f8f20c9a63c12f71", "totalChunks": 6, "documentTitle": "Rural Pucca Housing Grant (Basava Vasathi Yojana)", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.447935+00
4cacb864-9db0-4d16-8b7d-65b68989af6a	rural-housing-assist	Rural Pucca Housing Grant (Basava Vasathi Yojana)	- Prepare site and household draft details in ArivuNet. - Ensure your name is included in the Gram Panchayat beneficiary waiting list (Ashraya list). - Submit your application with GP Hakku Patra and BPL card to the Panchayat Development Officer (PDO). - Gram Sabha approves beneficiary selection, followed by geo-tagging of the vacant site before stage-wise grant release.	https://ashraya.karnataka.gov.in	{"page": 1, "section": "Application Procedure and Official Portals", "language": "en", "createdAt": "2026-11-10T15:54:08.355Z", "chunkIndex": 5, "department": "Rajiv Gandhi Housing Corporation Limited (RGHCL)", "documentId": "scheme-rural-housing-assist-en", "contentHash": "d49c9736034c411c82657b59e8e7938c52beafcc3daf306dbb4fb7e13bb79521", "totalChunks": 6, "documentTitle": "Rural Pucca Housing Grant (Basava Vasathi Yojana)", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.450605+00
2878c03b-3b98-4040-9b46-e933e5c729e4	ration-card-update	Priority Ration Card Services (Ahara / Food & Civil Supplies)	- Applicant must already hold a valid Karnataka Ration Card number in Ahara database. - For adding child: Birth certificate with parents’ names matching ration card. - For adding spouse: Marriage certificate and NOC/deletion certificate from previous ration card. - All members must have individual biometric Aadhaar numbers.	https://ahara.kar.nic.in	{"page": 1, "section": "Eligibility Criteria", "language": "en", "createdAt": "2026-11-10T15:54:08.355Z", "chunkIndex": 3, "department": "Food, Civil Supplies and Consumer Affairs Department", "documentId": "scheme-ration-card-update-en", "contentHash": "c9023b4340259d4ffd8a098ad1fbf1ce97ceb0b2e42541d3c8f141508c3c297b", "totalChunks": 6, "documentTitle": "Priority Ration Card Services (Ahara / Food & Civil Supplies)", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.474899+00
a7c41b4a-65f0-4022-b9d9-fcddcc652da7	rural-housing-assist	ಬಸವ ವಸತಿ ಯೋಜನೆ — ಗ್ರಾಮೀಣ ಪಕ್ಕಾ ಮನೆ ನಿರ್ಮಾಣ ಅನುದಾನ	ಯೋಜನೆಯ ಹೆಸರು: ಬಸವ ವಸತಿ ಯೋಜನೆ — ಗ್ರಾಮೀಣ ಪಕ್ಕಾ ಮನೆ ನಿರ್ಮಾಣ ಅನುದಾನ ಇಲಾಖೆ: ರಾಜೀವ್ ಗಾಂಧಿ ವಸತಿ ನಿಗಮ (RGHCL), ವಸತಿ ಇಲಾಖೆ ವರ್ಗ: housing ಅಧಿಕೃತ ಪೋರ್ಟಲ್: https://ashraya.karnataka.gov.in ಸಹಾಯವಾಣಿ: ಜನಸ್ಪಂದನ 1902	https://ashraya.karnataka.gov.in	{"page": 1, "section": "ಯೋಜನೆ: ಬಸವ ವಸತಿ ಯೋಜನೆ — ಗ್ರಾಮೀಣ ಪಕ್ಕಾ ಮನೆ ನಿರ್ಮಾಣ ಅನುದಾನ", "language": "kn", "createdAt": "2026-11-10T15:54:08.355Z", "chunkIndex": 0, "department": "ರಾಜೀವ್ ಗಾಂಧಿ ವಸತಿ ನಿಗಮ (RGHCL), ವಸತಿ ಇಲಾಖೆ", "documentId": "scheme-rural-housing-assist-kn", "contentHash": "73aedc042d6298f7d8ed097f9f2c797c7b01147fe29b5a0636d96d883aef6840", "totalChunks": 5, "documentTitle": "ಬಸವ ವಸತಿ ಯೋಜನೆ — ಗ್ರಾಮೀಣ ಪಕ್ಕಾ ಮನೆ ನಿರ್ಮಾಣ ಅನುದಾನ", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.452978+00
98c78136-11d5-41b5-be39-5d717d671242	rural-housing-assist	ಬಸವ ವಸತಿ ಯೋಜನೆ — ಗ್ರಾಮೀಣ ಪಕ್ಕಾ ಮನೆ ನಿರ್ಮಾಣ ಅನುದಾನ	ಜಿಪಿಎಸ್ ಜಿಯೋ-ಟ್ಯಾಗ್ ಆಧಾರಿತ 4 ಹಂತಗಳಲ್ಲಿ ₹1.20 ಲಕ್ಷ ಅನುದಾನ ಫಲಾನುಭವಿಯ ಖಾತೆಗೆ ನೇರ ಜಮೆ.	https://ashraya.karnataka.gov.in	{"page": 1, "section": "ಸೌಲಭ್ಯಗಳು ಮತ್ತು ಆರ್ಥಿಕ ನೆರವು", "language": "kn", "createdAt": "2026-11-10T15:54:08.355Z", "chunkIndex": 1, "department": "ರಾಜೀವ್ ಗಾಂಧಿ ವಸತಿ ನಿಗಮ (RGHCL), ವಸತಿ ಇಲಾಖೆ", "documentId": "scheme-rural-housing-assist-kn", "contentHash": "dd02dbc3ad9baddb7ec52508a44d4a8e1ce7527d0d9ef1cf688b3bade1963054", "totalChunks": 5, "documentTitle": "ಬಸವ ವಸತಿ ಯೋಜನೆ — ಗ್ರಾಮೀಣ ಪಕ್ಕಾ ಮನೆ ನಿರ್ಮಾಣ ಅನುದಾನ", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.456409+00
63610bb7-4e0c-402c-8bfa-ffbded6e2368	rural-housing-assist	ಬಸವ ವಸತಿ ಯೋಜನೆ — ಗ್ರಾಮೀಣ ಪಕ್ಕಾ ಮನೆ ನಿರ್ಮಾಣ ಅನುದಾನ	- Applicant must be a permanent resident of a rural Gram Panchayat in Karnataka. - Family must hold an active BPL Ration Card. - Must own a residential site / plot sanctioned by Gram Panchayat or ancestral land. - Must not own any pucca residential house anywhere in India. - Annual household income must be below ₹32,000.	https://ashraya.karnataka.gov.in	{"page": 1, "section": "ಅರ್ಹತಾ ಮಾನದಂಡಗಳು", "language": "kn", "createdAt": "2026-11-10T15:54:08.355Z", "chunkIndex": 2, "department": "ರಾಜೀವ್ ಗಾಂಧಿ ವಸತಿ ನಿಗಮ (RGHCL), ವಸತಿ ಇಲಾಖೆ", "documentId": "scheme-rural-housing-assist-kn", "contentHash": "31677489842a15736b4f964c33d8059c87c2e84d21e351fd3bb26195a7f82f19", "totalChunks": 5, "documentTitle": "ಬಸವ ವಸತಿ ಯೋಜನೆ — ಗ್ರಾಮೀಣ ಪಕ್ಕಾ ಮನೆ ನಿರ್ಮಾಣ ಅನುದಾನ", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.459093+00
e052ffaf-80bc-43f1-bdad-739697c8b64b	rural-housing-assist	ಬಸವ ವಸತಿ ಯೋಜನೆ — ಗ್ರಾಮೀಣ ಪಕ್ಕಾ ಮನೆ ನಿರ್ಮಾಣ ಅನುದಾನ	- BPL Ration Card - Aadhaar Cards of all adult family members - Plot Ownership Document / Hakku Patra / GP Form 9 & 11 - Income Certificate issued by Revenue Authority - Photograph of existing katcha house or vacant site	https://ashraya.karnataka.gov.in	{"page": 1, "section": "ಅಗತ್ಯ ದಾಖಲೆಗಳು", "language": "kn", "createdAt": "2026-11-10T15:54:08.355Z", "chunkIndex": 3, "department": "ರಾಜೀವ್ ಗಾಂಧಿ ವಸತಿ ನಿಗಮ (RGHCL), ವಸತಿ ಇಲಾಖೆ", "documentId": "scheme-rural-housing-assist-kn", "contentHash": "a9c3b24bbb94339eef99316ef8f6aa132f63bc1c23e60129eead2de54496ebe6", "totalChunks": 5, "documentTitle": "ಬಸವ ವಸತಿ ಯೋಜನೆ — ಗ್ರಾಮೀಣ ಪಕ್ಕಾ ಮನೆ ನಿರ್ಮಾಣ ಅನುದಾನ", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.461575+00
bf982c3e-7e49-40b3-a73f-6565d428c704	rural-housing-assist	ಬಸವ ವಸತಿ ಯೋಜನೆ — ಗ್ರಾಮೀಣ ಪಕ್ಕಾ ಮನೆ ನಿರ್ಮಾಣ ಅನುದಾನ	- Prepare site and household draft details in ArivuNet. - Ensure your name is included in the Gram Panchayat beneficiary waiting list (Ashraya list). - Submit your application with GP Hakku Patra and BPL card to the Panchayat Development Officer (PDO). - Gram Sabha approves beneficiary selection, followed by geo-tagging of the vacant site before stage-wise grant release.	https://ashraya.karnataka.gov.in	{"page": 1, "section": "ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ವಿಧಾನ ಮತ್ತು ಅಧಿಕೃತ ಸಂಪರ್ಕ", "language": "kn", "createdAt": "2026-11-10T15:54:08.355Z", "chunkIndex": 4, "department": "ರಾಜೀವ್ ಗಾಂಧಿ ವಸತಿ ನಿಗಮ (RGHCL), ವಸತಿ ಇಲಾಖೆ", "documentId": "scheme-rural-housing-assist-kn", "contentHash": "4d3762d6949fe6329908c3971865f25c7232399462bc8e4586c01ff2848eae88", "totalChunks": 5, "documentTitle": "ಬಸವ ವಸತಿ ಯೋಜನೆ — ಗ್ರಾಮೀಣ ಪಕ್ಕಾ ಮನೆ ನಿರ್ಮಾಣ ಅನುದಾನ", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.464226+00
0858e903-ce4a-461e-b4a5-dc35f8b5bdf3	ration-card-update	Priority Ration Card Services (Ahara / Food & Civil Supplies)	Scheme Name: Priority Ration Card Services (Ahara / Food & Civil Supplies) Department: Food, Civil Supplies and Consumer Affairs Department Category: food Official Portal: https://ahara.kar.nic.in Department Helpline: Janaspandana 1902	https://ahara.kar.nic.in	{"page": 1, "section": "Scheme: Priority Ration Card Services (Ahara / Food & Civil Supplies)", "language": "en", "createdAt": "2026-11-10T15:54:08.355Z", "chunkIndex": 0, "department": "Food, Civil Supplies and Consumer Affairs Department", "documentId": "scheme-ration-card-update-en", "contentHash": "f250bf2cea61dec500e55eb8d9032f89c7ae217642c58af7aebc1964e911fc37", "totalChunks": 6, "documentTitle": "Priority Ration Card Services (Ahara / Food & Civil Supplies)", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.466723+00
bd0eac68-4de1-44e7-bad8-3415b29ef1e7	ration-card-update	Priority Ration Card Services (Ahara / Food & Civil Supplies)	Details unavailable.	https://ahara.kar.nic.in	{"page": 1, "section": "Overview and Objectives", "language": "en", "createdAt": "2026-11-10T15:54:08.355Z", "chunkIndex": 1, "department": "Food, Civil Supplies and Consumer Affairs Department", "documentId": "scheme-ration-card-update-en", "contentHash": "e02e1f9a424ad9cfb87bbc467835d5453dae561ba57c2d710112a0b4aae75c0e", "totalChunks": 6, "documentTitle": "Priority Ration Card Services (Ahara / Food & Civil Supplies)", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.469109+00
b780b218-0bd7-4b26-b5bc-1391691db7c6	ration-card-update	Priority Ration Card Services (Ahara / Food & Civil Supplies)	- Fill required modification information into the offline ArivuNet form. - For child addition, obtain digital birth certificate. For spouse, obtain marriage certificate and name deletion certificate from previous card. - Submit via Ahara online portal or at Grama One / Karnataka One / Bangalore One service counter. - Food Inspector approves modification after verifying Aadhaar biometric deduplication in Ahara database.	https://ahara.kar.nic.in	{"page": 1, "section": "Application Procedure and Official Portals", "language": "en", "createdAt": "2026-11-10T15:54:08.355Z", "chunkIndex": 5, "department": "Food, Civil Supplies and Consumer Affairs Department", "documentId": "scheme-ration-card-update-en", "contentHash": "f34ca28b28d182bd8447c1fdf9b0b3b01d97cb0113104b5f4661f0a4ec55f670", "totalChunks": 6, "documentTitle": "Priority Ration Card Services (Ahara / Food & Civil Supplies)", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.479915+00
96435ef1-d295-4752-b550-2ce136ef1857	ration-card-update	ಆಹಾರ ಇಲಾಖೆ — ಪಡಿತರ ಚೀಟಿ ತಿದ್ದುಪಡಿ ಮತ್ತು ಹೊಸ ಸದಸ್ಯರ ಸೇರ್ಪಡೆ	ಯೋಜನೆಯ ಹೆಸರು: ಆಹಾರ ಇಲಾಖೆ — ಪಡಿತರ ಚೀಟಿ ತಿದ್ದುಪಡಿ ಮತ್ತು ಹೊಸ ಸದಸ್ಯರ ಸೇರ್ಪಡೆ ಇಲಾಖೆ: ಆಹಾರ, ನಾಗರಿಕ ಸರಬರಾಜು ಮತ್ತು ಗ್ರಾಹಕರ ವ್ಯವಹಾರಗಳ ಇಲಾಖೆ ವರ್ಗ: food ಅಧಿಕೃತ ಪೋರ್ಟಲ್: https://ahara.kar.nic.in ಸಹಾಯವಾಣಿ: ಜನಸ್ಪಂದನ 1902	https://ahara.kar.nic.in	{"page": 1, "section": "ಯೋಜನೆ: ಆಹಾರ ಇಲಾಖೆ — ಪಡಿತರ ಚೀಟಿ ತಿದ್ದುಪಡಿ ಮತ್ತು ಹೊಸ ಸದಸ್ಯರ ಸೇರ್ಪಡೆ", "language": "kn", "createdAt": "2026-11-10T15:54:08.355Z", "chunkIndex": 0, "department": "ಆಹಾರ, ನಾಗರಿಕ ಸರಬರಾಜು ಮತ್ತು ಗ್ರಾಹಕರ ವ್ಯವಹಾರಗಳ ಇಲಾಖೆ", "documentId": "scheme-ration-card-update-kn", "contentHash": "d3182d46b5ed7b2ec0b19ae93e2b55e86b85d707dcd1904e6c244d84528a8601", "totalChunks": 5, "documentTitle": "ಆಹಾರ ಇಲಾಖೆ — ಪಡಿತರ ಚೀಟಿ ತಿದ್ದುಪಡಿ ಮತ್ತು ಹೊಸ ಸದಸ್ಯರ ಸೇರ್ಪಡೆ", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.483101+00
ae07a24c-ec1b-4283-90b9-90a927139fb2	ration-card-update	ಆಹಾರ ಇಲಾಖೆ — ಪಡಿತರ ಚೀಟಿ ತಿದ್ದುಪಡಿ ಮತ್ತು ಹೊಸ ಸದಸ್ಯರ ಸೇರ್ಪಡೆ	ಅನ್ನಭಾಗ್ಯ ಯೋಜನೆಯಡಿ ಮಾಸಿಕ ಉಚಿತ ಆಹಾರ ಧಾನ್ಯ ವಿತರಣೆಗೆ ನಿಖರ ಕುಟುಂಬ ಸದಸ್ಯರ ಪಟ್ಟಿ ಖಾತರಿ.	https://ahara.kar.nic.in	{"page": 1, "section": "ಸೌಲಭ್ಯಗಳು ಮತ್ತು ಆರ್ಥಿಕ ನೆರವು", "language": "kn", "createdAt": "2026-11-10T15:54:08.355Z", "chunkIndex": 1, "department": "ಆಹಾರ, ನಾಗರಿಕ ಸರಬರಾಜು ಮತ್ತು ಗ್ರಾಹಕರ ವ್ಯವಹಾರಗಳ ಇಲಾಖೆ", "documentId": "scheme-ration-card-update-kn", "contentHash": "83a3c4bcbd27aef6715cc730d703b84c3c75decb9a8e3dcf49b67e238cf869e0", "totalChunks": 5, "documentTitle": "ಆಹಾರ ಇಲಾಖೆ — ಪಡಿತರ ಚೀಟಿ ತಿದ್ದುಪಡಿ ಮತ್ತು ಹೊಸ ಸದಸ್ಯರ ಸೇರ್ಪಡೆ", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.485788+00
d42bafa7-90d4-4834-b1d6-86fb8975d694	ration-card-update	ಆಹಾರ ಇಲಾಖೆ — ಪಡಿತರ ಚೀಟಿ ತಿದ್ದುಪಡಿ ಮತ್ತು ಹೊಸ ಸದಸ್ಯರ ಸೇರ್ಪಡೆ	- Applicant must already hold a valid Karnataka Ration Card number in Ahara database. - For adding child: Birth certificate with parents’ names matching ration card. - For adding spouse: Marriage certificate and NOC/deletion certificate from previous ration card. - All members must have individual biometric Aadhaar numbers.	https://ahara.kar.nic.in	{"page": 1, "section": "ಅರ್ಹತಾ ಮಾನದಂಡಗಳು", "language": "kn", "createdAt": "2026-11-10T15:54:08.355Z", "chunkIndex": 2, "department": "ಆಹಾರ, ನಾಗರಿಕ ಸರಬರಾಜು ಮತ್ತು ಗ್ರಾಹಕರ ವ್ಯವಹಾರಗಳ ಇಲಾಖೆ", "documentId": "scheme-ration-card-update-kn", "contentHash": "91424fcdbfcc79ca83a053e9c504eac85b18c85848c61bf2c5f878a320451bdb", "totalChunks": 5, "documentTitle": "ಆಹಾರ ಇಲಾಖೆ — ಪಡಿತರ ಚೀಟಿ ತಿದ್ದುಪಡಿ ಮತ್ತು ಹೊಸ ಸದಸ್ಯರ ಸೇರ್ಪಡೆ", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.48891+00
8f94385b-f6d0-4901-af3d-5e2983247ecb	ration-card-update	ಆಹಾರ ಇಲಾಖೆ — ಪಡಿತರ ಚೀಟಿ ತಿದ್ದುಪಡಿ ಮತ್ತು ಹೊಸ ಸದಸ್ಯರ ಸೇರ್ಪಡೆ	- Existing Ration Card Number - Aadhaar Card of Head of Family (Female Head of Household) - Aadhaar Card of member being added or corrected - Birth Certificate (if adding newborn) or Marriage Certificate (if adding spouse) - Electricity Bill / Gram Panchayat Tax Receipt (if updating address)	https://ahara.kar.nic.in	{"page": 1, "section": "ಅಗತ್ಯ ದಾಖಲೆಗಳು", "language": "kn", "createdAt": "2026-11-10T15:54:08.355Z", "chunkIndex": 3, "department": "ಆಹಾರ, ನಾಗರಿಕ ಸರಬರಾಜು ಮತ್ತು ಗ್ರಾಹಕರ ವ್ಯವಹಾರಗಳ ಇಲಾಖೆ", "documentId": "scheme-ration-card-update-kn", "contentHash": "ce3210b576016097a16afea43700dde51dc1545cd942877baf270970e21ee775", "totalChunks": 5, "documentTitle": "ಆಹಾರ ಇಲಾಖೆ — ಪಡಿತರ ಚೀಟಿ ತಿದ್ದುಪಡಿ ಮತ್ತು ಹೊಸ ಸದಸ್ಯರ ಸೇರ್ಪಡೆ", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.491579+00
e15e68d2-4f1c-4077-8351-f70426f758e9	ration-card-update	ಆಹಾರ ಇಲಾಖೆ — ಪಡಿತರ ಚೀಟಿ ತಿದ್ದುಪಡಿ ಮತ್ತು ಹೊಸ ಸದಸ್ಯರ ಸೇರ್ಪಡೆ	- Fill required modification information into the offline ArivuNet form. - For child addition, obtain digital birth certificate. For spouse, obtain marriage certificate and name deletion certificate from previous card. - Submit via Ahara online portal or at Grama One / Karnataka One / Bangalore One service counter. - Food Inspector approves modification after verifying Aadhaar biometric deduplication in Ahara database.	https://ahara.kar.nic.in	{"page": 1, "section": "ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ವಿಧಾನ ಮತ್ತು ಅಧಿಕೃತ ಸಂಪರ್ಕ", "language": "kn", "createdAt": "2026-11-10T15:54:08.355Z", "chunkIndex": 4, "department": "ಆಹಾರ, ನಾಗರಿಕ ಸರಬರಾಜು ಮತ್ತು ಗ್ರಾಹಕರ ವ್ಯವಹಾರಗಳ ಇಲಾಖೆ", "documentId": "scheme-ration-card-update-kn", "contentHash": "adcbd1ab7e58fd63e4d0fc70a9983974381b8d46bade019f82ace6071565f873", "totalChunks": 5, "documentTitle": "ಆಹಾರ ಇಲಾಖೆ — ಪಡಿತರ ಚೀಟಿ ತಿದ್ದುಪಡಿ ಮತ್ತು ಹೊಸ ಸದಸ್ಯರ ಸೇರ್ಪಡೆ", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.493839+00
207fd732-b288-4642-8907-e877a7acec54	gruha-lakshmi	Gruha Lakshmi Scheme (₹2,000 Monthly DBT)	Scheme Name: Gruha Lakshmi Scheme (₹2,000 Monthly DBT) Department: Department of Women and Child Development Category: citizen Official Portal: https://sevasindhugs.karnataka.gov.in Department Helpline: Janaspandana 1902	https://sevasindhugs.karnataka.gov.in	{"page": 1, "section": "Scheme: Gruha Lakshmi Scheme (₹2,000 Monthly DBT)", "language": "en", "createdAt": "2026-11-10T15:54:08.355Z", "chunkIndex": 0, "department": "Department of Women and Child Development", "documentId": "scheme-gruha-lakshmi-en", "contentHash": "cc399aa25a8b484a83a9220e7858af88c65f2ea033df78e45c562a564f918119", "totalChunks": 6, "documentTitle": "Gruha Lakshmi Scheme (₹2,000 Monthly DBT)", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.496321+00
c81d25d6-b103-428f-b751-9b85ef175b50	gruha-lakshmi	Gruha Lakshmi Scheme (₹2,000 Monthly DBT)	Details unavailable.	https://sevasindhugs.karnataka.gov.in	{"page": 1, "section": "Overview and Objectives", "language": "en", "createdAt": "2026-11-10T15:54:08.355Z", "chunkIndex": 1, "department": "Department of Women and Child Development", "documentId": "scheme-gruha-lakshmi-en", "contentHash": "d437a33a099c4cc0cc4a6936da897b7badbb55a7df423d1693cee2eb8852ad95", "totalChunks": 6, "documentTitle": "Gruha Lakshmi Scheme (₹2,000 Monthly DBT)", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.499127+00
c1ee9d58-477d-45e2-a022-652cb455b883	gruha-lakshmi	Gruha Lakshmi Scheme (₹2,000 Monthly DBT)	₹2,000 per month transferred through Aadhaar-enabled Direct Benefit Transfer (Aadhaar DBT / NPCI).	https://sevasindhugs.karnataka.gov.in	{"page": 1, "section": "Benefits and Financial Assistance", "language": "en", "createdAt": "2026-11-10T15:54:08.355Z", "chunkIndex": 2, "department": "Department of Women and Child Development", "documentId": "scheme-gruha-lakshmi-en", "contentHash": "e5f8772abed6aafec7194da819093fe0c46b056c8f57dbe268d2d030e3d689c9", "totalChunks": 6, "documentTitle": "Gruha Lakshmi Scheme (₹2,000 Monthly DBT)", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.5014+00
8845cd74-f9c6-4e29-824d-9cace1e1e19b	gruha-lakshmi	Gruha Lakshmi Scheme (₹2,000 Monthly DBT)	- Applicant must be designated as the woman head of family on the ration card. - Only one woman per household is eligible. - Neither the woman head of household nor her husband should be an income tax payer. - Neither the woman nor her husband should be filing GST returns.	https://sevasindhugs.karnataka.gov.in	{"page": 1, "section": "Eligibility Criteria", "language": "en", "createdAt": "2026-11-10T15:54:08.355Z", "chunkIndex": 3, "department": "Department of Women and Child Development", "documentId": "scheme-gruha-lakshmi-en", "contentHash": "8a2734cd11e73bffe646ce0b0b685dabe5b9c8429133ba6a8c02b4ff16de7fbc", "totalChunks": 6, "documentTitle": "Gruha Lakshmi Scheme (₹2,000 Monthly DBT)", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.503781+00
226195c6-d554-4b8d-b7b1-d4bc624183c3	gruha-lakshmi	Gruha Lakshmi Scheme (₹2,000 Monthly DBT)	- Karnataka Ration Card Number (Antyodaya / BPL / APL) - Aadhaar Card of the woman head of household - Bank Account linked to Aadhaar (NPCI Aadhaar mapping active) - Aadhaar Card of spouse/husband	https://sevasindhugs.karnataka.gov.in	{"page": 1, "section": "Required Documents", "language": "en", "createdAt": "2026-11-10T15:54:08.355Z", "chunkIndex": 4, "department": "Department of Women and Child Development", "documentId": "scheme-gruha-lakshmi-en", "contentHash": "2c448b320cdf37b831144d91ea8cc9b34aefc71898a1c58b839c0fd644fb5d5f", "totalChunks": 6, "documentTitle": "Gruha Lakshmi Scheme (₹2,000 Monthly DBT)", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.506763+00
9658c1c4-656d-4c2a-a0f0-8b0098e82fe3	gruha-lakshmi	Gruha Lakshmi Scheme (₹2,000 Monthly DBT)	- Draft your application and verify bank account details locally in ArivuNet. - Ensure the woman head’s bank account has NPCI Aadhaar seeding active. - Submit at Grama One, Karnataka One, Bangalore One, or Bapuji Seva Kendra. - No application fees are required. Monthly ₹2,000 credit begins post-verification via Direct Benefit Transfer (DBT).	https://sevasindhugs.karnataka.gov.in	{"page": 1, "section": "Application Procedure and Official Portals", "language": "en", "createdAt": "2026-11-10T15:54:08.355Z", "chunkIndex": 5, "department": "Department of Women and Child Development", "documentId": "scheme-gruha-lakshmi-en", "contentHash": "05ac3a524a2a354b5c8c0bc1b5779c41115cb0ae12b46d7ea46afe8caf559964", "totalChunks": 6, "documentTitle": "Gruha Lakshmi Scheme (₹2,000 Monthly DBT)", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.509281+00
a97aa6be-2fd8-47b7-8234-89d810408914	gruha-lakshmi	ಗೃಹಲಕ್ಷ್ಮಿ ಯೋಜನೆ — ಮಹಿಳಾ ಯಜಮಾನಿಗೆ ಮಾಸಿಕ ₹2,000 ನೆರವು	ಯೋಜನೆಯ ಹೆಸರು: ಗೃಹಲಕ್ಷ್ಮಿ ಯೋಜನೆ — ಮಹಿಳಾ ಯಜಮಾನಿಗೆ ಮಾಸಿಕ ₹2,000 ನೆರವು ಇಲಾಖೆ: ಮಹಿಳಾ ಮತ್ತು ಮಕ್ಕಳ ಅಭಿವೃದ್ಧಿ ಇಲಾಖೆ, ಕರ್ನಾಟಕ ಸರ್ಕಾರ ವರ್ಗ: citizen ಅಧಿಕೃತ ಪೋರ್ಟಲ್: https://sevasindhugs.karnataka.gov.in ಸಹಾಯವಾಣಿ: ಜನಸ್ಪಂದನ 1902	https://sevasindhugs.karnataka.gov.in	{"page": 1, "section": "ಯೋಜನೆ: ಗೃಹಲಕ್ಷ್ಮಿ ಯೋಜನೆ — ಮಹಿಳಾ ಯಜಮಾನಿಗೆ ಮಾಸಿಕ ₹2,000 ನೆರವು", "language": "kn", "createdAt": "2026-11-10T15:54:08.356Z", "chunkIndex": 0, "department": "ಮಹಿಳಾ ಮತ್ತು ಮಕ್ಕಳ ಅಭಿವೃದ್ಧಿ ಇಲಾಖೆ, ಕರ್ನಾಟಕ ಸರ್ಕಾರ", "documentId": "scheme-gruha-lakshmi-kn", "contentHash": "51346f95bf50cfaf0657f359b39c2f037b7b876208bed04ed1594ee14a040eb1", "totalChunks": 5, "documentTitle": "ಗೃಹಲಕ್ಷ್ಮಿ ಯೋಜನೆ — ಮಹಿಳಾ ಯಜಮಾನಿಗೆ ಮಾಸಿಕ ₹2,000 ನೆರವು", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.511857+00
2bdf2585-b170-4142-b229-5f815db4db54	gruha-lakshmi	ಗೃಹಲಕ್ಷ್ಮಿ ಯೋಜನೆ — ಮಹಿಳಾ ಯಜಮಾನಿಗೆ ಮಾಸಿಕ ₹2,000 ನೆರವು	ಪ್ರತಿ ತಿಂಗಳು ₹2,000 ನೇರ ನಗದು ವರ್ಗಾವಣೆ.	https://sevasindhugs.karnataka.gov.in	{"page": 1, "section": "ಸೌಲಭ್ಯಗಳು ಮತ್ತು ಆರ್ಥಿಕ ನೆರವು", "language": "kn", "createdAt": "2026-11-10T15:54:08.356Z", "chunkIndex": 1, "department": "ಮಹಿಳಾ ಮತ್ತು ಮಕ್ಕಳ ಅಭಿವೃದ್ಧಿ ಇಲಾಖೆ, ಕರ್ನಾಟಕ ಸರ್ಕಾರ", "documentId": "scheme-gruha-lakshmi-kn", "contentHash": "c0fc41a4069431e8c1bcb7fb364bd4bda19721a8e35aaa13f34c0d837d10f281", "totalChunks": 5, "documentTitle": "ಗೃಹಲಕ್ಷ್ಮಿ ಯೋಜನೆ — ಮಹಿಳಾ ಯಜಮಾನಿಗೆ ಮಾಸಿಕ ₹2,000 ನೆರವು", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.514677+00
37e3be4d-4b30-4eca-b37f-f3d95aba0398	gruha-lakshmi	ಗೃಹಲಕ್ಷ್ಮಿ ಯೋಜನೆ — ಮಹಿಳಾ ಯಜಮಾನಿಗೆ ಮಾಸಿಕ ₹2,000 ನೆರವು	- Applicant must be designated as the woman head of family on the ration card. - Only one woman per household is eligible. - Neither the woman head of household nor her husband should be an income tax payer. - Neither the woman nor her husband should be filing GST returns.	https://sevasindhugs.karnataka.gov.in	{"page": 1, "section": "ಅರ್ಹತಾ ಮಾನದಂಡಗಳು", "language": "kn", "createdAt": "2026-11-10T15:54:08.356Z", "chunkIndex": 2, "department": "ಮಹಿಳಾ ಮತ್ತು ಮಕ್ಕಳ ಅಭಿವೃದ್ಧಿ ಇಲಾಖೆ, ಕರ್ನಾಟಕ ಸರ್ಕಾರ", "documentId": "scheme-gruha-lakshmi-kn", "contentHash": "93e0df41f39de4df98dcfb67842fc6305249f7e69a5ba258b06b8268e04453be", "totalChunks": 5, "documentTitle": "ಗೃಹಲಕ್ಷ್ಮಿ ಯೋಜನೆ — ಮಹಿಳಾ ಯಜಮಾನಿಗೆ ಮಾಸಿಕ ₹2,000 ನೆರವು", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.517096+00
29f7232a-6a2a-43ac-9094-bcfebf0b1b77	gruha-lakshmi	ಗೃಹಲಕ್ಷ್ಮಿ ಯೋಜನೆ — ಮಹಿಳಾ ಯಜಮಾನಿಗೆ ಮಾಸಿಕ ₹2,000 ನೆರವು	- Karnataka Ration Card Number (Antyodaya / BPL / APL) - Aadhaar Card of the woman head of household - Bank Account linked to Aadhaar (NPCI Aadhaar mapping active) - Aadhaar Card of spouse/husband	https://sevasindhugs.karnataka.gov.in	{"page": 1, "section": "ಅಗತ್ಯ ದಾಖಲೆಗಳು", "language": "kn", "createdAt": "2026-11-10T15:54:08.356Z", "chunkIndex": 3, "department": "ಮಹಿಳಾ ಮತ್ತು ಮಕ್ಕಳ ಅಭಿವೃದ್ಧಿ ಇಲಾಖೆ, ಕರ್ನಾಟಕ ಸರ್ಕಾರ", "documentId": "scheme-gruha-lakshmi-kn", "contentHash": "678e0f2ad39ec136b66014e04c4053aa27a5346a8af7e0b6a2f62ef43c3adc8a", "totalChunks": 5, "documentTitle": "ಗೃಹಲಕ್ಷ್ಮಿ ಯೋಜನೆ — ಮಹಿಳಾ ಯಜಮಾನಿಗೆ ಮಾಸಿಕ ₹2,000 ನೆರವು", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.519584+00
02cca42a-69bc-4133-9364-da6e0234fe99	gruha-lakshmi	ಗೃಹಲಕ್ಷ್ಮಿ ಯೋಜನೆ — ಮಹಿಳಾ ಯಜಮಾನಿಗೆ ಮಾಸಿಕ ₹2,000 ನೆರವು	- Draft your application and verify bank account details locally in ArivuNet. - Ensure the woman head’s bank account has NPCI Aadhaar seeding active. - Submit at Grama One, Karnataka One, Bangalore One, or Bapuji Seva Kendra. - No application fees are required. Monthly ₹2,000 credit begins post-verification via Direct Benefit Transfer (DBT).	https://sevasindhugs.karnataka.gov.in	{"page": 1, "section": "ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ವಿಧಾನ ಮತ್ತು ಅಧಿಕೃತ ಸಂಪರ್ಕ", "language": "kn", "createdAt": "2026-11-10T15:54:08.356Z", "chunkIndex": 4, "department": "ಮಹಿಳಾ ಮತ್ತು ಮಕ್ಕಳ ಅಭಿವೃದ್ಧಿ ಇಲಾಖೆ, ಕರ್ನಾಟಕ ಸರ್ಕಾರ", "documentId": "scheme-gruha-lakshmi-kn", "contentHash": "08cdf2a87df08c876f9cfe2ed2f686419dccdd06df8b301695401073e32dcf22", "totalChunks": 5, "documentTitle": "ಗೃಹಲಕ್ಷ್ಮಿ ಯೋಜನೆ — ಮಹಿಳಾ ಯಜಮಾನಿಗೆ ಮಾಸಿಕ ₹2,000 ನೆರವು", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.522678+00
085114fe-3fe1-4e59-b4b4-ec84d60db1a4	yuva-nidhi	Yuva Nidhi Scheme (Graduate & Diploma Stipend)	Scheme Name: Yuva Nidhi Scheme (Graduate & Diploma Stipend) Department: Department of Skill Development, Entrepreneurship and Livelihood Category: student Official Portal: https://sevasindhugs.karnataka.gov.in Department Helpline: Janaspandana 1902	https://sevasindhugs.karnataka.gov.in	{"page": 1, "section": "Scheme: Yuva Nidhi Scheme (Graduate & Diploma Stipend)", "language": "en", "createdAt": "2026-11-10T15:54:08.356Z", "chunkIndex": 0, "department": "Department of Skill Development, Entrepreneurship and Livelihood", "documentId": "scheme-yuva-nidhi-en", "contentHash": "0ec32b31fcb14d2b2634c9709bfb544708c847d109b26d7b933214b373650d31", "totalChunks": 6, "documentTitle": "Yuva Nidhi Scheme (Graduate & Diploma Stipend)", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.52499+00
197e1983-2433-4dec-a5bd-2506cdad067a	yuva-nidhi	Yuva Nidhi Scheme (Graduate & Diploma Stipend)	Details unavailable.	https://sevasindhugs.karnataka.gov.in	{"page": 1, "section": "Overview and Objectives", "language": "en", "createdAt": "2026-11-10T15:54:08.356Z", "chunkIndex": 1, "department": "Department of Skill Development, Entrepreneurship and Livelihood", "documentId": "scheme-yuva-nidhi-en", "contentHash": "e2baf0c7742534de6b9c25aa0bfb095777e75f715edadb9c41785d0e291d229a", "totalChunks": 6, "documentTitle": "Yuva Nidhi Scheme (Graduate & Diploma Stipend)", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.52748+00
e9def78c-87bb-4325-9087-3c5397950c62	yuva-nidhi	Yuva Nidhi Scheme (Graduate & Diploma Stipend)	₹3,000/month for degree holders and ₹1,500/month for diploma holders via DBT for up to 24 months.	https://sevasindhugs.karnataka.gov.in	{"page": 1, "section": "Benefits and Financial Assistance", "language": "en", "createdAt": "2026-11-10T15:54:08.356Z", "chunkIndex": 2, "department": "Department of Skill Development, Entrepreneurship and Livelihood", "documentId": "scheme-yuva-nidhi-en", "contentHash": "21caba8cb14a27eb6f4dee100cff4637c18e5169a6ca2223ca84144bc776b8f0", "totalChunks": 6, "documentTitle": "Yuva Nidhi Scheme (Graduate & Diploma Stipend)", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.529763+00
b4296214-0167-4038-a1ca-3a1240577d72	yuva-nidhi	Yuva Nidhi Scheme (Graduate & Diploma Stipend)	- Must have passed degree or diploma from a recognized university or board in Karnataka. - Must have completed a minimum of 6 years of study in Karnataka (domicile requirement). - Must have remained unemployed for at least 180 days after graduation results. - Must not be pursuing higher education or employed in government/private sectors. - Must not be self-employed or eligible for EPF/ESI benefits.	https://sevasindhugs.karnataka.gov.in	{"page": 1, "section": "Eligibility Criteria", "language": "en", "createdAt": "2026-11-10T15:54:08.356Z", "chunkIndex": 3, "department": "Department of Skill Development, Entrepreneurship and Livelihood", "documentId": "scheme-yuva-nidhi-en", "contentHash": "125a9305c5235a644f4299a6648181de92facd2a400e83b2df1cf0d0ba860ef4", "totalChunks": 6, "documentTitle": "Yuva Nidhi Scheme (Graduate & Diploma Stipend)", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.532325+00
42c0fd92-4600-42bd-95d1-e82b0c46d3bf	arogya-karnataka	Arogya Karnataka (Ayushman Bharat — SAST)	Details unavailable.	https://arogya.karnataka.gov.in	{"page": 1, "section": "Overview and Objectives", "language": "en", "createdAt": "2026-11-10T15:54:08.356Z", "chunkIndex": 1, "department": "Health and Family Welfare / Suvarna Arogya Suraksha Trust", "documentId": "scheme-arogya-karnataka-en", "contentHash": "c8f6e0dd8fb708649c9b5624d4a893b70e927ab72601294d51a2b5435c66f3ca", "totalChunks": 6, "documentTitle": "Arogya Karnataka (Ayushman Bharat — SAST)", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.589514+00
42913f0a-47a5-44d2-a210-a0d92bc084ff	yuva-nidhi	Yuva Nidhi Scheme (Graduate & Diploma Stipend)	- SSLC Marks Card - Degree or Diploma Certificate & Final Year Marks Card - Aadhaar Card linked to active bank account - Domicile / Study Certificate proving 6 years study in Karnataka - Self-declaration of unemployment	https://sevasindhugs.karnataka.gov.in	{"page": 1, "section": "Required Documents", "language": "en", "createdAt": "2026-11-10T15:54:08.356Z", "chunkIndex": 4, "department": "Department of Skill Development, Entrepreneurship and Livelihood", "documentId": "scheme-yuva-nidhi-en", "contentHash": "4e529f119c90e8c36090545403356c17d34603e6ee9b93a5237bb608fd3bbd6d", "totalChunks": 6, "documentTitle": "Yuva Nidhi Scheme (Graduate & Diploma Stipend)", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.534756+00
4a3de5c2-e542-49cb-8176-114e0dae819e	yuva-nidhi	Yuva Nidhi Scheme (Graduate & Diploma Stipend)	- Prepare degree/diploma roll number and domicile details in ArivuNet. - Register on Seva Sindhu Guarantee Services portal (sevasindhugs.karnataka.gov.in) with Aadhaar. - Submit the unemployment declaration confirming 180+ days since graduation without private/govt employment or higher studies. - Submit monthly self-declaration on the portal to continue receiving ₹3,000 (Degree) or ₹1,500 (Diploma) monthly DBT.	https://sevasindhugs.karnataka.gov.in	{"page": 1, "section": "Application Procedure and Official Portals", "language": "en", "createdAt": "2026-11-10T15:54:08.356Z", "chunkIndex": 5, "department": "Department of Skill Development, Entrepreneurship and Livelihood", "documentId": "scheme-yuva-nidhi-en", "contentHash": "cd209b9ab721aacfe62f63aebc84a6201f9f4f7d20649b5ab98e3f1cbd9dc804", "totalChunks": 6, "documentTitle": "Yuva Nidhi Scheme (Graduate & Diploma Stipend)", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.53782+00
ee19acce-8c33-416d-ad75-226f98a833c4	yuva-nidhi	ಯುವ ನಿಧಿ ಯೋಜನೆ — ಪದವೀಧರರು ಮತ್ತು ಡಿಪ್ಲೊಮಾ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಮಾಸಾಶನ	ಯೋಜನೆಯ ಹೆಸರು: ಯುವ ನಿಧಿ ಯೋಜನೆ — ಪದವೀಧರರು ಮತ್ತು ಡಿಪ್ಲೊಮಾ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಮಾಸಾಶನ ಇಲಾಖೆ: ಕೌಶಲ್ಯಾಭಿವೃದ್ಧಿ, ಉದ್ಯಮಶೀಲತೆ ಮತ್ತು ಜೀವನೋಪಾಯ ಇಲಾಖೆ ವರ್ಗ: student ಅಧಿಕೃತ ಪೋರ್ಟಲ್: https://sevasindhugs.karnataka.gov.in ಸಹಾಯವಾಣಿ: ಜನಸ್ಪಂದನ 1902	https://sevasindhugs.karnataka.gov.in	{"page": 1, "section": "ಯೋಜನೆ: ಯುವ ನಿಧಿ ಯೋಜನೆ — ಪದವೀಧರರು ಮತ್ತು ಡಿಪ್ಲೊಮಾ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಮಾಸಾಶನ", "language": "kn", "createdAt": "2026-11-10T15:54:08.356Z", "chunkIndex": 0, "department": "ಕೌಶಲ್ಯಾಭಿವೃದ್ಧಿ, ಉದ್ಯಮಶೀಲತೆ ಮತ್ತು ಜೀವನೋಪಾಯ ಇಲಾಖೆ", "documentId": "scheme-yuva-nidhi-kn", "contentHash": "9020ed09f22f8c74b8b9c1af0db90492b525f1907877d018d3b518185806075a", "totalChunks": 5, "documentTitle": "ಯುವ ನಿಧಿ ಯೋಜನೆ — ಪದವೀಧರರು ಮತ್ತು ಡಿಪ್ಲೊಮಾ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಮಾಸಾಶನ", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.540715+00
7bd6b14b-eae2-4a8a-9026-0e72adbd6488	yuva-nidhi	ಯುವ ನಿಧಿ ಯೋಜನೆ — ಪದವೀಧರರು ಮತ್ತು ಡಿಪ್ಲೊಮಾ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಮಾಸಾಶನ	ಪದವೀಧರರಿಗೆ ₹3,000 ಹಾಗೂ ಡಿಪ್ಲೊಮಾ ಮುಗಿಸಿದವರಿಗೆ ₹1,500 ಮಾಸಿಕ ಭತ್ಯೆ.	https://sevasindhugs.karnataka.gov.in	{"page": 1, "section": "ಸೌಲಭ್ಯಗಳು ಮತ್ತು ಆರ್ಥಿಕ ನೆರವು", "language": "kn", "createdAt": "2026-11-10T15:54:08.356Z", "chunkIndex": 1, "department": "ಕೌಶಲ್ಯಾಭಿವೃದ್ಧಿ, ಉದ್ಯಮಶೀಲತೆ ಮತ್ತು ಜೀವನೋಪಾಯ ಇಲಾಖೆ", "documentId": "scheme-yuva-nidhi-kn", "contentHash": "0e55c048362697151bdd5a03abe46886ea977987a5e441d4ddee7edabe187ad5", "totalChunks": 5, "documentTitle": "ಯುವ ನಿಧಿ ಯೋಜನೆ — ಪದವೀಧರರು ಮತ್ತು ಡಿಪ್ಲೊಮಾ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಮಾಸಾಶನ", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.543449+00
ee68c3dc-8cc3-41ca-b823-10070c1f28bb	yuva-nidhi	ಯುವ ನಿಧಿ ಯೋಜನೆ — ಪದವೀಧರರು ಮತ್ತು ಡಿಪ್ಲೊಮಾ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಮಾಸಾಶನ	- Must have passed degree or diploma from a recognized university or board in Karnataka. - Must have completed a minimum of 6 years of study in Karnataka (domicile requirement). - Must have remained unemployed for at least 180 days after graduation results. - Must not be pursuing higher education or employed in government/private sectors. - Must not be self-employed or eligible for EPF/ESI benefits.	https://sevasindhugs.karnataka.gov.in	{"page": 1, "section": "ಅರ್ಹತಾ ಮಾನದಂಡಗಳು", "language": "kn", "createdAt": "2026-11-10T15:54:08.356Z", "chunkIndex": 2, "department": "ಕೌಶಲ್ಯಾಭಿವೃದ್ಧಿ, ಉದ್ಯಮಶೀಲತೆ ಮತ್ತು ಜೀವನೋಪಾಯ ಇಲಾಖೆ", "documentId": "scheme-yuva-nidhi-kn", "contentHash": "0ccb7ef1092df1e3980e8a9a8819bdd54215adb9cc7b90bcebccc1838e5631f5", "totalChunks": 5, "documentTitle": "ಯುವ ನಿಧಿ ಯೋಜನೆ — ಪದವೀಧರರು ಮತ್ತು ಡಿಪ್ಲೊಮಾ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಮಾಸಾಶನ", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.546131+00
1ced5474-43c7-40d6-aca4-398806b8142e	yuva-nidhi	ಯುವ ನಿಧಿ ಯೋಜನೆ — ಪದವೀಧರರು ಮತ್ತು ಡಿಪ್ಲೊಮಾ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಮಾಸಾಶನ	- SSLC Marks Card - Degree or Diploma Certificate & Final Year Marks Card - Aadhaar Card linked to active bank account - Domicile / Study Certificate proving 6 years study in Karnataka - Self-declaration of unemployment	https://sevasindhugs.karnataka.gov.in	{"page": 1, "section": "ಅಗತ್ಯ ದಾಖಲೆಗಳು", "language": "kn", "createdAt": "2026-11-10T15:54:08.356Z", "chunkIndex": 3, "department": "ಕೌಶಲ್ಯಾಭಿವೃದ್ಧಿ, ಉದ್ಯಮಶೀಲತೆ ಮತ್ತು ಜೀವನೋಪಾಯ ಇಲಾಖೆ", "documentId": "scheme-yuva-nidhi-kn", "contentHash": "de094aa35e901df84c1cfb3b2838cd85d38c11ef93dad1d67eb57b626c0f79ce", "totalChunks": 5, "documentTitle": "ಯುವ ನಿಧಿ ಯೋಜನೆ — ಪದವೀಧರರು ಮತ್ತು ಡಿಪ್ಲೊಮಾ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಮಾಸಾಶನ", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.548726+00
9a894b87-90dc-4e56-ae66-a8176e671b10	yuva-nidhi	ಯುವ ನಿಧಿ ಯೋಜನೆ — ಪದವೀಧರರು ಮತ್ತು ಡಿಪ್ಲೊಮಾ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಮಾಸಾಶನ	- Prepare degree/diploma roll number and domicile details in ArivuNet. - Register on Seva Sindhu Guarantee Services portal (sevasindhugs.karnataka.gov.in) with Aadhaar. - Submit the unemployment declaration confirming 180+ days since graduation without private/govt employment or higher studies. - Submit monthly self-declaration on the portal to continue receiving ₹3,000 (Degree) or ₹1,500 (Diploma) monthly DBT.	https://sevasindhugs.karnataka.gov.in	{"page": 1, "section": "ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ವಿಧಾನ ಮತ್ತು ಅಧಿಕೃತ ಸಂಪರ್ಕ", "language": "kn", "createdAt": "2026-11-10T15:54:08.356Z", "chunkIndex": 4, "department": "ಕೌಶಲ್ಯಾಭಿವೃದ್ಧಿ, ಉದ್ಯಮಶೀಲತೆ ಮತ್ತು ಜೀವನೋಪಾಯ ಇಲಾಖೆ", "documentId": "scheme-yuva-nidhi-kn", "contentHash": "9c922de0452ac9b8ab3cf4736f11bf98d6a07ec378fcbd5b32b49f2d87a4a073", "totalChunks": 5, "documentTitle": "ಯುವ ನಿಧಿ ಯೋಜನೆ — ಪದವೀಧರರು ಮತ್ತು ಡಿಪ್ಲೊಮಾ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಮಾಸಾಶನ", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.551149+00
b4e0b0ff-3b7a-4340-aca8-0c444b60affa	ssp-scholarship	State Scholarship Portal (SSP) Post-Matric Scholarships	Scheme Name: State Scholarship Portal (SSP) Post-Matric Scholarships Department: Social Welfare & Backward Classes Welfare Departments Category: student Official Portal: https://ssp.postmatric.karnataka.gov.in Department Helpline: Janaspandana 1902	https://ssp.postmatric.karnataka.gov.in	{"page": 1, "section": "Scheme: State Scholarship Portal (SSP) Post-Matric Scholarships", "language": "en", "createdAt": "2026-11-10T15:54:08.356Z", "chunkIndex": 0, "department": "Social Welfare & Backward Classes Welfare Departments", "documentId": "scheme-ssp-scholarship-en", "contentHash": "2b0d661134c2d5df9344ad62dc8fb40627e13dbf8b7eac1d71125d3a9c92a8a6", "totalChunks": 6, "documentTitle": "State Scholarship Portal (SSP) Post-Matric Scholarships", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.553706+00
93ccbf29-c32d-4673-acb1-fc67385c35bd	ssp-scholarship	State Scholarship Portal (SSP) Post-Matric Scholarships	Details unavailable.	https://ssp.postmatric.karnataka.gov.in	{"page": 1, "section": "Overview and Objectives", "language": "en", "createdAt": "2026-11-10T15:54:08.356Z", "chunkIndex": 1, "department": "Social Welfare & Backward Classes Welfare Departments", "documentId": "scheme-ssp-scholarship-en", "contentHash": "e2c62fb09419d6a33161d7489eb911d2f45251e8a7e64f98cc563b594a2da6db", "totalChunks": 6, "documentTitle": "State Scholarship Portal (SSP) Post-Matric Scholarships", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.556883+00
998a24d8-6883-4e3f-adad-8c3f150764a2	ssp-scholarship	State Scholarship Portal (SSP) Post-Matric Scholarships	College tuition fee reimbursement and monthly hostel/maintenance grant up to ₹25,000 per academic year.	https://ssp.postmatric.karnataka.gov.in	{"page": 1, "section": "Benefits and Financial Assistance", "language": "en", "createdAt": "2026-11-10T15:54:08.356Z", "chunkIndex": 2, "department": "Social Welfare & Backward Classes Welfare Departments", "documentId": "scheme-ssp-scholarship-en", "contentHash": "3b9c27d5e2a31878e760e1edce38973e318acc3c4c8eae81186c6a1888ca6a5e", "totalChunks": 6, "documentTitle": "State Scholarship Portal (SSP) Post-Matric Scholarships", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.560863+00
c4930024-a957-44a4-849f-1e6024ab2b2b	ssp-scholarship	State Scholarship Portal (SSP) Post-Matric Scholarships	- Applicant must be a bonafide student in a recognized Karnataka college / institute. - Must possess a valid Student SATS ID / e-Attestation Number. - Annual family income ceiling: Up to ₹2.5 Lakh for SC/ST; Up to ₹1.0 Lakh for OBC (Cat-1, 2A, 2B, 3A, 3B). - Must have verified Caste and Income Certificate RD numbers from Nadakacheri.	https://ssp.postmatric.karnataka.gov.in	{"page": 1, "section": "Eligibility Criteria", "language": "en", "createdAt": "2026-11-10T15:54:08.356Z", "chunkIndex": 3, "department": "Social Welfare & Backward Classes Welfare Departments", "documentId": "scheme-ssp-scholarship-en", "contentHash": "932d18543f607a31834f00a38a103af264ebd9bdc4a6844686779c8e63ba03e1", "totalChunks": 6, "documentTitle": "State Scholarship Portal (SSP) Post-Matric Scholarships", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.563637+00
2bf472da-77cb-449e-855c-3893bfd9fcc6	ssp-scholarship	State Scholarship Portal (SSP) Post-Matric Scholarships	- Student Aadhaar Card - College Admission Fee Receipt & Bonafide Certificate - Caste and Income Certificate RD Number - SSLC Registration Number & Marks Card - Hostel certificate (if residing in government/private hostel)	https://ssp.postmatric.karnataka.gov.in	{"page": 1, "section": "Required Documents", "language": "en", "createdAt": "2026-11-10T15:54:08.356Z", "chunkIndex": 4, "department": "Social Welfare & Backward Classes Welfare Departments", "documentId": "scheme-ssp-scholarship-en", "contentHash": "ed77529039c5f243b18f801016fb1b34a8aba3782454d41973b4e9222ed4c263", "totalChunks": 6, "documentTitle": "State Scholarship Portal (SSP) Post-Matric Scholarships", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.566538+00
49b81a80-9efb-4c5e-a69b-463075f31273	ssp-scholarship	State Scholarship Portal (SSP) Post-Matric Scholarships	- Assemble college fee receipts, SATS ID, and Caste/Income certificate RD numbers. - Prepare draft profile in ArivuNet. - Complete online submission on State Scholarship Portal (ssp.postmatric.karnataka.gov.in). - Institute nodal officer verifies admission, after which department sanctions tuition and maintenance allowances.	https://ssp.postmatric.karnataka.gov.in	{"page": 1, "section": "Application Procedure and Official Portals", "language": "en", "createdAt": "2026-11-10T15:54:08.356Z", "chunkIndex": 5, "department": "Social Welfare & Backward Classes Welfare Departments", "documentId": "scheme-ssp-scholarship-en", "contentHash": "37c777c49e16a20a3b5bc6694946d466231d568a46113697d432d36ca7044d8f", "totalChunks": 6, "documentTitle": "State Scholarship Portal (SSP) Post-Matric Scholarships", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.569568+00
e7a4b0c8-d123-4d53-94eb-02c6b0bc3ee4	arogya-karnataka	Arogya Karnataka (Ayushman Bharat — SAST)	Cashless treatment up to ₹5 lakh at government hospitals and empanelled private super-specialty hospitals.	https://arogya.karnataka.gov.in	{"page": 1, "section": "Benefits and Financial Assistance", "language": "en", "createdAt": "2026-11-10T15:54:08.356Z", "chunkIndex": 2, "department": "Health and Family Welfare / Suvarna Arogya Suraksha Trust", "documentId": "scheme-arogya-karnataka-en", "contentHash": "17ffa45e122865d316dc701ffd6230b6cd3517a634eaefab57ee8bf12abb1224", "totalChunks": 6, "documentTitle": "Arogya Karnataka (Ayushman Bharat — SAST)", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.592176+00
1f5b3f49-c7fe-4ed2-8abf-f923412436d9	ssp-scholarship	ರಾಜ್ಯ ವಿದ್ಯಾರ್ಥಿವೇತನ ತಂತ್ರಾಂಶ (SSP) — ಮೆಟ್ರಿಕ್ ನಂತರದ ವಿದ್ಯಾರ್ಥಿವೇತನ	ಯೋಜನೆಯ ಹೆಸರು: ರಾಜ್ಯ ವಿದ್ಯಾರ್ಥಿವೇತನ ತಂತ್ರಾಂಶ (SSP) — ಮೆಟ್ರಿಕ್ ನಂತರದ ವಿದ್ಯಾರ್ಥಿವೇತನ ಇಲಾಖೆ: ಸಮಾಜ ಕಲ್ಯಾಣ ಮತ್ತು ಹಿಂದುಳಿದ ವರ್ಗಗಳ ಕಲ್ಯಾಣ ಇಲಾಖೆ ವರ್ಗ: student ಅಧಿಕೃತ ಪೋರ್ಟಲ್: https://ssp.postmatric.karnataka.gov.in ಸಹಾಯವಾಣಿ: ಜನಸ್ಪಂದನ 1902	https://ssp.postmatric.karnataka.gov.in	{"page": 1, "section": "ಯೋಜನೆ: ರಾಜ್ಯ ವಿದ್ಯಾರ್ಥಿವೇತನ ತಂತ್ರಾಂಶ (SSP) — ಮೆಟ್ರಿಕ್ ನಂತರದ ವಿದ್ಯಾರ್ಥಿವೇತನ", "language": "kn", "createdAt": "2026-11-10T15:54:08.356Z", "chunkIndex": 0, "department": "ಸಮಾಜ ಕಲ್ಯಾಣ ಮತ್ತು ಹಿಂದುಳಿದ ವರ್ಗಗಳ ಕಲ್ಯಾಣ ಇಲಾಖೆ", "documentId": "scheme-ssp-scholarship-kn", "contentHash": "a2a25fb891dbe4bcd547d2a9a27f03f26eea20e3eb5e1d86e0cf0ce0adb4f628", "totalChunks": 5, "documentTitle": "ರಾಜ್ಯ ವಿದ್ಯಾರ್ಥಿವೇತನ ತಂತ್ರಾಂಶ (SSP) — ಮೆಟ್ರಿಕ್ ನಂತರದ ವಿದ್ಯಾರ್ಥಿವೇತನ", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.573577+00
38b3a0f9-399f-42b9-b171-43d1672e5a36	ssp-scholarship	ರಾಜ್ಯ ವಿದ್ಯಾರ್ಥಿವೇತನ ತಂತ್ರಾಂಶ (SSP) — ಮೆಟ್ರಿಕ್ ನಂತರದ ವಿದ್ಯಾರ್ಥಿವೇತನ	ಕಾಲೇಜು ಶುಲ್ಕ ಮರುಪಾವತಿ ಹಾಗೂ ವಾರ್ಷಿಕ ವಿದ್ಯಾರ್ಥಿವೇತನ ಅನುದಾನ.	https://ssp.postmatric.karnataka.gov.in	{"page": 1, "section": "ಸೌಲಭ್ಯಗಳು ಮತ್ತು ಆರ್ಥಿಕ ನೆರವು", "language": "kn", "createdAt": "2026-11-10T15:54:08.356Z", "chunkIndex": 1, "department": "ಸಮಾಜ ಕಲ್ಯಾಣ ಮತ್ತು ಹಿಂದುಳಿದ ವರ್ಗಗಳ ಕಲ್ಯಾಣ ಇಲಾಖೆ", "documentId": "scheme-ssp-scholarship-kn", "contentHash": "7165053607b62c9bd3839dc972d23304574e37d5d6a14fa905b995b03732daa9", "totalChunks": 5, "documentTitle": "ರಾಜ್ಯ ವಿದ್ಯಾರ್ಥಿವೇತನ ತಂತ್ರಾಂಶ (SSP) — ಮೆಟ್ರಿಕ್ ನಂತರದ ವಿದ್ಯಾರ್ಥಿವೇತನ", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.576633+00
4f608017-8947-4d77-953d-dd1539aa9c78	ssp-scholarship	ರಾಜ್ಯ ವಿದ್ಯಾರ್ಥಿವೇತನ ತಂತ್ರಾಂಶ (SSP) — ಮೆಟ್ರಿಕ್ ನಂತರದ ವಿದ್ಯಾರ್ಥಿವೇತನ	- Applicant must be a bonafide student in a recognized Karnataka college / institute. - Must possess a valid Student SATS ID / e-Attestation Number. - Annual family income ceiling: Up to ₹2.5 Lakh for SC/ST; Up to ₹1.0 Lakh for OBC (Cat-1, 2A, 2B, 3A, 3B). - Must have verified Caste and Income Certificate RD numbers from Nadakacheri.	https://ssp.postmatric.karnataka.gov.in	{"page": 1, "section": "ಅರ್ಹತಾ ಮಾನದಂಡಗಳು", "language": "kn", "createdAt": "2026-11-10T15:54:08.356Z", "chunkIndex": 2, "department": "ಸಮಾಜ ಕಲ್ಯಾಣ ಮತ್ತು ಹಿಂದುಳಿದ ವರ್ಗಗಳ ಕಲ್ಯಾಣ ಇಲಾಖೆ", "documentId": "scheme-ssp-scholarship-kn", "contentHash": "6750a356cc7ce24dcf064fe5a238ef1d340d17870f38be43fcd15e4a3c59c012", "totalChunks": 5, "documentTitle": "ರಾಜ್ಯ ವಿದ್ಯಾರ್ಥಿವೇತನ ತಂತ್ರಾಂಶ (SSP) — ಮೆಟ್ರಿಕ್ ನಂತರದ ವಿದ್ಯಾರ್ಥಿವೇತನ", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.579105+00
2ef3a6c0-cfb0-4c84-a64e-4515818780e8	ssp-scholarship	ರಾಜ್ಯ ವಿದ್ಯಾರ್ಥಿವೇತನ ತಂತ್ರಾಂಶ (SSP) — ಮೆಟ್ರಿಕ್ ನಂತರದ ವಿದ್ಯಾರ್ಥಿವೇತನ	- Student Aadhaar Card - College Admission Fee Receipt & Bonafide Certificate - Caste and Income Certificate RD Number - SSLC Registration Number & Marks Card - Hostel certificate (if residing in government/private hostel)	https://ssp.postmatric.karnataka.gov.in	{"page": 1, "section": "ಅಗತ್ಯ ದಾಖಲೆಗಳು", "language": "kn", "createdAt": "2026-11-10T15:54:08.356Z", "chunkIndex": 3, "department": "ಸಮಾಜ ಕಲ್ಯಾಣ ಮತ್ತು ಹಿಂದುಳಿದ ವರ್ಗಗಳ ಕಲ್ಯಾಣ ಇಲಾಖೆ", "documentId": "scheme-ssp-scholarship-kn", "contentHash": "e8c55ab232f84e448c44612e3dbf4f722de2d35bc47afdc670efc86a8a48a2af", "totalChunks": 5, "documentTitle": "ರಾಜ್ಯ ವಿದ್ಯಾರ್ಥಿವೇತನ ತಂತ್ರಾಂಶ (SSP) — ಮೆಟ್ರಿಕ್ ನಂತರದ ವಿದ್ಯಾರ್ಥಿವೇತನ", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.581792+00
f435d157-d0ef-4ee8-a7f6-2150a0459067	ssp-scholarship	ರಾಜ್ಯ ವಿದ್ಯಾರ್ಥಿವೇತನ ತಂತ್ರಾಂಶ (SSP) — ಮೆಟ್ರಿಕ್ ನಂತರದ ವಿದ್ಯಾರ್ಥಿವೇತನ	- Assemble college fee receipts, SATS ID, and Caste/Income certificate RD numbers. - Prepare draft profile in ArivuNet. - Complete online submission on State Scholarship Portal (ssp.postmatric.karnataka.gov.in). - Institute nodal officer verifies admission, after which department sanctions tuition and maintenance allowances.	https://ssp.postmatric.karnataka.gov.in	{"page": 1, "section": "ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ವಿಧಾನ ಮತ್ತು ಅಧಿಕೃತ ಸಂಪರ್ಕ", "language": "kn", "createdAt": "2026-11-10T15:54:08.356Z", "chunkIndex": 4, "department": "ಸಮಾಜ ಕಲ್ಯಾಣ ಮತ್ತು ಹಿಂದುಳಿದ ವರ್ಗಗಳ ಕಲ್ಯಾಣ ಇಲಾಖೆ", "documentId": "scheme-ssp-scholarship-kn", "contentHash": "f11d015428c1c9b4bcb36c27090d0f1a3fd2c4f4673c7d7de1079f21994a48b8", "totalChunks": 5, "documentTitle": "ರಾಜ್ಯ ವಿದ್ಯಾರ್ಥಿವೇತನ ತಂತ್ರಾಂಶ (SSP) — ಮೆಟ್ರಿಕ್ ನಂತರದ ವಿದ್ಯಾರ್ಥಿವೇತನ", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.584122+00
c7a25fd0-4736-46fe-a671-59b805894551	arogya-karnataka	Arogya Karnataka (Ayushman Bharat — SAST)	Scheme Name: Arogya Karnataka (Ayushman Bharat — SAST) Department: Health and Family Welfare / Suvarna Arogya Suraksha Trust Category: health Official Portal: https://arogya.karnataka.gov.in Department Helpline: Janaspandana 1902	https://arogya.karnataka.gov.in	{"page": 1, "section": "Scheme: Arogya Karnataka (Ayushman Bharat — SAST)", "language": "en", "createdAt": "2026-11-10T15:54:08.356Z", "chunkIndex": 0, "department": "Health and Family Welfare / Suvarna Arogya Suraksha Trust", "documentId": "scheme-arogya-karnataka-en", "contentHash": "50422e2930cc793875c310b320f95c298c48e141032c71b76e4b2b12aeca0f79", "totalChunks": 6, "documentTitle": "Arogya Karnataka (Ayushman Bharat — SAST)", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.586599+00
95ef95ee-5120-447b-9a78-2b1ef64a6aa6	arogya-karnataka	Arogya Karnataka (Ayushman Bharat — SAST)	- Permanent resident of Karnataka. - Must possess an active BPL / PHH Ration Card for 100% free treatment or APL Card for co-payment. - Referral from Government Primary Health Centre (PHC) / Taluk Hospital required for non-emergency tertiary care.	https://arogya.karnataka.gov.in	{"page": 1, "section": "Eligibility Criteria", "language": "en", "createdAt": "2026-11-10T15:54:08.356Z", "chunkIndex": 3, "department": "Health and Family Welfare / Suvarna Arogya Suraksha Trust", "documentId": "scheme-arogya-karnataka-en", "contentHash": "153b81f0b1a2226dc12453e0711815c8223b2cc2fa7c6ef72febd9fd01aeeaa9", "totalChunks": 6, "documentTitle": "Arogya Karnataka (Ayushman Bharat — SAST)", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.594667+00
b2035375-fb26-4b82-8626-f55fc4de4543	arogya-karnataka	Arogya Karnataka (Ayushman Bharat — SAST)	- Karnataka Ration Card (BPL / APL) - Aadhaar Card of the patient and family head - Government Hospital Referral Slip (for tertiary treatment)	https://arogya.karnataka.gov.in	{"page": 1, "section": "Required Documents", "language": "en", "createdAt": "2026-11-10T15:54:08.356Z", "chunkIndex": 4, "department": "Health and Family Welfare / Suvarna Arogya Suraksha Trust", "documentId": "scheme-arogya-karnataka-en", "contentHash": "ce64f12eaf1e2ad943128c91c1b0fe466f55eb56072fbe875857b8e7b510ef01", "totalChunks": 6, "documentTitle": "Arogya Karnataka (Ayushman Bharat — SAST)", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.597437+00
462ff618-ddc1-4e97-a1a6-d4f92a9293cc	arogya-karnataka	Arogya Karnataka (Ayushman Bharat — SAST)	- Visit your local Government Primary Health Centre (PHC) or General Hospital with your Ration Card and Aadhaar. - Primary doctor evaluates medical condition and provides an online referral slip (SAST referral) for tertiary care. - Present referral slip and Ration Card at any empanelled government or private super-specialty hospital. - Arogya Mitra desk at the hospital registers patient and processes cashless treatment package up to ₹5 lakh for BPL.	https://arogya.karnataka.gov.in	{"page": 1, "section": "Application Procedure and Official Portals", "language": "en", "createdAt": "2026-11-10T15:54:08.356Z", "chunkIndex": 5, "department": "Health and Family Welfare / Suvarna Arogya Suraksha Trust", "documentId": "scheme-arogya-karnataka-en", "contentHash": "c6b74d1248eef86b664e9133aaaf95c8d3a00060c0a7db2b679310bcef1e9572", "totalChunks": 6, "documentTitle": "Arogya Karnataka (Ayushman Bharat — SAST)", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.59989+00
d6bfcf07-349e-4047-9aa2-c9fd9591be36	arogya-karnataka	ಆರೋಗ್ಯ ಕರ್ನಾಟಕ — ಸುವರ್ಣ ಆರೋಗ್ಯ ಸುರಕ್ಷಾ ಟ್ರಸ್ಟ್ (SAST)	ಯೋಜನೆಯ ಹೆಸರು: ಆರೋಗ್ಯ ಕರ್ನಾಟಕ — ಸುವರ್ಣ ಆರೋಗ್ಯ ಸುರಕ್ಷಾ ಟ್ರಸ್ಟ್ (SAST) ಇಲಾಖೆ: ಆರೋಗ್ಯ ಮತ್ತು ಕುಟುಂಬ ಕಲ್ಯಾಣ ಇಲಾಖೆ / ಸುವರ್ಣ ಆರೋಗ್ಯ ಸುರಕ್ಷಾ ಟ್ರಸ್ಟ್ ವರ್ಗ: health ಅಧಿಕೃತ ಪೋರ್ಟಲ್: https://arogya.karnataka.gov.in ಸಹಾಯವಾಣಿ: ಜನಸ್ಪಂದನ 1902	https://arogya.karnataka.gov.in	{"page": 1, "section": "ಯೋಜನೆ: ಆರೋಗ್ಯ ಕರ್ನಾಟಕ — ಸುವರ್ಣ ಆರೋಗ್ಯ ಸುರಕ್ಷಾ ಟ್ರಸ್ಟ್ (SAST)", "language": "kn", "createdAt": "2026-11-10T15:54:08.357Z", "chunkIndex": 0, "department": "ಆರೋಗ್ಯ ಮತ್ತು ಕುಟುಂಬ ಕಲ್ಯಾಣ ಇಲಾಖೆ / ಸುವರ್ಣ ಆರೋಗ್ಯ ಸುರಕ್ಷಾ ಟ್ರಸ್ಟ್", "documentId": "scheme-arogya-karnataka-kn", "contentHash": "5825607e3a73769883d59ffcf68e7fa3487654457ee9db83108e26b05dc53207", "totalChunks": 5, "documentTitle": "ಆರೋಗ್ಯ ಕರ್ನಾಟಕ — ಸುವರ್ಣ ಆರೋಗ್ಯ ಸುರಕ್ಷಾ ಟ್ರಸ್ಟ್ (SAST)", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.602554+00
0af3bb6e-2362-45be-b4cc-9fb70c7a2508	arogya-karnataka	ಆರೋಗ್ಯ ಕರ್ನಾಟಕ — ಸುವರ್ಣ ಆರೋಗ್ಯ ಸುರಕ್ಷಾ ಟ್ರಸ್ಟ್ (SAST)	ನೊಂದಾಯಿತ ಸರ್ಕಾರಿ ಮತ್ತು ಖಾಸಗಿ ಆಸ್ಪತ್ರೆಗಳಲ್ಲಿ ವಾರ್ಷಿಕ ₹5 ಲಕ್ಷದವರೆಗೆ ನಗದು ರಹಿತ ಚಿಕಿತ್ಸೆ.	https://arogya.karnataka.gov.in	{"page": 1, "section": "ಸೌಲಭ್ಯಗಳು ಮತ್ತು ಆರ್ಥಿಕ ನೆರವು", "language": "kn", "createdAt": "2026-11-10T15:54:08.357Z", "chunkIndex": 1, "department": "ಆರೋಗ್ಯ ಮತ್ತು ಕುಟುಂಬ ಕಲ್ಯಾಣ ಇಲಾಖೆ / ಸುವರ್ಣ ಆರೋಗ್ಯ ಸುರಕ್ಷಾ ಟ್ರಸ್ಟ್", "documentId": "scheme-arogya-karnataka-kn", "contentHash": "fff43b3c02c5306006ae08567ecaa05100c92766894b200a2446c521f42bcd8b", "totalChunks": 5, "documentTitle": "ಆರೋಗ್ಯ ಕರ್ನಾಟಕ — ಸುವರ್ಣ ಆರೋಗ್ಯ ಸುರಕ್ಷಾ ಟ್ರಸ್ಟ್ (SAST)", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.60562+00
2ee28bc7-97dc-49e7-b62f-e1dc32a326de	arogya-karnataka	ಆರೋಗ್ಯ ಕರ್ನಾಟಕ — ಸುವರ್ಣ ಆರೋಗ್ಯ ಸುರಕ್ಷಾ ಟ್ರಸ್ಟ್ (SAST)	- Permanent resident of Karnataka. - Must possess an active BPL / PHH Ration Card for 100% free treatment or APL Card for co-payment. - Referral from Government Primary Health Centre (PHC) / Taluk Hospital required for non-emergency tertiary care.	https://arogya.karnataka.gov.in	{"page": 1, "section": "ಅರ್ಹತಾ ಮಾನದಂಡಗಳು", "language": "kn", "createdAt": "2026-11-10T15:54:08.357Z", "chunkIndex": 2, "department": "ಆರೋಗ್ಯ ಮತ್ತು ಕುಟುಂಬ ಕಲ್ಯಾಣ ಇಲಾಖೆ / ಸುವರ್ಣ ಆರೋಗ್ಯ ಸುರಕ್ಷಾ ಟ್ರಸ್ಟ್", "documentId": "scheme-arogya-karnataka-kn", "contentHash": "9eb2e50b18beba480f1ef5e63b9702baa1876d6441ab4753c3b90e3bed8dbe50", "totalChunks": 5, "documentTitle": "ಆರೋಗ್ಯ ಕರ್ನಾಟಕ — ಸುವರ್ಣ ಆರೋಗ್ಯ ಸುರಕ್ಷಾ ಟ್ರಸ್ಟ್ (SAST)", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.608087+00
687412e2-90b6-4421-87bf-bd182f595af8	msme-artisan-subsidy	Dr. B.R. Ambedkar Rural Micro-Enterprise & Artisan Subsidy	- Prepare artisan trade details and estimated project equipment costs in ArivuNet. - Obtain Caste and Income certificate from Nadakacheri. - Submit application online via Seva Sindhu or through Dr. B.R. Ambedkar Development Corporation district office. - District selection committee interviews candidates and sanctions soft loan + 50% capital subsidy with partner bank.	https://adcl.karnataka.gov.in	{"page": 1, "section": "Application Procedure and Official Portals", "language": "en", "createdAt": "2026-11-10T15:54:08.357Z", "chunkIndex": 5, "department": "Commerce and Industries / Development Corporations", "documentId": "scheme-msme-artisan-subsidy-en", "contentHash": "ac3d7f6e4f65243d4c7c48a71108624c20ddad0ecec4dd83b5a1711cbd251d06", "totalChunks": 6, "documentTitle": "Dr. B.R. Ambedkar Rural Micro-Enterprise & Artisan Subsidy", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.63041+00
b691e687-83fb-413c-8b7e-41c76a73baee	arogya-karnataka	ಆರೋಗ್ಯ ಕರ್ನಾಟಕ — ಸುವರ್ಣ ಆರೋಗ್ಯ ಸುರಕ್ಷಾ ಟ್ರಸ್ಟ್ (SAST)	- Karnataka Ration Card (BPL / APL) - Aadhaar Card of the patient and family head - Government Hospital Referral Slip (for tertiary treatment)	https://arogya.karnataka.gov.in	{"page": 1, "section": "ಅಗತ್ಯ ದಾಖಲೆಗಳು", "language": "kn", "createdAt": "2026-11-10T15:54:08.357Z", "chunkIndex": 3, "department": "ಆರೋಗ್ಯ ಮತ್ತು ಕುಟುಂಬ ಕಲ್ಯಾಣ ಇಲಾಖೆ / ಸುವರ್ಣ ಆರೋಗ್ಯ ಸುರಕ್ಷಾ ಟ್ರಸ್ಟ್", "documentId": "scheme-arogya-karnataka-kn", "contentHash": "90824313c811a7d954ca6aa9c52988468dfe0745a7720921b471ef56d5401830", "totalChunks": 5, "documentTitle": "ಆರೋಗ್ಯ ಕರ್ನಾಟಕ — ಸುವರ್ಣ ಆರೋಗ್ಯ ಸುರಕ್ಷಾ ಟ್ರಸ್ಟ್ (SAST)", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.610446+00
36cbfd14-6f46-4841-a395-1d364775a550	arogya-karnataka	ಆರೋಗ್ಯ ಕರ್ನಾಟಕ — ಸುವರ್ಣ ಆರೋಗ್ಯ ಸುರಕ್ಷಾ ಟ್ರಸ್ಟ್ (SAST)	- Visit your local Government Primary Health Centre (PHC) or General Hospital with your Ration Card and Aadhaar. - Primary doctor evaluates medical condition and provides an online referral slip (SAST referral) for tertiary care. - Present referral slip and Ration Card at any empanelled government or private super-specialty hospital. - Arogya Mitra desk at the hospital registers patient and processes cashless treatment package up to ₹5 lakh for BPL.	https://arogya.karnataka.gov.in	{"page": 1, "section": "ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ವಿಧಾನ ಮತ್ತು ಅಧಿಕೃತ ಸಂಪರ್ಕ", "language": "kn", "createdAt": "2026-11-10T15:54:08.357Z", "chunkIndex": 4, "department": "ಆರೋಗ್ಯ ಮತ್ತು ಕುಟುಂಬ ಕಲ್ಯಾಣ ಇಲಾಖೆ / ಸುವರ್ಣ ಆರೋಗ್ಯ ಸುರಕ್ಷಾ ಟ್ರಸ್ಟ್", "documentId": "scheme-arogya-karnataka-kn", "contentHash": "72b709904edea3f89c42b5ba252c162d14ac03485aae771b3e0c7f12e0a581d4", "totalChunks": 5, "documentTitle": "ಆರೋಗ್ಯ ಕರ್ನಾಟಕ — ಸುವರ್ಣ ಆರೋಗ್ಯ ಸುರಕ್ಷಾ ಟ್ರಸ್ಟ್ (SAST)", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.61338+00
987ac14a-7041-416b-a0cf-8a27793f0c41	msme-artisan-subsidy	Dr. B.R. Ambedkar Rural Micro-Enterprise & Artisan Subsidy	Scheme Name: Dr. B.R. Ambedkar Rural Micro-Enterprise & Artisan Subsidy Department: Commerce and Industries / Development Corporations Category: business Official Portal: https://adcl.karnataka.gov.in Department Helpline: Janaspandana 1902	https://adcl.karnataka.gov.in	{"page": 1, "section": "Scheme: Dr. B.R. Ambedkar Rural Micro-Enterprise & Artisan Subsidy", "language": "en", "createdAt": "2026-11-10T15:54:08.357Z", "chunkIndex": 0, "department": "Commerce and Industries / Development Corporations", "documentId": "scheme-msme-artisan-subsidy-en", "contentHash": "5d7ef307575182c64c86d7e8e255c6918fec2aea9742b9f297680b24d2474934", "totalChunks": 6, "documentTitle": "Dr. B.R. Ambedkar Rural Micro-Enterprise & Artisan Subsidy", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.616266+00
80d6fd02-f2ec-445d-b5bc-12880652a258	msme-artisan-subsidy	Dr. B.R. Ambedkar Rural Micro-Enterprise & Artisan Subsidy	Details unavailable.	https://adcl.karnataka.gov.in	{"page": 1, "section": "Overview and Objectives", "language": "en", "createdAt": "2026-11-10T15:54:08.357Z", "chunkIndex": 1, "department": "Commerce and Industries / Development Corporations", "documentId": "scheme-msme-artisan-subsidy-en", "contentHash": "be9310f7d4f2f11d1a0b5450ad0d42f76a32d10e8a027f63957b139461e9c798", "totalChunks": 6, "documentTitle": "Dr. B.R. Ambedkar Rural Micro-Enterprise & Artisan Subsidy", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.618718+00
b368ca18-fc55-47da-9aa6-3bd083efdad2	msme-artisan-subsidy	Dr. B.R. Ambedkar Rural Micro-Enterprise & Artisan Subsidy	50% capital subsidy (up to ₹2,00,000) combined with bank soft loan at concessional interest.	https://adcl.karnataka.gov.in	{"page": 1, "section": "Benefits and Financial Assistance", "language": "en", "createdAt": "2026-11-10T15:54:08.357Z", "chunkIndex": 2, "department": "Commerce and Industries / Development Corporations", "documentId": "scheme-msme-artisan-subsidy-en", "contentHash": "3cf4602dfca16d5b87202a64ee0741362baefc5144461566036cdf506f035b0a", "totalChunks": 6, "documentTitle": "Dr. B.R. Ambedkar Rural Micro-Enterprise & Artisan Subsidy", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.622057+00
1662ca78-b542-4a93-aed9-f42b9ad29d34	msme-artisan-subsidy	Dr. B.R. Ambedkar Rural Micro-Enterprise & Artisan Subsidy	- Applicant must be aged 18 to 55 years and a permanent resident of Karnataka. - Must have skill or vocational experience in proposed trade or artisan activity. - Annual household income must be below ₹2.0 lakh in rural areas. - Must not have defaulted on any commercial or cooperative bank loan.	https://adcl.karnataka.gov.in	{"page": 1, "section": "Eligibility Criteria", "language": "en", "createdAt": "2026-11-10T15:54:08.357Z", "chunkIndex": 3, "department": "Commerce and Industries / Development Corporations", "documentId": "scheme-msme-artisan-subsidy-en", "contentHash": "a2b0335941f7307c47f711bfacf360c98dca20c6f14cc2a60aeeda5d57a69070", "totalChunks": 6, "documentTitle": "Dr. B.R. Ambedkar Rural Micro-Enterprise & Artisan Subsidy", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.62473+00
dcbf8c01-f23d-4ccc-b95f-f70b10cc448e	msme-artisan-subsidy	Dr. B.R. Ambedkar Rural Micro-Enterprise & Artisan Subsidy	- Aadhaar Card and Voter ID - Caste and Income Certificate issued by Revenue Authority - Artisan Identity Card / Skill Training Certificate (if available) - Detailed Project Cost Estimate for tools/equipment - Gram Panchayat trade endorsement or premises proof	https://adcl.karnataka.gov.in	{"page": 1, "section": "Required Documents", "language": "en", "createdAt": "2026-11-10T15:54:08.357Z", "chunkIndex": 4, "department": "Commerce and Industries / Development Corporations", "documentId": "scheme-msme-artisan-subsidy-en", "contentHash": "121f4b4c9552fbbf7275f5e020eb80b3c783a4f92d275b78e0e52a7ea4a089c8", "totalChunks": 6, "documentTitle": "Dr. B.R. Ambedkar Rural Micro-Enterprise & Artisan Subsidy", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.627432+00
8a2feadf-529c-4d5e-90d9-aff9adb6f56f	kaveri-ec-services	Kaveri 2.0 — Property Encumbrance Certificate (EC) & Deeds	Details unavailable.	https://kaverionline.karnataka.gov.in	{"page": 1, "section": "Overview and Objectives", "language": "en", "createdAt": "2026-11-10T15:54:08.357Z", "chunkIndex": 1, "department": "Department of Stamps and Registration", "documentId": "scheme-kaveri-ec-services-en", "contentHash": "ac4be3725cbf9aa54b5c2a67d6f65e9ec4b30332fabf77a0254ca393c872aa07", "totalChunks": 6, "documentTitle": "Kaveri 2.0 — Property Encumbrance Certificate (EC) & Deeds", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.649389+00
227343d8-dacc-4bc8-8e83-99b26e055d23	msme-artisan-subsidy	ಗ್ರಾಮೀಣ ಕರಕುಶಲ ಮತ್ತು ಕಿರು ಉದ್ಯಮ ಸಹಾಯಧನ ಯೋಜನೆ	ಯೋಜನೆಯ ಹೆಸರು: ಗ್ರಾಮೀಣ ಕರಕುಶಲ ಮತ್ತು ಕಿರು ಉದ್ಯಮ ಸಹಾಯಧನ ಯೋಜನೆ ಇಲಾಖೆ: ವಾಣಿಜ್ಯ ಮತ್ತು ಕೈಗಾರಿಕೆ ಇಲಾಖೆ / ಡಾ. ಬಿ.ಆರ್. ಅಂಬೇಡ್ಕರ್ ಅಭಿವೃದ್ಧಿ ನಿಗಮ ವರ್ಗ: business ಅಧಿಕೃತ ಪೋರ್ಟಲ್: https://adcl.karnataka.gov.in ಸಹಾಯವಾಣಿ: ಜನಸ್ಪಂದನ 1902	https://adcl.karnataka.gov.in	{"page": 1, "section": "ಯೋಜನೆ: ಗ್ರಾಮೀಣ ಕರಕುಶಲ ಮತ್ತು ಕಿರು ಉದ್ಯಮ ಸಹಾಯಧನ ಯೋಜನೆ", "language": "kn", "createdAt": "2026-11-10T15:54:08.357Z", "chunkIndex": 0, "department": "ವಾಣಿಜ್ಯ ಮತ್ತು ಕೈಗಾರಿಕೆ ಇಲಾಖೆ / ಡಾ. ಬಿ.ಆರ್. ಅಂಬೇಡ್ಕರ್ ಅಭಿವೃದ್ಧಿ ನಿಗಮ", "documentId": "scheme-msme-artisan-subsidy-kn", "contentHash": "d6302c0cec9b2710a8ef4c2f07e6e4519998c3d98ed8ec94b113798124e55f16", "totalChunks": 5, "documentTitle": "ಗ್ರಾಮೀಣ ಕರಕುಶಲ ಮತ್ತು ಕಿರು ಉದ್ಯಮ ಸಹಾಯಧನ ಯೋಜನೆ", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.632947+00
3d344da0-871c-4e9c-bece-5f1ccbc5fe4b	msme-artisan-subsidy	ಗ್ರಾಮೀಣ ಕರಕುಶಲ ಮತ್ತು ಕಿರು ಉದ್ಯಮ ಸಹಾಯಧನ ಯೋಜನೆ	ಶೇ.50 ರವರೆಗೆ ನೇರ ಬಂಡವಾಳ ಸಹಾಯಧನ ಮತ್ತು ಬ್ಯಾಂಕ್ ಸಾಲ ಸೌಲಭ್ಯ.	https://adcl.karnataka.gov.in	{"page": 1, "section": "ಸೌಲಭ್ಯಗಳು ಮತ್ತು ಆರ್ಥಿಕ ನೆರವು", "language": "kn", "createdAt": "2026-11-10T15:54:08.357Z", "chunkIndex": 1, "department": "ವಾಣಿಜ್ಯ ಮತ್ತು ಕೈಗಾರಿಕೆ ಇಲಾಖೆ / ಡಾ. ಬಿ.ಆರ್. ಅಂಬೇಡ್ಕರ್ ಅಭಿವೃದ್ಧಿ ನಿಗಮ", "documentId": "scheme-msme-artisan-subsidy-kn", "contentHash": "09e4fb1cf6145600a08f7d3f35229d3fe79f03a0a458e3f1970107ea0be162bf", "totalChunks": 5, "documentTitle": "ಗ್ರಾಮೀಣ ಕರಕುಶಲ ಮತ್ತು ಕಿರು ಉದ್ಯಮ ಸಹಾಯಧನ ಯೋಜನೆ", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.635441+00
14a586ee-2afe-429d-9b4d-f260df197cb8	msme-artisan-subsidy	ಗ್ರಾಮೀಣ ಕರಕುಶಲ ಮತ್ತು ಕಿರು ಉದ್ಯಮ ಸಹಾಯಧನ ಯೋಜನೆ	- Applicant must be aged 18 to 55 years and a permanent resident of Karnataka. - Must have skill or vocational experience in proposed trade or artisan activity. - Annual household income must be below ₹2.0 lakh in rural areas. - Must not have defaulted on any commercial or cooperative bank loan.	https://adcl.karnataka.gov.in	{"page": 1, "section": "ಅರ್ಹತಾ ಮಾನದಂಡಗಳು", "language": "kn", "createdAt": "2026-11-10T15:54:08.357Z", "chunkIndex": 2, "department": "ವಾಣಿಜ್ಯ ಮತ್ತು ಕೈಗಾರಿಕೆ ಇಲಾಖೆ / ಡಾ. ಬಿ.ಆರ್. ಅಂಬೇಡ್ಕರ್ ಅಭಿವೃದ್ಧಿ ನಿಗಮ", "documentId": "scheme-msme-artisan-subsidy-kn", "contentHash": "332251e37e3ad2c9dbcd8b5908ee9634ad3369c81b640e6f33e76a494bb1f8ee", "totalChunks": 5, "documentTitle": "ಗ್ರಾಮೀಣ ಕರಕುಶಲ ಮತ್ತು ಕಿರು ಉದ್ಯಮ ಸಹಾಯಧನ ಯೋಜನೆ", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.638415+00
058047e8-258c-4d73-b07a-e98a024e0f94	msme-artisan-subsidy	ಗ್ರಾಮೀಣ ಕರಕುಶಲ ಮತ್ತು ಕಿರು ಉದ್ಯಮ ಸಹಾಯಧನ ಯೋಜನೆ	- Aadhaar Card and Voter ID - Caste and Income Certificate issued by Revenue Authority - Artisan Identity Card / Skill Training Certificate (if available) - Detailed Project Cost Estimate for tools/equipment - Gram Panchayat trade endorsement or premises proof	https://adcl.karnataka.gov.in	{"page": 1, "section": "ಅಗತ್ಯ ದಾಖಲೆಗಳು", "language": "kn", "createdAt": "2026-11-10T15:54:08.357Z", "chunkIndex": 3, "department": "ವಾಣಿಜ್ಯ ಮತ್ತು ಕೈಗಾರಿಕೆ ಇಲಾಖೆ / ಡಾ. ಬಿ.ಆರ್. ಅಂಬೇಡ್ಕರ್ ಅಭಿವೃದ್ಧಿ ನಿಗಮ", "documentId": "scheme-msme-artisan-subsidy-kn", "contentHash": "4c1ab0db318f682ca49a486272cb6171e2c81bb6d191634ad046c17c3cb227bd", "totalChunks": 5, "documentTitle": "ಗ್ರಾಮೀಣ ಕರಕುಶಲ ಮತ್ತು ಕಿರು ಉದ್ಯಮ ಸಹಾಯಧನ ಯೋಜನೆ", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.641393+00
3b85c018-a7ee-4fcd-84ec-1ef42c66243a	msme-artisan-subsidy	ಗ್ರಾಮೀಣ ಕರಕುಶಲ ಮತ್ತು ಕಿರು ಉದ್ಯಮ ಸಹಾಯಧನ ಯೋಜನೆ	- Prepare artisan trade details and estimated project equipment costs in ArivuNet. - Obtain Caste and Income certificate from Nadakacheri. - Submit application online via Seva Sindhu or through Dr. B.R. Ambedkar Development Corporation district office. - District selection committee interviews candidates and sanctions soft loan + 50% capital subsidy with partner bank.	https://adcl.karnataka.gov.in	{"page": 1, "section": "ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ವಿಧಾನ ಮತ್ತು ಅಧಿಕೃತ ಸಂಪರ್ಕ", "language": "kn", "createdAt": "2026-11-10T15:54:08.357Z", "chunkIndex": 4, "department": "ವಾಣಿಜ್ಯ ಮತ್ತು ಕೈಗಾರಿಕೆ ಇಲಾಖೆ / ಡಾ. ಬಿ.ಆರ್. ಅಂಬೇಡ್ಕರ್ ಅಭಿವೃದ್ಧಿ ನಿಗಮ", "documentId": "scheme-msme-artisan-subsidy-kn", "contentHash": "4b60b4b1771a45a44e9342565edd9ef10f776202acb36c6b6a3afe5764dd5a3b", "totalChunks": 5, "documentTitle": "ಗ್ರಾಮೀಣ ಕರಕುಶಲ ಮತ್ತು ಕಿರು ಉದ್ಯಮ ಸಹಾಯಧನ ಯೋಜನೆ", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.644152+00
36ff1ff9-9217-412c-8eb7-2d73a92645b5	kaveri-ec-services	Kaveri 2.0 — Property Encumbrance Certificate (EC) & Deeds	Scheme Name: Kaveri 2.0 — Property Encumbrance Certificate (EC) & Deeds Department: Department of Stamps and Registration Category: it_services Official Portal: https://kaverionline.karnataka.gov.in Department Helpline: Janaspandana 1902	https://kaverionline.karnataka.gov.in	{"page": 1, "section": "Scheme: Kaveri 2.0 — Property Encumbrance Certificate (EC) & Deeds", "language": "en", "createdAt": "2026-11-10T15:54:08.357Z", "chunkIndex": 0, "department": "Department of Stamps and Registration", "documentId": "scheme-kaveri-ec-services-en", "contentHash": "788d8deb534e65b1f6410728f5727f907f78e3cae7692c558cd2060b72db8dfc", "totalChunks": 6, "documentTitle": "Kaveri 2.0 — Property Encumbrance Certificate (EC) & Deeds", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.646734+00
a6f0970a-eded-4d95-9998-fef902e8b63f	kaveri-ec-services	Kaveri 2.0 — Property Encumbrance Certificate (EC) & Deeds	Cryptographically signed digital Encumbrance Certificate legally valid for bank loans and registration.	https://kaverionline.karnataka.gov.in	{"page": 1, "section": "Benefits and Financial Assistance", "language": "en", "createdAt": "2026-11-10T15:54:08.357Z", "chunkIndex": 2, "department": "Department of Stamps and Registration", "documentId": "scheme-kaveri-ec-services-en", "contentHash": "80ba7f2d93a3de49f41f07c688ca5bd9d430b5a5d63254ee53455995bba52261", "totalChunks": 6, "documentTitle": "Kaveri 2.0 — Property Encumbrance Certificate (EC) & Deeds", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.651891+00
4c4fe035-b5d8-4f28-b583-5dddd09935b9	kaveri-ec-services	Kaveri 2.0 — Property Encumbrance Certificate (EC) & Deeds	- Any citizen possessing property survey number, village/ward details, or registration deed number. - No income restriction applies.	https://kaverionline.karnataka.gov.in	{"page": 1, "section": "Eligibility Criteria", "language": "en", "createdAt": "2026-11-10T15:54:08.357Z", "chunkIndex": 3, "department": "Department of Stamps and Registration", "documentId": "scheme-kaveri-ec-services-en", "contentHash": "be79407a833f6dacca0d14f35e722b62e344756bf6b7bb472998ec4f2e74dce8", "totalChunks": 6, "documentTitle": "Kaveri 2.0 — Property Encumbrance Certificate (EC) & Deeds", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.655061+00
79e842e2-f5f8-45cc-b320-8d0c2792c456	kaveri-ec-services	Kaveri 2.0 — Property Encumbrance Certificate (EC) & Deeds	- Property Survey Number / Municipal Khata Number - Name of Property Owner as per Registration Record - Sub-Registrar Office (SRO) jurisdiction name - Applicant Aadhaar or Mobile Number	https://kaverionline.karnataka.gov.in	{"page": 1, "section": "Required Documents", "language": "en", "createdAt": "2026-11-10T15:54:08.357Z", "chunkIndex": 4, "department": "Department of Stamps and Registration", "documentId": "scheme-kaveri-ec-services-en", "contentHash": "972e7f1806345175ac1ad04c212e9a6fd67d71aa3cb5522638058436b0ed22ae", "totalChunks": 6, "documentTitle": "Kaveri 2.0 — Property Encumbrance Certificate (EC) & Deeds", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.658059+00
9da837c9-86db-43bc-8730-fc783ee84086	kaveri-ec-services	Kaveri 2.0 — Property Encumbrance Certificate (EC) & Deeds	- Locate your property survey number or municipal khata number and Sub-Registrar Office jurisdiction. - Draft your search period in ArivuNet. - Apply online on Kaveri 2.0 portal (kaverionline.karnataka.gov.in). - Pay prescribed nominal government search fee online and download cryptographically signed digital Encumbrance Certificate (Form 15/16).	https://kaverionline.karnataka.gov.in	{"page": 1, "section": "Application Procedure and Official Portals", "language": "en", "createdAt": "2026-11-10T15:54:08.357Z", "chunkIndex": 5, "department": "Department of Stamps and Registration", "documentId": "scheme-kaveri-ec-services-en", "contentHash": "eb86a58f2ee016faae64fa385920bef44cee04ca599068165996af8b1c071d56", "totalChunks": 6, "documentTitle": "Kaveri 2.0 — Property Encumbrance Certificate (EC) & Deeds", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.660708+00
a9021fba-bc57-4d70-85fd-ba2a6ceb720d	kaveri-ec-services	ಕಾವೇರಿ 2.0 — ಋಣಭಾರ ಪ್ರಮಾಣಪತ್ರ (EC) ಮತ್ತು ನೋಂದಾಯಿತ ಪತ್ರಗಳು	ಯೋಜನೆಯ ಹೆಸರು: ಕಾವೇರಿ 2.0 — ಋಣಭಾರ ಪ್ರಮಾಣಪತ್ರ (EC) ಮತ್ತು ನೋಂದಾಯಿತ ಪತ್ರಗಳು ಇಲಾಖೆ: ನೋಂದಣಿ ಮತ್ತು ಮುದ್ರಾಂಕ ಇಲಾಖೆ, ಕರ್ನಾಟಕ ಸರ್ಕಾರ ವರ್ಗ: it_services ಅಧಿಕೃತ ಪೋರ್ಟಲ್: https://kaverionline.karnataka.gov.in ಸಹಾಯವಾಣಿ: ಜನಸ್ಪಂದನ 1902	https://kaverionline.karnataka.gov.in	{"page": 1, "section": "ಯೋಜನೆ: ಕಾವೇರಿ 2.0 — ಋಣಭಾರ ಪ್ರಮಾಣಪತ್ರ (EC) ಮತ್ತು ನೋಂದಾಯಿತ ಪತ್ರಗಳು", "language": "kn", "createdAt": "2026-11-10T15:54:08.358Z", "chunkIndex": 0, "department": "ನೋಂದಣಿ ಮತ್ತು ಮುದ್ರಾಂಕ ಇಲಾಖೆ, ಕರ್ನಾಟಕ ಸರ್ಕಾರ", "documentId": "scheme-kaveri-ec-services-kn", "contentHash": "fe6df04d83348ac8bf141210d158a51de1daf67adec8ad08dd212e8825a151b2", "totalChunks": 5, "documentTitle": "ಕಾವೇರಿ 2.0 — ಋಣಭಾರ ಪ್ರಮಾಣಪತ್ರ (EC) ಮತ್ತು ನೋಂದಾಯಿತ ಪತ್ರಗಳು", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.663276+00
af774e35-06ae-46ce-b83f-08a7e42ae796	kaveri-ec-services	ಕಾವೇರಿ 2.0 — ಋಣಭಾರ ಪ್ರಮಾಣಪತ್ರ (EC) ಮತ್ತು ನೋಂದಾಯಿತ ಪತ್ರಗಳು	ಡಿಜಿಟಲ್ ಸಹಿ ಹೊಂದಿದ ಮಾನ್ಯತೆ ಪಡೆದ ಋಣಭಾರ ಪ್ರಮಾಣಪತ್ರ (EC).	https://kaverionline.karnataka.gov.in	{"page": 1, "section": "ಸೌಲಭ್ಯಗಳು ಮತ್ತು ಆರ್ಥಿಕ ನೆರವು", "language": "kn", "createdAt": "2026-11-10T15:54:08.358Z", "chunkIndex": 1, "department": "ನೋಂದಣಿ ಮತ್ತು ಮುದ್ರಾಂಕ ಇಲಾಖೆ, ಕರ್ನಾಟಕ ಸರ್ಕಾರ", "documentId": "scheme-kaveri-ec-services-kn", "contentHash": "1f4f8d03b40bd67f8d088cd35a09fd2d54b8c027a485b9ee5fe0af901ea8eb1b", "totalChunks": 5, "documentTitle": "ಕಾವೇರಿ 2.0 — ಋಣಭಾರ ಪ್ರಮಾಣಪತ್ರ (EC) ಮತ್ತು ನೋಂದಾಯಿತ ಪತ್ರಗಳು", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.666829+00
231da361-14c4-40eb-8cfa-bd4d9fd35b30	kaveri-ec-services	ಕಾವೇರಿ 2.0 — ಋಣಭಾರ ಪ್ರಮಾಣಪತ್ರ (EC) ಮತ್ತು ನೋಂದಾಯಿತ ಪತ್ರಗಳು	- Any citizen possessing property survey number, village/ward details, or registration deed number. - No income restriction applies.	https://kaverionline.karnataka.gov.in	{"page": 1, "section": "ಅರ್ಹತಾ ಮಾನದಂಡಗಳು", "language": "kn", "createdAt": "2026-11-10T15:54:08.358Z", "chunkIndex": 2, "department": "ನೋಂದಣಿ ಮತ್ತು ಮುದ್ರಾಂಕ ಇಲಾಖೆ, ಕರ್ನಾಟಕ ಸರ್ಕಾರ", "documentId": "scheme-kaveri-ec-services-kn", "contentHash": "ff34c6b01dbf8f9e0f27e9b0ddca937087fdc4cfcb85a28cc5391a725daf5a0b", "totalChunks": 5, "documentTitle": "ಕಾವೇರಿ 2.0 — ಋಣಭಾರ ಪ್ರಮಾಣಪತ್ರ (EC) ಮತ್ತು ನೋಂದಾಯಿತ ಪತ್ರಗಳು", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.669529+00
a48314f4-3349-4beb-b173-5f529526d3cf	kaveri-ec-services	ಕಾವೇರಿ 2.0 — ಋಣಭಾರ ಪ್ರಮಾಣಪತ್ರ (EC) ಮತ್ತು ನೋಂದಾಯಿತ ಪತ್ರಗಳು	- Property Survey Number / Municipal Khata Number - Name of Property Owner as per Registration Record - Sub-Registrar Office (SRO) jurisdiction name - Applicant Aadhaar or Mobile Number	https://kaverionline.karnataka.gov.in	{"page": 1, "section": "ಅಗತ್ಯ ದಾಖಲೆಗಳು", "language": "kn", "createdAt": "2026-11-10T15:54:08.358Z", "chunkIndex": 3, "department": "ನೋಂದಣಿ ಮತ್ತು ಮುದ್ರಾಂಕ ಇಲಾಖೆ, ಕರ್ನಾಟಕ ಸರ್ಕಾರ", "documentId": "scheme-kaveri-ec-services-kn", "contentHash": "dca82b76f2d112e8501e3d6bb999fb5c65105e2de41fe3af87fe55e674e230fa", "totalChunks": 5, "documentTitle": "ಕಾವೇರಿ 2.0 — ಋಣಭಾರ ಪ್ರಮಾಣಪತ್ರ (EC) ಮತ್ತು ನೋಂದಾಯಿತ ಪತ್ರಗಳು", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.672717+00
5cf79d3c-a78a-4897-851e-92bced76ebb6	kaveri-ec-services	ಕಾವೇರಿ 2.0 — ಋಣಭಾರ ಪ್ರಮಾಣಪತ್ರ (EC) ಮತ್ತು ನೋಂದಾಯಿತ ಪತ್ರಗಳು	- Locate your property survey number or municipal khata number and Sub-Registrar Office jurisdiction. - Draft your search period in ArivuNet. - Apply online on Kaveri 2.0 portal (kaverionline.karnataka.gov.in). - Pay prescribed nominal government search fee online and download cryptographically signed digital Encumbrance Certificate (Form 15/16).	https://kaverionline.karnataka.gov.in	{"page": 1, "section": "ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ವಿಧಾನ ಮತ್ತು ಅಧಿಕೃತ ಸಂಪರ್ಕ", "language": "kn", "createdAt": "2026-11-10T15:54:08.358Z", "chunkIndex": 4, "department": "ನೋಂದಣಿ ಮತ್ತು ಮುದ್ರಾಂಕ ಇಲಾಖೆ, ಕರ್ನಾಟಕ ಸರ್ಕಾರ", "documentId": "scheme-kaveri-ec-services-kn", "contentHash": "3e1f0ceccb6be35f8211931b0f46b2247a480a508ccc3f26357cb4a924302d04", "totalChunks": 5, "documentTitle": "ಕಾವೇರಿ 2.0 — ಋಣಭಾರ ಪ್ರಮಾಣಪತ್ರ (EC) ಮತ್ತು ನೋಂದಾಯಿತ ಪತ್ರಗಳು", "lastVerifiedDate": null, "verificationStatus": "provisional_catalogue_entry"}	2026-11-10 15:54:08.67551+00
af7478eb-8a88-41bb-985b-14295c30f651	\N	Janaspandana Grievance Procedures	Citizens can lodge complaints via 1902 or Grama One.	https://ipgrs.karnataka.gov.in	{"page": 1, "section": "Grievance System", "language": "en", "createdAt": "2026-11-10T15:54:08.686Z", "chunkIndex": 0, "department": "Department of Personnel & Administrative Reforms", "documentId": "doc-218315782e385912", "contentHash": "a4f46c0b1a6f1fc34f3498f708fe58a4fcad5443c8a691a30988c67d7b29ec88", "totalChunks": 1, "documentTitle": "Janaspandana Grievance Procedures", "lastVerifiedDate": "2026-03-31", "verificationStatus": "officially_verified"}	2026-11-10 15:54:08.689026+00
\.


--
-- Data for Name: schemes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.schemes (id, title, department, category, description, eligibility_criteria, eligibility_rules, is_active, created_at, updated_at) FROM stdin;
old-age-pension	Senior Citizen Pension Scheme (Sandhya Suraksha)	Directorate of Social Security and Pensions, Revenue Dept.	citizen	Monthly subsistence pension of ₹1,200 for rural and urban elderly citizens aged 65 and above from economically weaker families.	Applicant must be 65 years of age or older.\nMust be a resident of Karnataka for at least 3 consecutive years.\nCombined annual income of applicant and spouse must be below ₹32,000 (rural) or ₹40,000 (urban).\nApplicant must not be receiving any other government, freedom fighter, or EPF pension.	{"minAge": 65, "maxIncome": 32000, "karnatakaResidentOnly": true}	t	2026-11-10 14:27:14.677885+00	2026-11-10 14:27:14.677885+00
rural-housing-assist	Rural Pucca Housing Grant (Basava Vasathi Yojana)	Rajiv Gandhi Housing Corporation Limited (RGHCL)	housing	Financial construction grant up to ₹1.20 lakh for economically backward rural families without permanent pucca dwelling units.	Applicant must be a permanent resident of a rural Gram Panchayat in Karnataka.\nFamily must hold an active BPL Ration Card.\nMust own a residential site / plot sanctioned by Gram Panchayat or ancestral land.\nMust not own any pucca residential house anywhere in India.\nAnnual household income must be below ₹32,000.	{"maxIncome": 32000, "requiresBpl": true, "requiresRural": true, "karnatakaResidentOnly": true}	t	2026-11-10 14:27:14.68314+00	2026-11-10 14:27:14.68314+00
ration-card-update	Priority Ration Card Services (Ahara / Food & Civil Supplies)	Food, Civil Supplies and Consumer Affairs Department	food	Addition of newborn child/spouse, member address updates, fair price shop transfer, and cardholder detail corrections on BPL/APL ration cards.	Applicant must already hold a valid Karnataka Ration Card number in Ahara database.\nFor adding child: Birth certificate with parents’ names matching ration card.\nFor adding spouse: Marriage certificate and NOC/deletion certificate from previous ration card.\nAll members must have individual biometric Aadhaar numbers.	{"karnatakaResidentOnly": true}	t	2026-11-10 14:27:14.68858+00	2026-11-10 14:27:14.68858+00
gruha-lakshmi	Gruha Lakshmi Scheme (₹2,000 Monthly DBT)	Department of Women and Child Development	citizen	Direct monthly financial entitlement of ₹2,000 credited to the bank account of the designated woman head of household in BPL/APL families.	Applicant must be designated as the woman head of family on the ration card.\nOnly one woman per household is eligible.\nNeither the woman head of household nor her husband should be an income tax payer.\nNeither the woman nor her husband should be filing GST returns.	{"requiresFemaleHead": true, "karnatakaResidentOnly": true}	t	2026-11-10 14:27:14.6997+00	2026-11-10 14:27:14.6997+00
yuva-nidhi	Yuva Nidhi Scheme (Graduate & Diploma Stipend)	Department of Skill Development, Entrepreneurship and Livelihood	student	Monthly allowance of ₹3,000 for degree holders and ₹1,500 for diploma holders for up to two years during job-seeking and skill-upgradation.	Must have passed degree or diploma from a recognized university or board in Karnataka.\nMust have completed a minimum of 6 years of study in Karnataka (domicile requirement).\nMust have remained unemployed for at least 180 days after graduation results.\nMust not be pursuing higher education or employed in government/private sectors.\nMust not be self-employed or eligible for EPF/ESI benefits.	{"requiresStudent": false, "allowedOccupations": ["student"], "requiresUnemployed": true, "karnatakaResidentOnly": true}	t	2026-11-10 14:27:14.704882+00	2026-11-10 14:27:14.704882+00
ssp-scholarship	State Scholarship Portal (SSP) Post-Matric Scholarships	Social Welfare & Backward Classes Welfare Departments	student	Fee reimbursement, maintenance allowances, and examination fees for SC, ST, OBC, and minority students enrolled in post-matric colleges.	Applicant must be a bonafide student in a recognized Karnataka college / institute.\nMust possess a valid Student SATS ID / e-Attestation Number.\nAnnual family income ceiling: Up to ₹2.5 Lakh for SC/ST; Up to ₹1.0 Lakh for OBC (Cat-1, 2A, 2B, 3A, 3B).\nMust have verified Caste and Income Certificate RD numbers from Nadakacheri.	{"maxIncome": 250000, "requiresStudent": true, "allowedOccupations": ["student"], "karnatakaResidentOnly": true}	t	2026-11-10 14:27:14.710048+00	2026-11-10 14:27:14.710048+00
arogya-karnataka	Arogya Karnataka (Ayushman Bharat — SAST)	Health and Family Welfare / Suvarna Arogya Suraksha Trust	health	Cashless secondary and tertiary hospitalization cover up to ₹5 lakh per year per family for BPL families and subsidized co-payment for APL families.	Permanent resident of Karnataka.\nMust possess an active BPL / PHH Ration Card for 100% free treatment or APL Card for co-payment.\nReferral from Government Primary Health Centre (PHC) / Taluk Hospital required for non-emergency tertiary care.	{"karnatakaResidentOnly": true}	t	2026-11-10 14:27:14.715302+00	2026-11-10 14:27:14.715302+00
msme-artisan-subsidy	Dr. B.R. Ambedkar Rural Micro-Enterprise & Artisan Subsidy	Commerce and Industries / Development Corporations	business	Financial margin-money subsidy up to ₹2.0 lakh for rural artisans, traditional craftsmen, and small micro-enterprises setting up local production.	Applicant must be aged 18 to 55 years and a permanent resident of Karnataka.\nMust have skill or vocational experience in proposed trade or artisan activity.\nAnnual household income must be below ₹2.0 lakh in rural areas.\nMust not have defaulted on any commercial or cooperative bank loan.	{"maxAge": 55, "minAge": 18, "maxIncome": 200000, "karnatakaResidentOnly": true}	t	2026-11-10 14:27:14.72033+00	2026-11-10 14:27:14.72033+00
kaveri-ec-services	Kaveri 2.0 — Property Encumbrance Certificate (EC) & Deeds	Department of Stamps and Registration	it_services	Instant digital application for Encumbrance Certificate (EC Form 15/16) and certified copies of registered land/property sale deeds.	Any citizen possessing property survey number, village/ward details, or registration deed number.\nNo income restriction applies.	{"karnatakaResidentOnly": false}	t	2026-11-10 14:27:14.72634+00	2026-11-10 14:27:14.72634+00
agri-seed-subsidy	Farmer Seed Subsidy (Raitha Siri)	Department of Agriculture	farmer	Subsidized certified seeds distribution for small farmers.	Karnataka resident farmer registered in FRUITS.	{"requiresLand": true}	t	2026-11-10 14:27:14.598598+00	2026-11-10 15:53:34.470113+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, full_name, phone, role, village_panchayat, created_at, updated_at, password_hash, is_active) FROM stdin;
\.


--
-- Name: _schema_migrations _schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._schema_migrations
    ADD CONSTRAINT _schema_migrations_pkey PRIMARY KEY (id);


--
-- Name: application_status_history application_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_status_history
    ADD CONSTRAINT application_status_history_pkey PRIMARY KEY (id);


--
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: grievances grievances_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grievances
    ADD CONSTRAINT grievances_pkey PRIMARY KEY (id);


--
-- Name: knowledge_documents knowledge_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.knowledge_documents
    ADD CONSTRAINT knowledge_documents_pkey PRIMARY KEY (id);


--
-- Name: schemes schemes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schemes
    ADD CONSTRAINT schemes_pkey PRIMARY KEY (id);


--
-- Name: applications uq_applications_client_submission_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT uq_applications_client_submission_id UNIQUE (client_submission_id);


--
-- Name: grievances uq_grievances_client_submission_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grievances
    ADD CONSTRAINT uq_grievances_client_submission_id UNIQUE (client_submission_id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_applications_client_sub_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_applications_client_sub_id ON public.applications USING btree (client_submission_id);


--
-- Name: idx_applications_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_applications_created ON public.applications USING btree (created_at DESC);


--
-- Name: idx_applications_scheme; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_applications_scheme ON public.applications USING btree (scheme_id);


--
-- Name: idx_applications_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_applications_status ON public.applications USING btree (status);


--
-- Name: idx_applications_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_applications_user ON public.applications USING btree (user_id);


--
-- Name: idx_applications_user_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_applications_user_status ON public.applications USING btree (user_id, status);


--
-- Name: idx_audit_logs_action; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_action ON public.audit_logs USING btree (action);


--
-- Name: idx_audit_logs_actor; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_actor ON public.audit_logs USING btree (actor_id);


--
-- Name: idx_audit_logs_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_created ON public.audit_logs USING btree (created_at DESC);


--
-- Name: idx_grievances_client_sub_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_grievances_client_sub_id ON public.grievances USING btree (client_submission_id);


--
-- Name: idx_grievances_panchayat; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_grievances_panchayat ON public.grievances USING btree (village_panchayat);


--
-- Name: idx_grievances_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_grievances_status ON public.grievances USING btree (status);


--
-- Name: idx_grievances_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_grievances_user ON public.grievances USING btree (user_id);


--
-- Name: idx_knowledge_docs_scheme; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_knowledge_docs_scheme ON public.knowledge_documents USING btree (scheme_id);


--
-- Name: idx_schemes_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_schemes_active ON public.schemes USING btree (is_active);


--
-- Name: idx_schemes_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_schemes_category ON public.schemes USING btree (category);


--
-- Name: idx_status_history_app; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_status_history_app ON public.application_status_history USING btree (application_id);


--
-- Name: idx_users_phone; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_phone ON public.users USING btree (phone);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: application_status_history application_status_history_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_status_history
    ADD CONSTRAINT application_status_history_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.applications(id) ON DELETE CASCADE;


--
-- Name: application_status_history application_status_history_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_status_history
    ADD CONSTRAINT application_status_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: applications applications_scheme_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_scheme_id_fkey FOREIGN KEY (scheme_id) REFERENCES public.schemes(id) ON DELETE RESTRICT;


--
-- Name: applications applications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: audit_logs audit_logs_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: grievances grievances_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grievances
    ADD CONSTRAINT grievances_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: knowledge_documents knowledge_documents_scheme_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.knowledge_documents
    ADD CONSTRAINT knowledge_documents_scheme_id_fkey FOREIGN KEY (scheme_id) REFERENCES public.schemes(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict ZPUmUjVma69h73eReInypzRDsxe51XjOdMjDzdsEE2uJ4NEckrTIlKw6S8u5YEq

