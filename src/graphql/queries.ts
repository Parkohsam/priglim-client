import { gql } from "@apollo/client";

export const GET_PACKAGES = gql`
  query GetPackages {
    packages {
      id
      title
      type
      description
      price
      duration
      bookingOpenDate
      bookingCloseDate
      departureDate
      returnDate
      availabilityStatus
      images
    }
  }
`;