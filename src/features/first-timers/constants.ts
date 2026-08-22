/** Ported verbatim from V1's AREAS and marital/gender/life-stage option sets. */
export const AREAS_OF_INTEREST = [
  { value: "billionpreneur", label: "Billionpreneur Hub" },
  { value: "ceos", label: "CEOs Hub" },
  { value: "directors", label: "Directors Hub" },
  { value: "scholars", label: "Scholars Hub" },
  { value: "creatives", label: "Creatives Hub" },
  { value: "ministry", label: "Ministry Hub" },
  { value: "indecisive", label: "Indecisive" },
] as const;

export const GENDER_OPTIONS = ["Male", "Female"] as const;
export const MARITAL_STATUS_OPTIONS = ["Single", "Married", "Divorced", "Widowed"] as const;
export const LIFE_STAGE_OPTIONS = ["Student", "Employee", "Business Owner"] as const;
export const MEMBERSHIP_DECISION_OPTIONS = ["Member", "Visitor", "Undecided"] as const;

export const CSV_TEMPLATE_HEADERS = [
  "full_name", "phone", "email", "gender", "dob",
  "marital_status", "life_stage", "house_address", "nearest_landmark",
];
export const CSV_TEMPLATE_EXAMPLE = [
  "Adaeze Okafor", "08031234567", "adaeze@example.com", "Female", "1994-03-12",
  "Married", "Employee", "12 Palm Street Ikeja", "Near Chevron Roundabout",
];
