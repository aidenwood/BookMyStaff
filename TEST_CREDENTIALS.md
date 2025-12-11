# Test Credentials for BookMyStaff

This document contains the standard test credentials used for testing the BookMyStaff application.

## Test Business Owner

**Name:** Aiden Wood  
**Email:** hi@aidxn.com  
**Password:** aiden123wood  

## Test Business

**Business Name:** Aidxn Design  
**Description:** Creative design and development services  
**Phone:** +1234567890  
**Address:** 123 Design Street, Creative City, CC 12345  

## Usage

These credentials are used consistently across all tests to ensure reliable test data. The test business owner has full administrative access to manage:

- Business settings
- Staff members
- Service areas and regions
- Appointment types
- Bookings and availability
- Notification settings

## Database State

When testing locally, this user account should be created with:
- A business record in the `businesses` table
- A user record in the `users` table  
- Proper Row Level Security (RLS) policies applied

## Test Files

The main test setup is located in:
- `/tests/setup/test-business-setup.spec.ts` - Creates the test business and owner
- `/tests/auth/business-owner.spec.ts` - General business owner authentication tests

## Running Tests

```bash
# Run the setup test to create test data
npx playwright test tests/setup/test-business-setup.spec.ts

# Run all business owner tests
npx playwright test tests/auth/business-owner.spec.ts

# Run all tests
npx playwright test
```

## Important Notes

1. **Security**: These are test credentials only and should never be used in production
2. **Cleanup**: Tests should clean up after themselves or use isolated test databases
3. **Consistency**: Always use these credentials for any business owner testing to ensure consistency
4. **Updates**: If credentials change, update this file and all related test files

## Supabase Database Access

Project URL: `https://nmksjlhbpcunfsuyjusu.supabase.co`

Test data can be verified directly in the Supabase dashboard or via SQL queries.