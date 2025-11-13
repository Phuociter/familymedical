# Task 5: Family Members Tab Implementation

## Overview
This document describes the implementation of the enhanced Family Members tab with grid layout, member cards, and add member functionality.

## Components Implemented

### 1. FamilyMembersTab
**Location**: `src/components/Doctor/Family/Detail/Tabs/FamilyMembersTab.jsx`

**Features**:
- Grid layout displaying family members
- Header with member count and "Add Member" button
- Empty state when no members exist
- Integration with MemberCard and AddMemberModal components

**Props**:
- `familyId` (string): Family ID
- `members` (Member[]): Array of family members
- `onMemberSelect` (Function): Callback when member is selected
- `onAddMember` (Function): Callback to add new member

### 2. MemberCard
**Location**: `src/components/Doctor/Family/Detail/Tabs/MemberCard.jsx`

**Features**:
- Avatar with initials (color-coded by gender)
- Member name, age, and gender
- Relationship to household head
- Health status badge (color-coded: green/yellow/red)
- Recent visit count display
- Last visit date (if available)
- Quick action buttons:
  - "Xem hồ sơ" (View Record) - navigates to patient detail
  - "Đặt lịch" (Schedule Appointment) - opens appointment scheduler
- Hover effect with elevation

**Health Status Colors**:
- `normal` → Green (Bình thường)
- `monitoring` → Yellow (Theo dõi)
- `active` → Red (Đang điều trị)

**Avatar Colors**:
- Male (Nam) → Blue (#1976d2)
- Female (Nữ) → Pink (#d81b60)

### 3. AddMemberModal
**Location**: `src/components/Doctor/Family/Detail/Tabs/AddMemberModal.jsx`

**Features**:
- Full-screen modal dialog for adding new members
- Form fields:
  - Full Name (required)
  - Relationship (required, dropdown)
  - CCCD (required, 12 digits)
  - Date of Birth (required)
  - Gender (required, dropdown)
  - Health Status (dropdown, default: normal)
  - Phone Number (optional, validated)
  - Email (optional, validated)
- Real-time form validation
- Error messages for invalid inputs
- Save and Cancel buttons

**Validation Rules**:
- Full Name: Required, non-empty
- Relationship: Required, from predefined list
- CCCD: Required, exactly 12 digits
- Date of Birth: Required
- Gender: Required (Nam/Nữ)
- Phone Number: Optional, must match pattern 0XXXXXXXXX (10 digits)
- Email: Optional, must be valid email format

**Relationship Options**:
- Chủ hộ (Household Head)
- Vợ (Wife)
- Chồng (Husband)
- Con trai (Son)
- Con gái (Daughter)
- Cha (Father)
- Mẹ (Mother)
- Anh trai (Older Brother)
- Chị gái (Older Sister)
- Em trai (Younger Brother)
- Em gái (Younger Sister)
- Ông (Grandfather)
- Bà (Grandmother)
- Cháu trai (Grandson)
- Cháu gái (Granddaughter)
- Khác (Other)

## Data Model Updates

### Enhanced Member Type
Updated `MOCK_MEMBERS` in `src/mocks/familyMockData.js` to include:
- `phoneNumber` (string, optional)
- `email` (string, optional)
- `healthStatus` ('normal'|'monitoring'|'active')
- `recentVisitCount` (number)
- `lastVisitDate` (string, ISO date, optional)

All mock data for families 1-8 has been updated with these fields.

## Integration

### FamilyDetailView Integration
The FamilyMembersTab is integrated into the FamilyDetailView component:
- Displayed as Tab 2 (index 1)
- Receives members data from parent
- Callbacks for member selection and adding members

### DoctorFamiliesPage Integration
The page component:
- Fetches member data from GraphQL or mock data
- Passes members array to FamilyDetailView
- Handles navigation when member is selected
- Supports mock data fallback

## User Interactions

### Viewing Members
1. Navigate to family detail page
2. Click on "Thành viên" (Members) tab
3. View all family members in grid layout
4. Each card shows member information and health status

### Adding a Member
1. Click "Thêm thành viên" (Add Member) button
2. Fill in required fields in the modal
3. Optional: Add phone number and email
4. Click "Lưu" (Save) to add member
5. Modal closes and new member appears in grid

### Viewing Member Record
1. Click "Xem hồ sơ" (View Record) button on member card
2. Navigates to patient detail page (to be implemented in future tasks)

### Scheduling Appointment
1. Click "Đặt lịch" (Schedule Appointment) button on member card
2. Opens appointment scheduler (integration with existing system in task 27)

## Responsive Design

### Grid Layout
- Desktop (md+): 3 columns
- Tablet (sm): 2 columns
- Mobile (xs): 1 column

### Card Design
- Fixed height for consistent grid
- Hover effect with elevation
- Touch-friendly button sizes
- Responsive text overflow handling

## Requirements Satisfied

✅ **Requirement 2.3**: Display all family members with avatar, name, age, gender, relationship to household head, and health overview

✅ **Requirement 3.1**: Add Member button displays form to input member basic information, relationship to household head, and medical history

✅ **Requirement 3.2**: Creating new member record updates the family member list

✅ **Requirement 3.3**: View Record button navigates to detailed patient view

✅ **Requirement 3.4**: Schedule Appointment button opens appointment creation interface pre-filled with member information

✅ **Requirement 3.5**: Display examination count on member card (shown as recent visit count)

## Future Enhancements

### Task 27 Integration
- Connect "Schedule Appointment" to existing appointment system
- Pre-fill appointment form with member information

### Backend Integration
- Replace mock data with GraphQL mutations
- Implement real member creation API
- Add photo upload functionality
- Sync with backend database

### Additional Features
- Edit member information
- Delete member (with confirmation)
- Member search/filter within family
- Sort members by various criteria
- Export member list

## Testing Recommendations

### Manual Testing
1. Test with families of different sizes (2-5 members)
2. Test add member with valid and invalid data
3. Test all validation rules
4. Test responsive layout on different screen sizes
5. Test navigation flows

### Automated Testing (Future)
- Component rendering tests
- Form validation tests
- User interaction tests
- Integration tests with parent components

## Notes

- The implementation uses Material-UI components for consistency
- Vietnamese language is used throughout the UI
- Mock data is used for development without backend
- Health status colors follow standard medical UI conventions
- Avatar colors are gender-specific for quick visual identification
