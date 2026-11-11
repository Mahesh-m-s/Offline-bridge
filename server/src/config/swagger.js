/**
 * OfflineBridge — Centralized OpenAPI 3.0 / Swagger UI Specification & Setup
 * 
 * Provides interactive documentation and developer sandboxing for all 
 * OfflineBridge (ArivuNet) backend API endpoints.
 * 
 * Exposes:
 * - Interactive UI: GET /api-docs
 * - Raw OpenAPI JSON: GET /api-docs.json
 */

import swaggerUi from 'swagger-ui-express';
import { env } from './env.js';

export const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'OfflineBridge API — Karnataka Digital Public Infrastructure (DPI)',
    version: '0.1.0',
    description: `
**OfflineBridge (ArivuNet)** is an offline-first, resilient citizen services delivery platform designed for rural Karnataka citizens.

### Key Capabilities
- **1,060+ Verified Welfare Schemes & Services**: Database-driven catalog with bilingual English/Kannada metadata, eligibility criteria, and Sakala SLA tracking.
- **Offline Draft Preservation**: Client-side IndexedDB persistence with automatic sync bridge when connectivity returns.
- **Grounded RAG AI Assistant**: PostgreSQL pgvector semantic search over verified Karnataka government guidelines with grounded source citations.
- **Janaspandana Integrated Grievance Redressal**: Direct citizen complaint registration, reference tracking, and departmental scrutiny.
- **Strict Role-Based Access Control (RBAC)**: Secure separation between public citizens, departmental scrutiny officers, and platform administrators.

### Authentication
Protected endpoints require a standard HTTP **Bearer JWT** token passed in the \`Authorization\` header:
\`\`\`http
Authorization: Bearer <your_jwt_token>
\`\`\`
Use the **Authorize 🔓** button below to paste your JWT token obtained from \`POST /api/auth/login\` or \`POST /api/auth/register\`.
    `,
    contact: {
      name: 'OfflineBridge Public Infrastructure Desk',
      url: 'https://karnataka.gov.in',
      email: 'support@offlinebridge.internal'
    },
    license: {
      name: 'Karnataka Open e-Governance Public License',
      url: 'https://karnataka.gov.in'
    }
  },
  servers: [
    {
      url: '/',
      description: 'Current Environment API Server (Relative)'
    },
    {
      url: 'http://localhost:5000',
      description: 'Local Node.js Development Server'
    }
  ],
  tags: [
    { name: 'System & Health', description: 'Uptime checks, database connectivity, and runtime metrics' },
    { name: 'Authentication', description: 'Citizen registration, JWT login, profile resolution, and privileged user creation' },
    { name: 'User Management', description: 'RBAC user queries, profile updates, and role assignments' },
    { name: 'Schemes & Services', description: '1,060+ verified government schemes catalog, parameterized search, filtering, and stats' },
    { name: 'Schemes Governance', description: 'Ingestion job histories, data integrity audits, and manual sync triggers' },
    { name: 'Applications', description: 'Citizen welfare scheme application creation, drafts, and lifecycle tracking' },
    { name: 'Applications Scrutiny', description: 'Department officer queue review, verification, and status updates' },
    { name: 'Grievances', description: 'Janaspandana civic complaint submission and public reference tracking' },
    { name: 'Grievances Scrutiny', description: 'Official departmental resolution desk for public grievances' },
    { name: 'Offline Synchronization', description: 'Idempotent batch sync for offline client queues' },
    { name: 'RAG Assistant', description: 'Grounded semantic search and multilingual AI chatbot powered by pgvector' },
    { name: 'Knowledge Ingestion', description: 'Administrative document vectorization and catalogue synchronization' },
    { name: 'Audit & Governance', description: 'Chronological platform audit logging and security event inspection' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Paste your JWT token obtained from POST /api/auth/login or POST /api/auth/register (the "Bearer " prefix is attached automatically).'
      }
    },
    schemas: {
      ApiSuccess: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'object', description: 'Payload returned by the endpoint' }
        }
      },
      ApiError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              message: { type: 'string', example: 'Detailed error explanation.' },
              code: { type: 'string', example: 'VALIDATION_ERROR' },
              details: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    field: { type: 'string', example: 'phone' },
                    message: { type: 'string', example: 'Invalid mobile phone format.' }
                  }
                }
              }
            }
          }
        }
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', example: 'a9d27085-0a48-496f-9ea1-33e17d1a74e1' },
          fullName: { type: 'string', example: 'Mahesh MS' },
          phone: { type: 'string', example: '6363152844' },
          role: { type: 'string', enum: ['citizen', 'official', 'admin'], example: 'citizen' },
          villagePanchayat: { type: 'string', example: 'MARALURU' },
          createdAt: { type: 'string', format: 'date-time', example: '2026-10-15T09:30:00.000Z' }
        }
      },
      RegisterRequest: {
        type: 'object',
        required: ['fullName', 'phone', 'password'],
        properties: {
          fullName: { type: 'string', minLength: 2, maxLength: 120, example: 'Mahesh Kumar' },
          phone: { type: 'string', pattern: '^[6-9]\\d{9}$', example: '9876543210', description: 'Standard 10-digit Indian mobile number' },
          password: { type: 'string', minLength: 6, maxLength: 100, format: 'password', example: 'SecureCitizen2026!' },
          villagePanchayat: { type: 'string', maxLength: 150, example: 'Haveri Gram Panchayat' }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['identifier', 'password'],
        properties: {
          identifier: { type: 'string', example: '6363152844', description: 'Registered phone number or UUID' },
          password: { type: 'string', format: 'password', example: 'CitizenSecret123!' }
        }
      },
      PrivilegedUserRequest: {
        type: 'object',
        required: ['fullName', 'role', 'password'],
        properties: {
          fullName: { type: 'string', minLength: 2, maxLength: 120, example: 'Karnataka Revenue Officer' },
          role: { type: 'string', enum: ['official', 'admin'], example: 'official' },
          phone: { type: 'string', example: '9123456789' },
          password: { type: 'string', minLength: 6, format: 'password', example: 'GovOfficer#2026' },
          villagePanchayat: { type: 'string', example: 'Mysuru Taluk Revenue Desk' }
        }
      },
      Scheme: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'sakala-fcs-fcs013' },
          title: { type: 'string', example: 'Aadhaar Biometric e-KYC Authentication for Ration Card' },
          title_kn: { type: 'string', example: 'ಪಡಿತರ ಚೀಟಿಗಾಗಿ ಆಧಾರ್ ಬಯೋಮೆಟ್ರಿಕ್ ಇ-ಕೆವೈಸಿ ದೃಢೀಕರಣ' },
          department: { type: 'string', example: 'Food, Civil Supplies and Consumer Affairs Department (Ahara)' },
          category: { type: 'string', enum: ['farmer', 'citizen', 'housing', 'food', 'student', 'health', 'business', 'it_services'], example: 'food' },
          service_type: { type: 'string', enum: ['scheme', 'service', 'certificate', 'welfare_benefit'], example: 'service' },
          brief_description: { type: 'string', example: 'Mandatory Aadhaar biometric e-KYC seeding for BPL/AAY ration card beneficiaries.' },
          official_url: { type: 'string', format: 'uri', example: 'https://ahara.kar.nic.in' },
          helpline_number: { type: 'string', example: '1967' },
          sla_days: { type: 'integer', example: 15 },
          is_active: { type: 'boolean', example: true },
          eligibility_criteria: { type: 'array', items: { type: 'string' }, example: ['Resident of Karnataka', 'Valid Aadhaar Linked'] },
          required_documents: { type: 'array', items: { type: 'string' }, example: ['Aadhaar Card Copy', 'Existing Ration Card Number'] }
        }
      },
      Application: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', example: '939a3137-6cfa-4057-89c5-58757b9020bc' },
          user_id: { type: 'string', format: 'uuid', example: 'a9d27085-0a48-496f-9ea1-33e17d1a74e1' },
          scheme_id: { type: 'string', example: 'sakala-fcs-fcs013' },
          scheme_title: { type: 'string', example: 'Aadhaar Biometric e-KYC Authentication for Ration Card' },
          scheme_department: { type: 'string', example: 'Food, Civil Supplies and Consumer Affairs Department (Ahara)' },
          status: { type: 'string', enum: ['submitted', 'under_review', 'approved', 'rejected'], example: 'submitted' },
          client_submission_id: { type: 'string', example: 'APP-1794415436427-yp6t7' },
          applicant_name: { type: 'string', example: 'Mahesh MS' },
          applicant_phone: { type: 'string', example: '6363152844' },
          village_panchayat: { type: 'string', example: 'MARALURU' },
          form_data: { type: 'object' },
          created_at: { type: 'string', format: 'date-time', example: '2026-11-11T16:43:56.530Z' },
          updated_at: { type: 'string', format: 'date-time', example: '2026-11-11T16:43:56.530Z' }
        }
      },
      Grievance: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', example: '4a5e3170-13e2-4bd5-8a90-7d727b38f1a1' },
          user_id: { type: 'string', format: 'uuid', nullable: true, example: 'a9d27085-0a48-496f-9ea1-33e17d1a74e1' },
          category: { type: 'string', example: 'water_supply' },
          description: { type: 'string', example: 'Drinking water borewell pipeline ruptured near primary school in Maraluru.' },
          village_panchayat: { type: 'string', example: 'Maraluru Gram Panchayat' },
          contact_phone: { type: 'string', example: '6363152844' },
          status: { type: 'string', enum: ['submitted', 'under_review', 'resolved', 'rejected'], example: 'submitted' },
          client_submission_id: { type: 'string', example: 'GRV-1794416029312-kl8m2' },
          created_at: { type: 'string', format: 'date-time', example: '2026-11-11T17:05:00.000Z' }
        }
      },
      RagChatRequest: {
        type: 'object',
        required: ['question'],
        properties: {
          question: { type: 'string', minLength: 2, maxLength: 1000, example: 'What is the eligibility for Gruha Lakshmi scheme in Karnataka?' },
          language: { type: 'string', enum: ['en', 'kn'], default: 'en', example: 'en' },
          conversationId: { type: 'string', example: 'conv-4b71f0be-d82e-473a-9152-d2560a5e1a34' }
        }
      },
      RagChatResponse: {
        type: 'object',
        properties: {
          answer: { type: 'string', example: 'Gruha Lakshmi Scheme provides ₹2,000 monthly DBT to female heads of household holding BPL/AAY ration cards in Karnataka...' },
          language: { type: 'string', example: 'en' },
          confidence: { type: 'string', enum: ['high', 'medium', 'low'], example: 'high' },
          conversationId: { type: 'string', example: 'conv-4b71f0be-d82e-473a-9152-d2560a5e1a34' },
          isAiServiceAvailable: { type: 'boolean', example: true },
          sources: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                documentTitle: { type: 'string', example: 'Gruha Lakshmi Scheme Guidelines' },
                department: { type: 'string', example: 'Women & Child Development Department' },
                section: { type: 'string', example: 'Eligibility & Exclusion Conditions' },
                sourceUrl: { type: 'string', example: 'https://sevasindhugs.karnataka.gov.in' }
              }
            }
          }
        }
      }
    }
  },
  paths: {
    // -------------------------------------------------------------------------
    // 1. SYSTEM & HEALTH
    // -------------------------------------------------------------------------
    '/api/health': {
      get: {
        tags: ['System & Health'],
        summary: 'Server runtime & database health check',
        description: 'Public health status endpoint. Returns uptime, runtime mode, and verified PostgreSQL connection status.',
        responses: {
          200: {
            description: 'System is healthy and database is connected',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    service: { type: 'string', example: 'arivunet-server' },
                    version: { type: 'string', example: '0.1.0' },
                    timestamp: { type: 'string', format: 'date-time' },
                    uptimeSeconds: { type: 'integer', example: 1240 },
                    environment: { type: 'string', example: 'production' },
                    database: {
                      type: 'object',
                      properties: {
                        configured: { type: 'boolean', example: true },
                        connected: { type: 'boolean', example: true },
                        message: { type: 'string', example: 'PostgreSQL database connected successfully.' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },

    // -------------------------------------------------------------------------
    // 2. AUTHENTICATION
    // -------------------------------------------------------------------------
    '/api/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register citizen account [Public]',
        description: 'Self-service registration for rural citizens. Role is automatically set to `citizen` (cannot self-assign official or admin roles).',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' }
            }
          }
        },
        responses: {
          201: {
            description: 'Citizen registered successfully. Returns user object and JWT token.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/User' },
                    token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsIn...' }
                  }
                }
              }
            }
          },
          409: {
            description: 'Phone number already registered',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          },
          400: {
            description: 'Validation error (invalid phone regex, short password)',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          }
        }
      }
    },
    '/api/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login with phone & password [Public]',
        description: 'Authenticates citizen, official, or admin credentials. Returns a signed JWT token with the user\'s authoritative backend role.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' }
            }
          }
        },
        responses: {
          200: {
            description: 'Login successful. Returns user profile and bearer token.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/User' },
                    token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsIn...' }
                  }
                }
              }
            }
          },
          401: {
            description: 'Invalid identifier or password',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          }
        }
      }
    },
    '/api/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get current user profile [Authenticated]',
        description: 'Validates stored JWT in Authorization header and returns the current user profile. Used for session restoration on page reload.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Current session is valid',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/User' }
                  }
                }
              }
            }
          },
          401: {
            description: 'Missing, expired, or invalid token',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          }
        }
      }
    },
    '/api/auth/privileged-user': {
      post: {
        tags: ['Authentication'],
        summary: 'Provision official or administrator account [Admin Only]',
        description: 'Administrative role provisioning endpoint. Restricted strictly to users holding the `admin` role.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PrivilegedUserRequest' }
            }
          }
        },
        responses: {
          201: {
            description: 'Privileged user created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/User' }
                  }
                }
              }
            }
          },
          403: {
            description: 'Forbidden: Requester does not possess admin privileges',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          }
        }
      }
    },

    // -------------------------------------------------------------------------
    // 3. USER MANAGEMENT
    // -------------------------------------------------------------------------
    '/api/users': {
      get: {
        tags: ['User Management'],
        summary: 'List users with optional role filtering [Admin Only]',
        description: 'Retrieves registered platform accounts. Only accessible by administrators.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'role', in: 'query', schema: { type: 'string', enum: ['citizen', 'official', 'admin'] }, description: 'Filter by account role' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 }, description: 'Number of records (max 100)' },
          { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 }, description: 'Offset for pagination' }
        ],
        responses: {
          200: {
            description: 'List of users returned',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'array', items: { $ref: '#/components/schemas/User' } },
                    total: { type: 'integer', example: 142 }
                  }
                }
              }
            }
          },
          403: {
            description: 'Forbidden: Requires admin role',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
          }
        }
      }
    },
    '/api/users/{id}': {
      get: {
        tags: ['User Management'],
        summary: 'Get user by UUID [Self or Admin]',
        description: 'Returns profile details for a specific user ID. Citizens may only query their own account ID.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'User UUID' }
        ],
        responses: {
          200: {
            description: 'User profile retrieved',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } }
          },
          403: { description: 'Access forbidden: Cannot inspect another citizen’s account' },
          404: { description: 'User with specified ID not found' }
        }
      },
      put: {
        tags: ['User Management'],
        summary: 'Update user profile details [Self or Admin]',
        description: 'Update profile information (full name, village panchayat). Role modification is restricted to administrators.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'User UUID' }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  fullName: { type: 'string', example: 'Mahesh MS Updated' },
                  villagePanchayat: { type: 'string', example: 'Nanjangud Gram Panchayat' },
                  role: { type: 'string', enum: ['citizen', 'official', 'admin'], description: 'Admin only' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'User updated successfully' },
          403: { description: 'Unauthorized to modify this profile or role' }
        }
      }
    },

    // -------------------------------------------------------------------------
    // 4. SCHEMES & CITIZEN SERVICES
    // -------------------------------------------------------------------------
    '/api/schemes': {
      get: {
        tags: ['Schemes & Services'],
        summary: 'Search & filter 1,060+ verified schemes [Public]',
        description: 'Public catalog query endpoint. Supports multi-faceted filtering by citizen category, 4-way service type taxonomy, text search, and safe SQL sorting.',
        parameters: [
          { name: 'category', in: 'query', schema: { type: 'string', enum: ['all', 'farmer', 'citizen', 'housing', 'food', 'student', 'health', 'business', 'it_services'], default: 'all' }, description: 'Citizen category' },
          { name: 'service_type', in: 'query', schema: { type: 'string', enum: ['all', 'scheme', 'service', 'certificate', 'welfare_benefit'], default: 'all' }, description: 'Service type taxonomy' },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Keyword search term (title, department, brief)' },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Page number (>= 1)' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 }, description: 'Records per page (capped at 100)' },
          { name: 'sort_by', in: 'query', schema: { type: 'string', enum: ['title', 'department', 'category', 'service_type', 'created_at'], default: 'title' }, description: 'Allowlisted column to sort by' },
          { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' }, description: 'Sort direction' }
        ],
        responses: {
          200: {
            description: 'Paginated scheme records returned',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Scheme' } },
                    pagination: {
                      type: 'object',
                      properties: {
                        page: { type: 'integer', example: 1 },
                        limit: { type: 'integer', example: 20 },
                        totalRecords: { type: 'integer', example: 1060 },
                        totalPages: { type: 'integer', example: 53 },
                        hasNextPage: { type: 'boolean', example: true },
                        hasPreviousPage: { type: 'boolean', example: false }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Schemes & Services'],
        summary: 'Create or update scheme catalog record [Admin Only]',
        description: 'Administrative upsert endpoint for updating statutory scheme guidelines and SLA specifications.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Scheme' }
            }
          }
        },
        responses: {
          200: { description: 'Scheme record updated or inserted successfully' },
          403: { description: 'Forbidden: Requires admin role' }
        }
      }
    },
    '/api/schemes/stats': {
      get: {
        tags: ['Schemes & Services'],
        summary: 'Live database scheme counts & breakdown [Public]',
        description: 'Returns real-time database counts: total verified schemes (1,060+), category distribution, and service type breakdown.',
        responses: {
          200: {
            description: 'Live scheme counts',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        totalSchemes: { type: 'integer', example: 1060 },
                        activeSchemes: { type: 'integer', example: 1060 },
                        byCategory: {
                          type: 'object',
                          example: { citizen: 359, farmer: 206, it_services: 148, student: 116, business: 104, food: 64, health: 55, housing: 8 }
                        },
                        byServiceType: {
                          type: 'object',
                          example: { service: 667, scheme: 350, certificate: 36, welfare_benefit: 7 }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/schemes/ingestion-jobs': {
      get: {
        tags: ['Schemes Governance'],
        summary: 'List batch ingestion import jobs [Public / Admin]',
        description: 'Retrieves chronological record of scheme ingestion jobs and document synchronization batches.',
        responses: {
          200: { description: 'Batch ingestion jobs list' }
        }
      }
    },
    '/api/schemes/audit-health': {
      get: {
        tags: ['Schemes Governance'],
        summary: 'Catalogue verification integrity & health [Public / Admin]',
        description: 'Returns data health metrics: verified scheme counts, stale record audits, and active source government portals.',
        responses: {
          200: { description: 'Audit health summary' }
        }
      }
    },
    '/api/schemes/trigger-ingestion': {
      post: {
        tags: ['Schemes Governance'],
        summary: 'Trigger incremental scheme ingestion [Admin Only]',
        description: 'Initiates background import to synchronize official departmental scheme changes into PostgreSQL.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Ingestion cycle initiated' },
          403: { description: 'Forbidden: Requires admin role' }
        }
      }
    },
    '/api/schemes/{id}': {
      get: {
        tags: ['Schemes & Services'],
        summary: 'Get scheme details & form fields by ID [Public]',
        description: 'Returns the full scheme specification including eligibility rules, required documents, benefits, and form fields.',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'sakala-fcs-fcs013', description: 'Scheme slug identifier' }
        ],
        responses: {
          200: {
            description: 'Scheme specification returned',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } }
          },
          400: { description: 'Invalid scheme ID format' },
          404: { description: 'Scheme not found' }
        }
      }
    },

    // -------------------------------------------------------------------------
    // 5. APPLICATIONS MANAGEMENT
    // -------------------------------------------------------------------------
    '/api/applications': {
      post: {
        tags: ['Applications'],
        summary: 'Submit citizen welfare application [Citizen Authenticated]',
        description: 'Submits a completed application to the official government intake queue. Generates an authoritative UUID and client reference ID.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['schemeId', 'formData'],
                properties: {
                  schemeId: { type: 'string', example: 'sakala-fcs-fcs013' },
                  localDraftId: { type: 'string', example: 'sakala-fcs-fcs013' },
                  clientSubmissionId: { type: 'string', example: 'APP-1794415436427-yp6t7' },
                  formData: {
                    type: 'object',
                    example: {
                      applicantName: 'Mahesh MS',
                      contactPhone: '6363152844',
                      district: 'Haveri',
                      taluk: 'Nanjangud',
                      villagePanchayat: 'Maraluru'
                    }
                  },
                  sourceProvenance: { type: 'object', example: { userAgent: 'Chrome/153', submittedVia: 'DraftFormModal' } }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Application successfully created and queued for review',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    isDuplicate: { type: 'boolean', example: false },
                    data: { $ref: '#/components/schemas/Application' }
                  }
                }
              }
            }
          },
          401: { description: 'Unauthorized: Authentication token required' },
          400: { description: 'Validation error: Missing schemeId or formData' }
        }
      },
      get: {
        tags: ['Applications Scrutiny'],
        summary: 'List applications in scrutiny queue [Official / Admin]',
        description: 'Intake scrutiny queue for assigned department scrutiny officers and administrators.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['submitted', 'under_review', 'approved', 'rejected'] }, description: 'Filter by lifecycle status' },
          { name: 'schemeId', in: 'query', schema: { type: 'string' }, description: 'Filter by specific scheme ID' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 }, description: 'Number of records' },
          { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 }, description: 'Pagination offset' }
        ],
        responses: {
          200: {
            description: 'Scrutiny applications list returned',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Application' } },
                    total: { type: 'integer', example: 12 }
                  }
                }
              }
            }
          },
          403: { description: 'Forbidden: Requires official or admin role' }
        }
      }
    },
    '/api/applications/my': {
      get: {
        tags: ['Applications'],
        summary: 'List authenticated citizen\'s submitted applications [Citizen]',
        description: 'Returns all applications submitted to the government server by the currently logged-in citizen.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Citizen application history',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Application' } }
                  }
                }
              }
            }
          },
          401: { description: 'Unauthorized: Authentication required' }
        }
      }
    },
    '/api/applications/{id}': {
      get: {
        tags: ['Applications'],
        summary: 'Track application by UUID or Client Reference [Public / Citizen / Official]',
        description: 'Comprehensive tracking query. Lookup by authoritative UUID or human-readable client submission ID (`APP-...`). Includes complete departmental scrutiny timeline and remarks.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: '939a3137-6cfa-4057-89c5-58757b9020bc', description: 'Application UUID or clientSubmissionId' }
        ],
        responses: {
          200: {
            description: 'Application record and status timeline found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Application' }
                  }
                }
              }
            }
          },
          404: { description: 'Application with specified reference not found' },
          403: { description: 'Forbidden: Cannot view full private details of another citizen\'s application' }
        }
      }
    },
    '/api/applications/{id}/status': {
      patch: {
        tags: ['Applications Scrutiny'],
        summary: 'Update application scrutiny status & remarks [Official / Admin]',
        description: 'Moves application status along the official lifecycle: `submitted` → `under_review` → `approved` or `rejected`. Remarks are mandatory and recorded permanently in the audit history.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Application UUID' }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status', 'remarks'],
                properties: {
                  status: { type: 'string', enum: ['under_review', 'approved', 'rejected'], example: 'under_review' },
                  remarks: { type: 'string', minLength: 5, maxLength: 1000, example: 'Application documents received and verified against village land records.' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Application status updated and history entry recorded' },
          400: { description: 'Invalid status or missing mandatory remarks' },
          403: { description: 'Forbidden: Requires official or admin role' },
          404: { description: 'Application ID not found' }
        }
      }
    },

    // -------------------------------------------------------------------------
    // 6. GRIEVANCES REDRESSAL
    // -------------------------------------------------------------------------
    '/api/grievances': {
      post: {
        tags: ['Grievances'],
        summary: 'Register Janaspandana civic grievance [Public / Citizen]',
        description: 'Lodge a civic grievance regarding drinking water, ration delay, roads, or pensions. May be filed anonymously or linked to an authenticated citizen account.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['category', 'description', 'villagePanchayat'],
                properties: {
                  category: { type: 'string', example: 'water_supply', description: 'Grievance category' },
                  description: { type: 'string', minLength: 10, maxLength: 2000, example: 'Drinking water pipeline damaged near Gram Panchayat office.' },
                  villagePanchayat: { type: 'string', minLength: 2, maxLength: 150, example: 'Maraluru Gram Panchayat' },
                  contactPhone: { type: 'string', example: '6363152844' },
                  clientSubmissionId: { type: 'string', example: 'GRV-1794416029312-kl8m2' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Grievance registered successfully in Janaspandana',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Grievance' }
                  }
                }
              }
            }
          },
          400: { description: 'Validation error: Description too short or missing panchayat' }
        }
      },
      get: {
        tags: ['Grievances Scrutiny'],
        summary: 'List civic grievances for resolution [Official / Admin]',
        description: 'Official queue for departmental grievance resolution officers.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'category', in: 'query', schema: { type: 'string' }, description: 'Filter by category' },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['submitted', 'under_review', 'resolved', 'rejected'] }, description: 'Filter by status' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 }, description: 'Limit' },
          { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 }, description: 'Offset' }
        ],
        responses: {
          200: { description: 'Grievances list returned' },
          403: { description: 'Forbidden: Requires official or admin role' }
        }
      }
    },
    '/api/grievances/my': {
      get: {
        tags: ['Grievances'],
        summary: 'List citizen\'s submitted grievances [Citizen]',
        description: 'Returns all grievances lodged by the authenticated citizen.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Citizen grievances list returned' },
          401: { description: 'Unauthorized' }
        }
      }
    },
    '/api/grievances/{id}': {
      get: {
        tags: ['Grievances'],
        summary: 'Track grievance by UUID or Client Reference [Public / Citizen / Official]',
        description: 'Query Janaspandana grievance status by UUID or reference number (`GRV-...`).',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: '4a5e3170-13e2-4bd5-8a90-7d727b38f1a1', description: 'Grievance UUID or clientSubmissionId' }
        ],
        responses: {
          200: {
            description: 'Grievance details retrieved',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } }
          },
          404: { description: 'Grievance reference not found' }
        }
      }
    },
    '/api/grievances/{id}/status': {
      patch: {
        tags: ['Grievances Scrutiny'],
        summary: 'Update grievance status & resolution remarks [Official / Admin]',
        description: 'Marks civic grievance as `under_review`, `resolved`, or `rejected`. Records action in the audit trail.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Grievance UUID' }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['under_review', 'resolved', 'rejected'], example: 'resolved' },
                  remarks: { type: 'string', example: 'Maintenance crew dispatched and pipeline leak repaired.' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Grievance status updated' },
          403: { description: 'Forbidden: Requires official or admin role' }
        }
      }
    },

    // -------------------------------------------------------------------------
    // 7. OFFLINE BATCH SYNCHRONIZATION
    // -------------------------------------------------------------------------
    '/api/sync/batch': {
      post: {
        tags: ['Offline Synchronization'],
        summary: 'Process queued offline applications & grievances [Citizen]',
        description: 'Batch synchronization endpoint for mobile and offline clients. Receives queued offline submissions and inserts them idempotently using client submission IDs.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['clientBatchId'],
                properties: {
                  clientBatchId: { type: 'string', example: 'batch-1794417001-abc' },
                  applications: { type: 'array', items: { type: 'object' }, description: 'List of queued offline applications' },
                  grievances: { type: 'array', items: { type: 'object' }, description: 'List of queued offline grievances' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Batch processed with individual item results',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } }
          },
          401: { description: 'Unauthorized' }
        }
      }
    },

    // -------------------------------------------------------------------------
    // 8. GROUNDED RAG AI ASSISTANT
    // -------------------------------------------------------------------------
    '/api/rag/chat': {
      post: {
        tags: ['RAG Assistant'],
        summary: 'Multilingual conversational AI scheme assistant [Public]',
        description: 'Performs vector embedding retrieval across verified scheme guidelines using pgvector. Generates grounded responses with source citations in English or Kannada.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RagChatRequest' }
            }
          }
        },
        responses: {
          200: {
            description: 'Grounded response returned with citations',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/RagChatResponse' }
                  }
                }
              }
            }
          },
          400: { description: 'Question missing or too short' },
          429: { description: 'Too many RAG queries from this IP (rate limited)' }
        }
      }
    },
    '/api/rag/query': {
      post: {
        tags: ['RAG Assistant'],
        summary: 'Semantic chunk search over guidelines [Public]',
        description: 'Returns raw matching chunks and cosine similarity scores for scheme documents.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['query'],
                properties: {
                  query: { type: 'string', minLength: 2, maxLength: 500, example: 'Sandhya Suraksha pension age requirement' },
                  schemeId: { type: 'string', example: 'sandhya-suraksha' },
                  limit: { type: 'integer', default: 5 }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Semantic chunk matches returned' }
        }
      }
    },

    // -------------------------------------------------------------------------
    // 9. KNOWLEDGE INGESTION
    // -------------------------------------------------------------------------
    '/api/ingestion/documents': {
      post: {
        tags: ['Knowledge Ingestion'],
        summary: 'Ingest guideline document into pgvector [Admin Only]',
        description: 'Parses, chunks, and creates vector embeddings for statutory government guideline text.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'content'],
                properties: {
                  title: { type: 'string', example: 'Gruha Jyothi Free Electricity Rules' },
                  content: { type: 'string', example: 'Full statutory text of scheme notification...' },
                  sourceUrl: { type: 'string', format: 'uri', example: 'https://sevasindhu.karnataka.gov.in' },
                  schemeId: { type: 'string', example: 'gruha-jyothi' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Document vectorized and inserted' },
          403: { description: 'Forbidden: Requires admin role' }
        }
      }
    },
    '/api/ingestion/file': {
      post: {
        tags: ['Knowledge Ingestion'],
        summary: 'Ingest PDF / Text guideline file [Admin Only]',
        description: 'Upload and vectorize government government orders or notifications in PDF or text format.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'File processed and vectorized' },
          403: { description: 'Forbidden: Requires admin role' }
        }
      }
    },
    '/api/ingestion/seed-catalogue': {
      post: {
        tags: ['Knowledge Ingestion'],
        summary: 'Seed full catalogue into vector embeddings [Admin Only]',
        description: 'Re-indexes the entire 1,060+ scheme database into semantic vector embeddings.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Catalogue seeded successfully' },
          403: { description: 'Forbidden: Requires admin role' }
        }
      }
    },
    '/api/ingestion/status': {
      get: {
        tags: ['Knowledge Ingestion'],
        summary: 'Knowledge base embedding metrics [Admin / Official]',
        description: 'Returns vector chunk count, indexed document statistics, and embedding status.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Ingestion status metrics' }
        }
      }
    },

    // -------------------------------------------------------------------------
    // 10. AUDIT & PLATFORM GOVERNANCE
    // -------------------------------------------------------------------------
    '/api/audit/logs': {
      get: {
        tags: ['Audit & Governance'],
        summary: 'Query chronological security audit trail [Admin Only]',
        description: 'Returns tamper-evident system audit logs for administrative oversight and compliance reviews.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'action', in: 'query', schema: { type: 'string' }, description: 'Filter by action (e.g. APPLICATION_STATUS_UPDATED)' },
          { name: 'actorId', in: 'query', schema: { type: 'string', format: 'uuid' }, description: 'Filter by user UUID' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 }, description: 'Limit' },
          { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 }, description: 'Offset' }
        ],
        responses: {
          200: {
            description: 'Audit logs returned',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } }
          },
          403: { description: 'Forbidden: Requires admin role' }
        }
      }
    }
  }
};

