# Medical Record Timeline Component

## Overview

The Medical Record Timeline component displays a patient's medical history in a chronological vertical timeline format with filtering and pagination capabilities.

## Components

### MedicalRecordTimeline (Main Component)

The main timeline component that orchestrates the display of medical records.

**Props:**
- `memberId` (string): Patient member ID
- `records` (Array): Array of medical record objects
- `loading` (boolean): Loading state indicator
- `error` (Error): Error object if data fetch fails
- `onRecordClick` (Function, optional): Callback when a record is clicked

**Features:**
- Vertical timeline layout with chronological ordering (newest first)
- Date range filtering
- Disease type filtering
- Pagination (10 records per page)
- Empty state handling
- Loading state handling
- Error state handling

**Requirements Addressed:**
- 4.4: Display medical records in vertical timeline
- 4.5: Provide filtering by time period and disease type
- 5.1: Show examination details in timeline
- 5.2: Filter by time period
- 5.3: Filter by disease type
- 5.4: Expandable entries
- 5.5: Link to test results

### TimelineEntry

Individual timeline entry component that displays a single medical record.

**Props:**
- `record` (MedicalRecord): Medical record object
- `isLast` (boolean): Whether this is the last entry in the timeline

**Features:**
- Expandable/collapsible details
- Summary view showing:
  - Date
  - Diagnosis
  - Symptoms
  - Doctor name
  - Quick indicators (prescriptions, test results, files)
- Expanded view showing:
  - Clinical findings
  - Diagnosis codes (ICD-10)
  - Treatment plan
  - Prescriptions with details
  - Test results with details
  - Follow-up date
  - Doctor notes
  - File download link

### TimelineFilters

Filter component for the timeline.

**Props:**
- `filters` (Object): Current filter values
- `onFilterChange` (Function): Callback when filters change

**Features:**
- Date range picker (from/to)
- Disease type dropdown with categories:
  - Cardiovascular (Tim mạch)
  - Respiratory (Hô hấp)
  - Digestive (Tiêu hóa)
  - Musculoskeletal (Xương khớp)
  - Endocrine (Nội tiết)
  - Infectious (Nhiễm trùng)
  - Other (Khác)
- Clear filters button
- Responsive layout

## Usage

```jsx
import MedicalRecordTimeline from '../../components/Doctor/Patient/MedicalRecordTimeline';

function PatientDetailPage() {
  const medicalRecords = [
    {
      recordID: '101',
      memberID: '1',
      recordDate: '2024-11-10',
      symptoms: 'Đau đầu, chóng mặt',
      diagnosis: 'Tăng huyết áp độ 1',
      treatmentPlan: 'Thuốc hạ huyết áp',
      doctorName: 'BS. Trần Văn Minh',
      prescriptions: [...],
      testResults: [...],
      // ... other fields
    },
    // ... more records
  ];

  return (
    <MedicalRecordTimeline
      memberId="1"
      records={medicalRecords}
      loading={false}
      error={null}
    />
  );
}
```

## Data Structure

The component expects medical records in the following format:

```javascript
{
  recordID: string,
  memberID: string,
  recordDate: string (ISO date),
  symptoms: string,
  clinicalFindings: string (optional),
  diagnosis: string,
  diagnosisCodes: string[] (optional),
  treatmentPlan: string,
  fileLink: string (optional),
  doctorID: string,
  doctorName: string,
  followUpDate: string (ISO date, optional),
  notes: string (optional),
  prescriptions: Prescription[] (optional),
  testResults: TestResult[] (optional)
}
```

## Filtering Logic

### Date Range Filtering
- Filters records where `recordDate` falls within the specified range
- Supports filtering by start date only, end date only, or both

### Disease Type Filtering
- Uses keyword matching against diagnosis and symptoms
- Keywords are predefined for each disease category
- Case-insensitive matching

## Pagination

- Default: 10 records per page
- Shows pagination controls when more than 10 records
- Includes first/last page buttons
- Scrolls to top when page changes

## Responsive Design

- Mobile: Stacked filter layout
- Tablet/Desktop: Horizontal filter layout
- Timeline adapts to screen width
- Touch-friendly expand/collapse buttons

## Integration

The component is integrated into the PatientDetailPage:

1. Import the component
2. Fetch or provide medical records data
3. Pass records to the timeline component
4. Component handles all filtering, pagination, and display logic

## Mock Data

Mock data is provided in `src/mocks/familyMockData.js`:
- `MOCK_MEDICAL_RECORDS_ENHANCED`: Enhanced medical records with full details
- Includes prescriptions and test results
- Multiple patients with varying record counts

## Future Enhancements

Potential improvements for future iterations:
- Export timeline to PDF
- Print view
- Advanced search within records
- Sorting options (date, diagnosis, doctor)
- Record comparison view
- Integration with backend GraphQL API
- Real-time updates
- Attachment preview
