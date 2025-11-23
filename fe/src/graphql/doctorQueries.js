import { gql } from '@apollo/client';

// Query để lấy danh sách yêu cầu assign
export const GET_DOCTOR_REQUESTS = gql`
  query GetDoctorRequests($status: RequestStatus) {
    doctorRequests(status: $status) {
      requestID
      message
      status
      responseDate
      responseMessage
      family {
        familyAddress
        familyName
        headOfFamily {
          userID
          email
          fullName
          phoneNumber
          address
          avatarUrl
        }
        members {
          memberID
          fullName
        }
      }
    }
  }
`;

export const GET_ASSIGNED_FAMILIES = gql`
  query GetAssignedFamilies($search: String) {
    getDoctorAssignedFamilies(search: $search) {
      familyID
      familyName
      familyAddress
      headOfFamily {
        fullName
        phoneNumber
      }
      members {
        memberID
        fullName
      }
    }
  }
`;

export const GET_FAMILY_MEMBERS = gql`
  query GetFamilyMembers($familyId: ID!) {
    familyMembers(familyId: $familyId) {
      memberID
      fullName
      relationship
      cccd
    }
  }
`;


//////////////////////////

export const GET_MEMBER_MEDICAL_RECORDS = gql`
  query GetMemberMedicalRecords($memberId: ID!) {
    memberMedicalRecords(memberId: $memberId) {
      recordID
      symptoms
      diagnosis
      treatmentPlan
      recordDate
      fileLink
    }
  }
`;

// New enhanced queries for family details
export const GET_FAMILY_DETAIL = gql`
  query GetFamilyDetail($familyId: Int!) {
    familyDetail(familyID: $familyId) {
      familyID
      familyName
      familyAddress
      members {
          memberID
          fullName
          relationship
          dateOfBirth
          gender
      }
      headOfFamily {
          email
          fullName
          phoneNumber
          address
          cccd
      }
    }
  }
`;

// Query for patient detail information
export const GET_PATIENT_DETAIL = gql`
  query GetPatientDetail($memberId: Int!) {
    memberDetail(memberID: $memberId) {
      memberID
      fullName
      dateOfBirth
      gender
      cccd
      phoneNumber
      relationship
      familyID
      family {
        familyID
        familyName
        familyAddress
      }
      medicalRecords {
        recordID
        fileType
        fileLink
        description
        recordDate
        # doctor {
        #   userID
        #   fullName
        # }
      }
    }
  }
`;




// Query for patient medical history with filters
export const GET_PATIENT_MEDICAL_HISTORY = gql`
  query GetPatientMedicalHistory(
    $memberId: ID!
    $startDate: String
    $endDate: String
    $diseaseType: String
  ) {
    patientMedicalHistory(
      memberId: $memberId
      startDate: $startDate
      endDate: $endDate
      diseaseType: $diseaseType
    ) {
      recordID
      memberID
      recordDate
      symptoms
      clinicalFindings
      diagnosis
      diagnosisCodes
      treatmentPlan
      fileLink
      doctorID
      doctorName
      followUpDate
      notes
      prescriptions {
        prescriptionID
        medicationName
        dosage
        frequency
        duration
        status
      }
      testResults {
        testResultID
        testType
        testName
        testDate
        interpretation
      }
    }
  }
`;

// Query for patient prescriptions
export const GET_PATIENT_PRESCRIPTIONS = gql`
  query GetPatientPrescriptions($memberId: ID!, $status: String) {
    patientPrescriptions(memberId: $memberId, status: $status) {
      prescriptionID
      recordID
      medicationName
      dosage
      frequency
      duration
      startDate
      endDate
      status
      instructions
    }
  }
`;

// Query for patient test results
export const GET_PATIENT_TEST_RESULTS = gql`
  query GetPatientTestResults($memberId: ID!, $testType: String) {
    patientTestResults(memberId: $memberId, testType: $testType) {
      testResultID
      recordID
      testType
      testName
      testDate
      interpretation
      fileLink
      results {
        parameterName
        value
        unit
        normalRange
        status
      }
    }
  }
`;

// Appointment queries
export const GET_APPOINTMENTS = gql`
  query GetAppointments($filter: AppointmentFilter) {
    appointments(filter: $filter) {
      appointmentID
      title
      type
      appointmentDateTime
      duration
      status
      location
      notes
      doctorNotes
      createdAt
      updatedAt
      family {
        familyID
        familyName
      }
      member {
        memberID
        fullName
        dateOfBirth
        gender
      }
      doctor {
        userID
        fullName
      }
    }
  }
`;

export const GET_TODAY_APPOINTMENTS = gql`
  query GetTodayAppointments {
    todayAppointments {
      appointmentID
      title
      type
      appointmentDateTime
      duration
      status
      location
      notes
      doctorNotes
      createdAt
      family {
        familyID
        familyName
      }
      member {
        memberID
        fullName
        dateOfBirth
        gender
      }
      doctor {
        userID
        fullName
      }
    }
  }
`;

export const GET_UPCOMING_APPOINTMENTS = gql`
  query GetUpcomingAppointments {
    upcomingAppointments {
      appointmentID
      title
      type
      appointmentDateTime
      duration
      status
      location
      notes
      doctorNotes
      createdAt
      family {
        familyID
        familyName
      }
      member {
        memberID
        fullName
        dateOfBirth
        gender
      }
      doctor {
        userID
        fullName
      }
    }
  }
`;

export const GET_APPOINTMENT_DETAIL = gql`
  query GetAppointmentDetail($appointmentID: Int!) {
    appointmentDetail(appointmentID: $appointmentID) {
      appointmentID
      title
      type
      appointmentDateTime
      duration
      status
      location
      notes
      doctorNotes
      createdAt
      updatedAt
      family {
        familyID
        familyName
        familyAddress
      }
      member {
        memberID
        fullName
        dateOfBirth
        gender
        phoneNumber
      }
      doctor {
        userID
        fullName
        phoneNumber
      }
    }
  }
`;