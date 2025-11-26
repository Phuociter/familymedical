import { gql } from '@apollo/client';

// Query để lấy danh sách yêu cầu assign
export const GET_DOCTOR_REQUESTS = gql`
  query GetDoctorRequests($status: RequestStatus) {
    doctorRequests(status: $status) {
      requestID
      message
      status
      requestDate
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
      headOfFamilyID
      headOfFamily {
        userID
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

// Dashboard query
export const GET_DOCTOR_DASHBOARD = gql`
  query GetDoctorDashboard {
    doctorDashboard {
      stats {
        totalFamilies
        totalPatients
        newRecordsThisMonth
        todayAppointments
        pendingRequests
      }
      weeklyStats {
        week
        appointments
        newRecords
      }
      recentActivities {
        activityID
        type
        description
        timestamp
        relatedEntity
        relatedEntityID
      }
      todayAppointments {
        appointmentID
        title
        type
        appointmentDateTime
        duration
        status
        location
        notes
        member {
          memberID
          fullName
        }
        family {
          familyID
          familyName
        }
      }
      pendingRequests {
        requestID
        message
        status
        requestDate
        family {
          familyID
          familyName
          familyAddress
          headOfFamily {
            userID
            fullName
            phoneNumber
            avatarUrl
          }
          members {
            memberID
            fullName
          }
        }
      }
    }
  }
`;