/**
 * Custom CSS for Swagger UI matching Karnataka DPI Navy & SaaS aesthetic
 */
const customSwaggerCss = `
  /* Topbar Styling */
  .swagger-ui .topbar {
    background-color: #102F56 !important;
    border-bottom: 3px solid #D99016;
    padding: 12px 0;
  }
  .swagger-ui .topbar a {
    color: #ffffff !important;
    font-weight: 800;
  }
  .swagger-ui .topbar .download-url-wrapper {
    display: none !important;
  }
  .swagger-ui .topbar-wrapper::before {
    content: "🏛️ OfflineBridge Karnataka — Official API Documentation";
    color: #ffffff;
    font-size: 1.15rem;
    font-weight: 800;
    letter-spacing: -0.01em;
  }
  .swagger-ui .topbar-wrapper img {
    display: none;
  }

  /* Information Banner */
  .swagger-ui .info {
    margin: 24px 0;
  }
  .swagger-ui .info .title {
    color: #102F56;
    font-size: 1.9rem;
    font-weight: 800;
  }
  .swagger-ui .info p {
    font-size: 0.95rem;
    color: #334155;
    line-height: 1.6;
  }

  /* Buttons & Auth */
  .swagger-ui .btn.authorize {
    background-color: #1556A0;
    border-color: #1556A0;
    color: #ffffff;
    font-weight: 700;
    border-radius: 6px;
    transition: all 0.2s ease;
  }
  .swagger-ui .btn.authorize svg {
    fill: #ffffff;
  }
  .swagger-ui .btn.authorize:hover {
    background-color: #104380;
    border-color: #104380;
  }

  /* Opblock Styling */
  .swagger-ui .opblock {
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(16, 47, 86, 0.05);
    margin: 0 0 12px;
  }
  .swagger-ui .opblock .opblock-summary-method {
    border-radius: 4px;
    font-weight: 800;
    min-width: 80px;
  }
  .swagger-ui .opblock-tag {
    font-size: 1.2rem;
    font-weight: 800;
    color: #102F56;
    border-bottom: 2px solid #E2E8F0;
    margin-bottom: 12px;
    padding-bottom: 6px;
  }

  /* Tables & Schemas */
  .swagger-ui table thead tr th, 
  .swagger-ui table thead tr td {
    color: #102F56;
    font-weight: 700;
  }
`;

/**
 * Configure and mount Swagger UI and OpenAPI JSON endpoint on an Express app
 */
export function setupSwagger(app) {
  if (!env.swaggerEnabled) {
    console.log('[OfflineBridge Swagger] Swagger documentation disabled via SWAGGER_ENABLED=false.');
    return;
  }

  // 1. Expose raw OpenAPI 3.0 specification as JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    res.send(swaggerSpec);
  });

  // 2. Mount interactive Swagger UI at /api-docs
  const swaggerUiOptions = {
    customCss: customSwaggerCss,
    customSiteTitle: 'OfflineBridge API Documentation — Karnataka DPI',
    customfavIcon: '/favicon.svg',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      tryItOutEnabled: true,
      docExpansion: 'list'
    }
  };

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

  console.log('[OfflineBridge Swagger] Swagger UI interactive documentation enabled at /api-docs');
  console.log('[OfflineBridge Swagger] Raw OpenAPI JSON specification available at /api-docs.json');
}

export default setupSwagger;

