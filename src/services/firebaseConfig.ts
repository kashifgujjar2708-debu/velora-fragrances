/**
 * VELORA FRAGRANCES — Backend Architecture & Cloud Migration Readiness
 *
 * Active Setup:
 *   Express REST API (`server.ts`) + `scrypt` salted password hashing + HMAC-SHA256
 *   signed session tokens + server-side RBAC (`requireAdmin`) + authoritative
 *   checkout/coupon calculation + persistent 8-collection store (`data/velora-db.json`).
 *
 * Optional Cloud Migration Blueprint:
 *   If migrating to Firebase Auth + Cloud Firestore + Firebase Storage in the future,
 *   provision Firebase first and apply the reference security rules below.
 */

export interface IntegrationModuleStatus {
  id: 'express-rbac' | 'firebase-auth' | 'cloud-firestore' | 'firebase-storage' | 'payments';
  name: string;
  mode: 'active-backend' | 'optional-cloud-migration';
  description: string;
  requiredEnvKeys: string[];
}

export const INTEGRATION_READINESS: IntegrationModuleStatus[] = [
  {
    id: 'express-rbac',
    name: 'Express Secure API & RBAC (Active)',
    mode: 'active-backend',
    description:
      'Active server-side scrypt password hashing, HMAC-SHA256 signed sessions, role-protected /api/admin/* endpoints, and server-authoritative order totals.',
    requiredEnvKeys: ['SESSION_SECRET', 'ADMIN_BOOTSTRAP_EMAIL', 'ADMIN_BOOTSTRAP_PASSWORD'],
  },
  {
    id: 'firebase-auth',
    name: 'Firebase Authentication (Optional Migration)',
    mode: 'optional-cloud-migration',
    description:
      'Replace Express session auth with Firebase Auth + custom admin claims (`request.auth.token.admin == true`).',
    requiredEnvKeys: ['VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_AUTH_DOMAIN', 'VITE_FIREBASE_PROJECT_ID'],
  },
  {
    id: 'cloud-firestore',
    name: 'Cloud Firestore Database (Optional Migration)',
    mode: 'optional-cloud-migration',
    description:
      'Move collections (`products`, `categories`, `users`, `orders`, `coupons`, `reviews`, `inventory`, `settings`) to Firestore with strict security rules.',
    requiredEnvKeys: ['VITE_FIREBASE_PROJECT_ID', 'VITE_FIREBASE_APP_ID'],
  },
  {
    id: 'firebase-storage',
    name: 'Firebase Storage (Optional Migration)',
    mode: 'optional-cloud-migration',
    description:
      'Store admin-uploaded product and category photography with admin-only write rules and MIME/size validation.',
    requiredEnvKeys: ['VITE_FIREBASE_STORAGE_BUCKET'],
  },
  {
    id: 'payments',
    name: 'Pakistan Payment Gateways (Not Live)',
    mode: 'optional-cloud-migration',
    description:
      'Portfolio demo only — simulated orders default to Pending and never fake gateway verification.',
    requiredEnvKeys: ['PAYMENT_GATEWAY_MERCHANT_ID', 'PAYMENT_GATEWAY_SECRET'],
  },
];

export const DATABASE_COLLECTIONS = [
  'products',
  'categories',
  'users',
  'orders',
  'coupons',
  'reviews',
  'inventory',
  'settings',
] as const;

export const REFERENCE_FIRESTORE_RULES = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() { return request.auth != null; }
    function isAdmin() { return isSignedIn() && request.auth.token.admin == true; }
    function isOwner(uid) { return isSignedIn() && request.auth.uid == uid; }

    match /products/{productId} {
      allow read: if resource.data.active == true || isAdmin();
      allow write: if isAdmin();
    }
    match /categories/{catId} {
      allow read: if resource.data.visible == true || isAdmin();
      allow write: if isAdmin();
    }
    match /inventory/{invId} {
      allow read, write: if isAdmin();
    }
    match /coupons/{couponId} {
      allow read: if isSignedIn() || isAdmin();
      allow write: if isAdmin();
    }
    match /reviews/{reviewId} {
      allow read: if resource.data.approved == true || isAdmin();
      allow create: if request.resource.data.approved == false && request.resource.data.isSampleDemo == false;
      allow update, delete: if isAdmin();
    }
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow create: if isOwner(userId) && request.resource.data.role == 'customer';
      allow update: if (isOwner(userId) && request.resource.data.role == resource.data.role) || isAdmin();
      allow delete: if isAdmin();
    }
    match /orders/{orderId} {
      allow read: if isAdmin() || (isSignedIn() && resource.data.customerId == request.auth.uid);
      allow create: if false; // Create orders strictly via trusted backend/Cloud Function
      allow update, delete: if isAdmin();
    }
    match /settings/{docId} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}`;

export const REFERENCE_STORAGE_RULES = `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /products/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true
                   && request.resource.size < 3 * 1024 * 1024
                   && request.resource.contentType.matches('image/(jpeg|png|webp)');
    }
    match /categories/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true
                   && request.resource.size < 3 * 1024 * 1024
                   && request.resource.contentType.matches('image/(jpeg|png|webp)');
    }
  }
}`;
