# CAMPUSMART DATABASE SPECIFICATION (Prisma ORM & PostgreSQL)

## ORM Provider
Prisma ORM (`v5.22.0`) targeting Neon PostgreSQL.

## Relational Models Summary (27 Models)

1. **College**: University entities (`name`, `code`, `domains` array, `city`, `state`).
2. **Department**: University academic departments (`collegeId`, `name`, `code`).
3. **User**: Verified student/staff accounts (`email`, `name`, `collegeId`, `role`, `badges`, `reputationScore`).
4. **Category**: Marketplace taxonomy (`name`, `slug`, `icon`, `description`).
5. **Product**: Marketplace listings (`title`, `description`, `price`, `rentalPrice`, `condition`, `transactionType`, `status`, `sellerId`, `collegeId`, `deletedAt`).
6. **ProductImage**: Listing gallery images (`url`, `isPrimary`, `productId`).
7. **AIAnalysis**: Gemini AI listing assessment (`recommendedPrice`, `marketPrice`, `scamScore`, `isFlagged`).
8. **Wishlist**: Saved student favorites (`userId`, `productId`).
9. **Order / OrderItem**: Completed marketplace transactions.
10. **Rental**: Equipment/book rental tracking.
11. **ExchangeRequest**: Barter/exchange negotiations.
12. **Chat / ChatParticipant / Message**: Real-time buyer-seller conversations.
13. **Review**: Peer reputation ratings (`reviewerId`, `revieweeId`, `rating`, `comment`).
14. **Report**: Community moderation flags (`reporterId`, `reportedProductId`, `reason`, `status`).
15. **Notification**: Student alert notifications (`recipientId`, `type`, `title`, `isRead`).
16. **SavedSearch / SearchHistory / RecentlyViewed**: User discovery preferences.
17. **DeviceSession**: Refresh token rotation sessions (`userId`, `refreshToken`, `deviceInfo`, `expiresAt`).
18. **CampusTrend / HeatmapEvent / ActivityLog**: Platform analytics & safety metrics.

## Database Enums (9 Enums)
- `UserRole`: `STUDENT`, `FACULTY`, `CLUB`, `ALUMNI`, `MODERATOR`, `COLLEGE_ADMIN`, `SUPER_ADMIN`
- `TransactionType`: `BUY`, `SELL`, `RENT`, `BORROW`, `EXCHANGE`, `DONATE`
- `ProductStatus`: `DRAFT`, `PENDING_REVIEW`, `ACTIVE`, `RESERVED`, `SOLD`, `RENTED`, `BORROWED`, `EXCHANGED`, `DONATED`, `EXPIRED`, `REJECTED`, `ARCHIVED`
- `ProductCondition`: `BRAND_NEW`, `LIKE_NEW`, `GOOD`, `FAIR`, `POOR`
- `ReportStatus`: `PENDING`, `UNDER_REVIEW`, `RESOLVED`, `DISMISSED`
- `OrderStatus`, `RentalStatus`, `ExchangeStatus`, `NotificationType`
