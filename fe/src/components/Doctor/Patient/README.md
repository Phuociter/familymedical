# Patient Components

This directory contains components for the patient detail view.

## Components

### PatientHeader
Displays patient identification and quick actions.

**Features:**
- Patient photo/avatar
- Full name, age, gender, and relationship
- Quick statistics (total visits, last visit date, current status)
- Action buttons:
  - Schedule Appointment
  - Prescribe Medication
  - Add Test Result
- Responsive layout for mobile, tablet, and desktop
- Color-coded status badges

**Requirements:** 4.1, 4.2

### PatientOverviewSidebar
Displays key health information at a glance in a sidebar.

**Features:**
- Health indicators section with color-coded cards
- Alerts and warnings for critical health indicators
- Current medications list with active prescriptions
- Upcoming appointments with dates and times
- Contact information section
- Responsive layout

**Requirements:** 4.3

### HealthIndicatorCard
Displays a single health indicator with color-coded status.

**Features:**
- Color-coded border and background based on status (normal/warning/critical)
- Indicator icon and label
- Value display with unit
- Status chip
- Normal range reference
- Measurement date
- Optional trend indicator (up/down/stable)
- Hover effects

**Requirements:** 4.3

## Usage Example

```jsx
import { PatientHeader, PatientOverviewSidebar } from '../../components/Doctor/Patient';

function PatientDetailPage() {
  const patient = {
    memberID: '1',
    fullName: 'Nguyễn Văn An',
    dateOfBirth: '1975-05-15',
    gender: 'Nam',
    currentStatus: 'active',
    totalVisits: 15,
    lastVisitDate: '2024-11-10',
    // ... other fields
  };

  return (
    <>
      <PatientHeader
        patient={patient}
        onScheduleAppointment={() => console.log('Schedule')}
        onPrescribe={() => console.log('Prescribe')}
        onAddTestResult={() => console.log('Add test')}
      />
      
      <PatientOverviewSidebar patient={patient} />
    </>
  );
}
```

## Mock Data

The components use mock data from `src/mocks/familyMockData.js`:
- `MOCK_PATIENT_DETAILS` - Patient information
- `MOCK_HEALTH_INDICATORS` - Health indicator measurements
- `MOCK_PRESCRIPTIONS` - Medication prescriptions
- `MOCK_APPOINTMENTS` - Scheduled appointments

## Styling

Components use Material-UI theme with custom color variants:
- `success.lighter` - Light green background for normal status
- `warning.lighter` - Light orange background for warning status
- `error.lighter` - Light red background for critical status
- `info.lighter` - Light blue background for info items

## Responsive Design

All components are fully responsive:
- **Mobile (< 600px)**: Single column layout, stacked buttons
- **Tablet (600px - 960px)**: Adjusted spacing and button sizes
- **Desktop (> 960px)**: Full layout with sidebar

## Status Colors

Health status is color-coded throughout:
- **Normal** (Green): Healthy, no issues
- **Monitoring** (Yellow/Orange): Requires periodic monitoring
- **Active** (Red): Active treatment required
- **Warning** (Orange): Indicator outside normal range
- **Critical** (Red): Indicator at dangerous level
