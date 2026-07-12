# AssetFlow: Enterprise-Grade Asset & Resource Management ERP

AssetFlow is a production-ready, high-fidelity Enterprise Resource Planning (ERP) platform built for secure custody allocations, timeline scheduling, and maintenance workflows. It implements advanced double-allocation conflict prevention, timeslot scheduling validations, and a distributed caching architecture.

---

## Key Pillars

1. **Conflict-Free Allocations**: Real-time custody tracking checks asset statuses natively on mutation requests.
2. **Timeslot Booking Scheduler**: Micro-timeline scheduling validates reservations mathematically, preventing double-bookings.
3. **Upstash Redis Caching Layer**: Leverages Upstash HTTP REST commands to cache heavy dashboard metrics with automatic invalidation.
4. **Zod Validation Middleware**: Direct input filter guards that compile and type-check payloads before processing.
5. **Secure JWT & Suffix Control**: Fully contained authorization checks that restrict registry and logging access to `@gmail.com` accounts.

---
