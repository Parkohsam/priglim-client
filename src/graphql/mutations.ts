import { gql } from "@apollo/client";

export const SYNC_USER = gql`
  mutation SyncUser($fullName: String!, $phone: String) {
    syncUser(fullName: $fullName, phone: $phone) {
      id
      fullName
      email
      role
    }
  }
`;
export const CREATE_PACKAGE = gql`
  mutation CreatePackage($input: PackageInput!) {
    createPackage(input: $input) {
      id
      title
      availabilityStatus
    }
  }
`;

export const SET_PACKAGE_AVAILABILITY = gql`
  mutation SetPackageAvailability($id: ID!, $availabilityStatus: String!) {
    setPackageAvailability(id: $id, availabilityStatus: $availabilityStatus) {
      id
      availabilityStatus
    }
  }
`;

export const DELETE_PACKAGE = gql`
  mutation DeletePackage($id: ID!) {
    deletePackage(id: $id)
  }
`;
export const CREATE_BOOKING = gql`
  mutation CreateBooking($input: CreateBookingInput!) {
    createBooking(input: $input) {
      id
      numberOfPilgrims
      totalAmount
      status
      paymentStatus
    }
  }
`;