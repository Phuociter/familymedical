import { gql } from '@apollo/client';

export const familyAppointments = gql`
  query FamilyAppointments {
    familyAppointments {
      appointmentID
      title
      type
      appointmentDateTime
      duration
      status
      location
      notes
      doctor {
        userID
        fullName
      }
      member {
        memberID
        fullName
      }
      createdAt
    }
  }
`;

