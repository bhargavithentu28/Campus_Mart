# CAMPUSMART REST API DOCUMENTATION (v1)

## Base URL
`/api/v1`

---

## Authentication (`/api/v1/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/colleges` | Public | List verified university institutions |
| POST | `/send-otp` | Public | Send verification code to university email |
| POST | `/verify-otp` | Public | Verify OTP & issue access/refresh tokens |
| POST | `/google-login` | Public | Authenticate via Google OAuth payload |
| POST | `/refresh` | Public | Refresh token rotation endpoint |
| POST | `/logout` | Protected | Invalidate current device session |
| POST | `/logout-all` | Protected | Invalidate all user device sessions |
| GET | `/me` | Protected | Fetch current user session profile |

---

## Users (`/api/v1/users`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/me` | Protected | Get full authenticated user profile |
| PATCH | `/me` | Protected | Update profile (bio, year, branch, avatar) |
| GET | `/:id` | Public | Get public student profile |

---

## Products & Marketplace (`/api/v1/products`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Public | Paginated marketplace search & filtering |
| GET | `/my-listings` | Protected | Fetch current student's listings |
| GET | `/:id` | Public | Get product details & increment views |
| POST | `/` | Protected | Publish listing with Gemini AI scam check |
| PATCH | `/:id` | Protected | Update listing details (ownership guard) |
| PATCH | `/:id/status` | Protected | State machine status transition guard |
| DELETE | `/:id` | Protected | Soft-delete listing (`ARCHIVED`) |

---

## Wishlist (`/api/v1/wishlist`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Protected | Retrieve saved favorite items |
| POST | `/:productId` | Protected | Toggle product in wishlist |
| DELETE | `/:productId` | Protected | Toggle product in wishlist |

---

## Reviews (`/api/v1/reviews`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/user/:userId` | Public | Fetch student reviews & average rating |
| POST | `/` | Protected | Submit peer review (blocks self-reviews) |

---

## Reports & Moderation (`/api/v1/reports`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/` | Protected | Report product listing for moderation |
| GET | `/` | Admin | List open moderation reports |
| PATCH | `/:id/resolve` | Admin | Resolve report (`delete_product` / `dismiss`) |

---

## Search (`/api/v1/search`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Public | Multi-filter keyword search engine |
| GET | `/trending` | Public | Campus search trends |
