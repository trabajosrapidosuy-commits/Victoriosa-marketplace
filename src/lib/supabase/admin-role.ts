const allowedAdminRoles = new Set(["admin", "marketplace_admin"]);

export function isAdminRole(role: string | null | undefined) {
  return Boolean(role && allowedAdminRoles.has(role));
}

export function getAuthenticatedHomePath(role: string | null | undefined) {
  return isAdminRole(role) ? "/admin/autopilot" : "/account";
}
