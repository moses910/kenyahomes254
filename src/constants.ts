// User roles
export const UserRole = { SEEKER: 'seeker', AGENT: 'agent', ADMIN: 'admin' } as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// Property status
export const PropertyStatus = { DRAFT: 'draft', PUBLISHED: 'published', ARCHIVED: 'archived' } as const;
export type PropertyStatus = (typeof PropertyStatus)[keyof typeof PropertyStatus];

// Listing type
export const ListingType = { SALE: 'sale', RENT: 'rent' } as const;
export type ListingType = (typeof ListingType)[keyof typeof ListingType];

// Message status
export const MessageStatus = { UNREAD: 'unread', READ: 'read', RESPONDED: 'responded' } as const;
export type MessageStatus = (typeof MessageStatus)[keyof typeof MessageStatus];

// Storage bucket names
export const STORAGE_BUCKET = 'property-images' as const;

// Max constraints
export const MAX_PROPERTY_IMAGES = 10;
