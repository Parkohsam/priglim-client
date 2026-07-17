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