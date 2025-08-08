import { INodeProperties } from "n8n-workflow";

export const profileProperties: INodeProperties[] = [
  // PROFILE - Paramètres Linkup
  {
    displayName: "Extract Profile Parameters",
    name: "extractProfileParams",
    type: "collection",
    placeholder: "Add profile parameter",
    default: {},
    displayOptions: {
      show: {
        resource: ["profile"],
        operation: ["extractProfileInfo"],
      },
    },
    options: [
      {
        displayName: "LinkedIn Profile URL *",
        name: "profileUrl",
        type: "string",
        required: true,
        default: "",
        placeholder: "https://www.linkedin.com/in/username",
        description: "LinkedIn profile URL",
      },
      {
        displayName: "Country Code",
        name: "country",
        type: "string",
        default: "FR",
        placeholder: "FR, US, UK, DE, ES, IT, CA, AU, etc.",
        description:
          "Country code for proxy selection (e.g., FR for France, US for United States)",
      },
    ],
  },
  {
    displayName: "Get My Profile Parameters",
    name: "getMyProfileParams",
    type: "collection",
    placeholder: "Add parameter",
    default: {},
    displayOptions: {
      show: {
        resource: ["profile"],
        operation: ["getMyProfile"],
      },
    },
    options: [
      {
        displayName: "Country",
        name: "country",
        type: "string",
        default: "FR",
        placeholder: "FR, US, UK, DE, ES, IT, CA, AU, etc.",
        description: "Country code for proxy selection",
      },
    ],
  },
  {
    displayName: "Search Profile Parameters",
    name: "searchProfileParams",
    type: "collection",
    placeholder: "Add search parameter",
    default: {},
    displayOptions: {
      show: {
        resource: ["profile"],
        operation: ["searchProfile"],
      },
    },
    options: [
      {
        displayName: "Keyword",
        name: "keyword",
        type: "string",
        default: "",
        placeholder: "software engineer",
        description: "Search keyword",
      },
      {
        displayName: "Location",
        name: "location",
        type: "string",
        default: "",
        placeholder: "San Francisco",
        description: "Location to search in",
      },
      {
        displayName: "Company URL",
        name: "company_url",
        type: "string",
        default: "",
        placeholder: "https://www.linkedin.com/company/company-name",
        description: "Company LinkedIn URL to filter by",
      },
      {
        displayName: "School URL",
        name: "school_url",
        type: "string",
        default: "",
        placeholder: "https://www.linkedin.com/school/...",
        description: "School LinkedIn URL to filter by",
      },
      {
        displayName: "Network",
        name: "network",
        type: "string",
        default: "",
        placeholder: "1st, 2nd, 3rd",
        description: "Connection degree filter",
      },
      {
        displayName: "First Name",
        name: "first_name",
        type: "string",
        default: "",
      },
      {
        displayName: "Last Name",
        name: "last_name",
        type: "string",
        default: "",
      },
      {
        displayName: "Title",
        name: "title",
        type: "string",
        default: "",
        placeholder: "Job title",
      },
      {
        displayName: "Fetch Invitation State",
        name: "fetch_invitation_state",
        type: "boolean",
        default: false,
        description: "Whether to fetch invitation state",
      },
      {
        displayName: "Total Results",
        name: "total_results",
        type: "number",
        default: 10,
        description: "Number of results to return",
      },
      {
        displayName: "Start Page",
        name: "start_page",
        type: "number",
        default: 1,
        description: "Starting page number",
      },
      {
        displayName: "End Page",
        name: "end_page",
        type: "number",
        default: 1,
        description: "Ending page number",
      },
      {
        displayName: "Country",
        name: "country",
        type: "string",
        default: "FR",
        placeholder: "FR, US, UK, DE, ES, IT, CA, AU, etc.",
        description: "Country code for proxy selection",
      },
    ],
  },
]; 