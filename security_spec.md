# Security Specification - PropEdge

## Data Invariants
1. A user profile (`/users/{uid}`) must be owned by the authenticated user.
2. Prop Firms (`/firms/{id}`) are read-only for standard users; only verified admins (not yet implemented, so default deny writes) can modify them.
3. User profiles are restricted: users can only read/write their own PII.

## The "Dirty Dozen" Payloads (Deny Cases)
1. Creating a firm with an unauthorized user.
2. Updating a firm's rating by a non-admin.
3. Reading another user's profile metadata.
4. Overwriting `createdAt` on a user profile during update.
5. Injecting a 1MB string into a firm's name.
6. Deleting a firm collection document by an authenticated user.
7. Creating a user profile with a different UID than `request.auth.uid`.
8. Updating a user's email without verification (if enforced).
9. Spoofing admin status by writing to an admin collection.
10. Listing the entire `users` collection.
11. Bypassing size limits on `description` fields.
12. Creating a firm with a missing `rating` field.

## Secure Rules Plan
- Global deny by default.
- `/users/{userId}`: read/write only if `request.auth.uid == userId`.
- `/firms/{firmId}`: read for all (signed in or not? Prompt says "make a place where people can sign up", implying it's a community site. Firms list should probably be public or at least readable by users). I'll allow reading by anyone.
- Strictly validate firm fields if I were to allow writes (but I won't allow client writes for firms).
