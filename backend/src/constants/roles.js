export const ROLES = {
  STUDENT: "student",
  COLLEGE_ADMIN: "college_admin",
  COLLEGE_OWNER: "college_owner",
  SUPER_ADMIN: "super_admin"
};

export const ROLE_VALUES = Object.values(ROLES);

export const ROLE_RANK = {
  [ROLES.STUDENT]: 10,
  [ROLES.COLLEGE_ADMIN]: 50,
  [ROLES.COLLEGE_OWNER]: 90,
  [ROLES.SUPER_ADMIN]: 100
};

export const isCollegeAdminRole = (role) =>
  [ROLES.COLLEGE_ADMIN, ROLES.COLLEGE_OWNER, ROLES.SUPER_ADMIN].includes(role);
