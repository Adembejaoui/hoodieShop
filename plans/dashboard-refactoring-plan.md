# Dashboard Page Refactoring Plan

## Current Problem
The `app/dashboard/page.tsx` file has grown to **1091 lines**, making it:
- Hard to read and understand
- Difficult to maintain
- Prone to bugs when making changes
- Hard to test individual components

## Proposed Architecture

### File Structure
```
app/dashboard/
├── page.tsx                    # Main page (~150 lines)
├── types.ts                    # All TypeScript interfaces
├── hooks/
│   ├── use-user.ts            # User data fetching
│   ├── use-orders.ts          # Orders data fetching
│   ├── use-addresses.ts       # Addresses data fetching
│   └── use-wishlist.ts        # Wishlist data fetching
├── context/
│   └── dashboard-context.tsx  # Shared state context
└── components/
    ├── sidebar/
    │   ├── dashboard-sidebar.tsx
    │   └── quick-stats.tsx
    ├── modals/
    │   ├── address-form-modal.tsx
    │   ├── order-detail-modal.tsx
    │   └── password-modal.tsx
    └── tabs/
        ├── orders-tab.tsx
        ├── addresses-tab.tsx
        ├── wishlist-tab.tsx
        └── profile-tab.tsx
```

## Component Breakdown

### 1. Types File (`types.ts`)
Extract all interfaces:
- `Order` and `OrderItem`
- `Address`
- `WishlistItem`
- `User`
- `PaginationData`
- `TabType`

### 2. Custom Hooks

#### `use-user.ts`
```typescript
// Handles user data fetching and profile updates
export function useUser() {
  // State: user, loading, error
  // Functions: fetchUser, saveProfile, changePassword
  return { user, loading, error, saveProfile, changePassword }
}
```

#### `use-orders.ts`
```typescript
// Handles orders data fetching with pagination
export function useOrders(activeTab: TabType) {
  // State: orders, pagination
  // Functions: fetchOrders
  return { orders, pagination, refetch }
}
```

#### `use-addresses.ts`
```typescript
// Handles addresses CRUD operations
export function useAddresses(activeTab: TabType) {
  // State: addresses
  // Functions: addAddress, editAddress, deleteAddress
  return { addresses, addAddress, editAddress, deleteAddress }
}
```

#### `use-wishlist.ts`
```typescript
// Handles wishlist operations
export function useWishlist(activeTab: TabType) {
  // State: wishlist
  // Functions: removeFromWishlist
  return { wishlist, removeFromWishlist }
}
```

### 3. Modal Components

#### `address-form-modal.tsx` (~100 lines)
- Address form UI
- Form validation
- Submit handling

#### `order-detail-modal.tsx` (~150 lines)
- Full order details display
- Status badges
- Timeline view

#### `password-modal.tsx` (~80 lines)
- Password change form
- Validation

### 4. Tab Components

#### `orders-tab.tsx` (~120 lines)
- Order cards list
- Empty state
- Click to view details

#### `addresses-tab.tsx` (~100 lines)
- Address cards grid
- Add/Edit/Delete buttons
- Empty state

#### `wishlist-tab.tsx` (~80 lines)
- ProductCard grid
- Remove from wishlist
- Empty state

#### `profile-tab.tsx` (~100 lines)
- Profile form
- Password change trigger

### 5. Sidebar Components

#### `dashboard-sidebar.tsx` (~80 lines)
- User info display
- Tab navigation
- Sign out button

#### `quick-stats.tsx` (~40 lines)
- Stats display

## Benefits

1. **Maintainability**: Each file has a single responsibility
2. **Readability**: Files are 80-150 lines on average
3. **Testability**: Components can be tested in isolation
4. **Reusability**: Hooks and components can be reused
5. **Performance**: Easier to implement code splitting

## Implementation Order

1. Create `types.ts` with all interfaces
2. Create custom hooks for data fetching
3. Extract modal components
4. Extract tab components
5. Extract sidebar components
6. Refactor main `page.tsx` to use new structure
7. Test and verify functionality

## Estimated Line Counts After Refactoring

| File | Lines |
|------|-------|
| page.tsx | ~150 |
| types.ts | ~80 |
| hooks/*.ts | ~200 total |
| modals/*.tsx | ~330 total |
| tabs/*.tsx | ~400 total |
| sidebar/*.tsx | ~120 total |
| **Total** | ~1280 |

While total lines increase due to imports/exports, each file is now:
- Focused on a single concern
- Easy to navigate
- Simple to test
- Quick to understand
