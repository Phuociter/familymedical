import { gql } from '@apollo/client';

// Mutation để phản hồi yêu cầu assign bác sĩ
export const RESPOND_TO_DOCTOR_REQUEST = gql`
  mutation RespondToDoctorRequest(
    $requestId: ID!
    $status: RequestStatus!
    $message: String
  ) {
    respondToDoctorRequest(
      requestId: $requestId
      status: $status
      message: $message
    ) {
      requestID
      message
      status
      responseDate
      responseMessage
    }
  }
`;

// Appointment mutations
export const CREATE_APPOINTMENT = gql`
  mutation CreateAppointment($input: CreateAppointmentInput!) {
    createAppointment(input: $input) {
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
      }
      doctor {
        userID
        fullName
      }
    }
  }
`;

export const UPDATE_APPOINTMENT = gql`
  mutation UpdateAppointment($input: UpdateAppointmentInput!) {
    updateAppointment(input: $input) {
      appointmentID
      title
      type
      appointmentDateTime
      duration
      status
      location
      notes
      doctorNotes
      updatedAt
      family {
        familyID
        familyName
      }
      member {
        memberID
        fullName
      }
    }
  }
`;

export const UPDATE_APPOINTMENT_STATUS = gql`
  mutation UpdateAppointmentStatus($appointmentID: Int!, $status: AppointmentStatus!) {
    updateAppointmentStatus(appointmentID: $appointmentID, status: $status) {
      appointmentID
      status
      updatedAt
    }
  }
`;

export const CANCEL_APPOINTMENT = gql`
  mutation CancelAppointment($appointmentID: Int!, $reason: String) {
    cancelAppointment(appointmentID: $appointmentID, reason: $reason) {
      appointmentID
      status
      doctorNotes
      updatedAt
    }
  }
`;

// User profile mutations
export const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($input: UpdateDoctorInput!) {
    updateDoctorProfile(input: $input) {
      userID
      fullName
      email
      phoneNumber
      address
      cccd
      avatarUrl
      doctorCode
      hospitalName
      yearsOfExperience
    }
  }
`;

export const CHANGE_PASSWORD = gql`
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input)
  }
`;
