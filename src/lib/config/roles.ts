export const APP_ROLES = [
  "admin","dofficer","experienceadmin","expteam","soulcareadmin","soulcareteam",
  "megastars","megastarsadmin","research","testimonyteam","connectcentre",
] as const;
export type AppRole = (typeof APP_ROLES)[number];
export interface NavItem { id: string; label: string; href: string; icon: string; }
export interface NavSection { title: string | null; items: NavItem[]; }
export const ROLE_META: Record<AppRole, { label: string; color: string }> = {
  admin: { label: "Administrator", color: "var(--brand-green)" },
  dofficer: { label: "Data Officer", color: "var(--brand-green)" },
  experienceadmin: { label: "Experience Team Admin", color: "var(--brand-gold)" },
  expteam: { label: "Experience Team", color: "var(--brand-gold)" },
  soulcareadmin: { label: "Soul Care Admin", color: "var(--success)" },
  soulcareteam: { label: "Soul Care Team", color: "var(--success)" },
  megastars: { label: "Megastars", color: "var(--chart-4)" },
  megastarsadmin: { label: "Megastars Admin", color: "var(--chart-4)" },
  research: { label: "Research", color: "var(--chart-3)" },
  testimonyteam: { label: "Testimony Team", color: "var(--chart-5)" },
  connectcentre: { label: "Connect Centre", color: "var(--brand-green-mid)" },
};
const NAV: Record<AppRole, NavItem[]> = {
  dofficer: [
    { id: "firsttimers", label: "First-Timers", href: "/first-timers", icon: "Users" },
    { id: "vip_contact", label: "VIP Contact", href: "/first-timers/vip-contact", icon: "MessageCircle" },
    { id: "addmember", label: "Add Record", href: "/first-timers/new", icon: "UserPlus" },
    { id: "qrcode", label: "QR Code", href: "/first-timers/qr", icon: "QrCode" },
    { id: "nc_registry", label: "Registry", href: "/new-converts", icon: "BookOpen" },
    { id: "nc_qr", label: "QR Code", href: "/new-converts/qr", icon: "QrCode" },
    { id: "megastars_checkinout", label: "Check In / Out", href: "/megastars/check-in-out", icon: "LogIn" },
    { id: "megastars_services", label: "Services", href: "/megastars/services", icon: "Calendar" },
    { id: "megastars_roster", label: "Roster", href: "/megastars/roster", icon: "ClipboardList" },
  ],
  admin: [
    { id: "admin_overview", label: "Overview", href: "/admin", icon: "LayoutDashboard" },
    { id: "admin_users", label: "Users", href: "/admin/users", icon: "Users" },
    { id: "admin_adduser", label: "Add User", href: "/admin/users/new", icon: "UserPlus" },
    { id: "firsttimers", label: "First-Timers", href: "/first-timers", icon: "Users" },
    { id: "vip_contact", label: "VIP Contact", href: "/first-timers/vip-contact", icon: "MessageCircle" },
    { id: "qrcode", label: "VIPs QR Code", href: "/first-timers/qr", icon: "QrCode" },
    { id: "assign_calls", label: "Assign Calls", href: "/experience/assign-calls", icon: "PhoneForwarded" },
    { id: "callqueue", label: "Call Queue", href: "/experience/call-queue", icon: "Phone" },
    { id: "experience_dashboard", label: "Analytics Dashboard", href: "/experience/dashboard", icon: "BarChart3" },
    { id: "add_visit", label: "Add Visit", href: "/soul-care/visits/new", icon: "Home" },
    { id: "vip_journey_dashboard", label: "VIP Journey Dashboard", href: "/soul-care/vip-journey", icon: "Route" },
    { id: "sc_assign", label: "Assign Visits", href: "/soul-care/assign", icon: "Send" },
    { id: "sc_queue", label: "Visit Queue", href: "/soul-care/queue", icon: "ListChecks" },
    { id: "pe_assign", label: "Potential Envoys", href: "/soul-care/potential-envoys", icon: "UserCheck" },
    { id: "nc_registry", label: "Registry", href: "/new-converts", icon: "BookOpen" },
    { id: "steward_care", label: "Stewards Care", href: "/soul-care/steward-care", icon: "HeartHandshake" },
    { id: "members_care", label: "Members Care", href: "/soul-care/members-care", icon: "HeartHandshake" },
    { id: "care_priority_list", label: "Care Priority List", href: "/soul-care/priority", icon: "AlertTriangle" },
    { id: "report", label: "Report", href: "/reports", icon: "FileBarChart" },
    { id: "nc_qr", label: "QR Code", href: "/new-converts/qr", icon: "QrCode" },
    { id: "nc_report", label: "New Converts Retention", href: "/new-converts/report", icon: "TrendingUp" },
    { id: "allfeedback", label: "All Feedback", href: "/feedback", icon: "MessagesSquare" },
    { id: "flagged", label: "Flagged", href: "/feedback/flagged", icon: "Flag" },
    { id: "visitation_tab", label: "Visitations", href: "/soul-care/visitations", icon: "Home" },
    { id: "megastars_checkinout", label: "Check In / Out", href: "/megastars/check-in-out", icon: "LogIn" },
    { id: "megastars_services", label: "Services", href: "/megastars/services", icon: "Calendar" },
    { id: "megastars_roster", label: "Roster", href: "/megastars/roster", icon: "ClipboardList" },
    { id: "research_feedback", label: "VIPs Feedback", href: "/research/feedback", icon: "MessageSquare" },
    { id: "general_feedback", label: "General Feedback", href: "/research/general-feedback", icon: "MessageSquare" },
    { id: "feedback_qr", label: "Feedback QR", href: "/research/qr", icon: "QrCode" },
    { id: "sc_testimonies", label: "Visitation Testimony", href: "/testimonies", icon: "BookHeart" },
    { id: "testimony_qr", label: "Testimony QR", href: "/testimonies/qr", icon: "QrCode" },
    { id: "testimony_bank", label: "Testimony Bank", href: "/testimonies/bank", icon: "Archive" },
    { id: "soulcare_dashboard", label: "Soul Care Dashboard", href: "/soul-care/dashboard", icon: "BarChart3" },
    { id: "connect_centre_prospects", label: "Connect Centre", href: "/connect-centre", icon: "Handshake" },
  ],
  experienceadmin: [
    { id: "assign_calls", label: "Assign Calls", href: "/experience/assign-calls", icon: "PhoneForwarded" },
    { id: "completed_pipelines", label: "Completed Pipelines", href: "/experience/completed", icon: "CheckCircle2" },
    { id: "pe_assign", label: "Potential Envoys", href: "/soul-care/potential-envoys", icon: "UserCheck" },
    { id: "envoys_visitors", label: "Envoys Visitors", href: "/experience/visitors", icon: "Users" },
    { id: "callqueue", label: "Call Queue", href: "/experience/call-queue", icon: "Phone" },
    { id: "allfeedback", label: "All Feedback", href: "/feedback", icon: "MessagesSquare" },
    { id: "flagged", label: "Flagged", href: "/feedback/flagged", icon: "Flag" },
    { id: "experience_dashboard", label: "Analytics Dashboard", href: "/experience/dashboard", icon: "BarChart3" },
    { id: "vip_journey_dashboard", label: "VIP Journey Dashboard", href: "/soul-care/vip-journey", icon: "Route" },
  ],
  expteam: [
    { id: "mycalls", label: "My Calls", href: "/experience/my-calls", icon: "Phone" },
    { id: "callqueue", label: "Call Queue", href: "/experience/call-queue", icon: "Phone" },
    { id: "allfeedback", label: "All Feedback", href: "/feedback", icon: "MessagesSquare" },
    { id: "flagged", label: "Flagged", href: "/feedback/flagged", icon: "Flag" },
    { id: "experience_dashboard", label: "Analytics Dashboard", href: "/experience/dashboard", icon: "BarChart3" },
  ],
  soulcareadmin: [
    { id: "add_visit", label: "Add Visit", href: "/soul-care/visits/new", icon: "Home" },
    { id: "sc_assign", label: "Assign Visits", href: "/soul-care/assign", icon: "Send" },
    { id: "sc_queue", label: "Visit Queue", href: "/soul-care/queue", icon: "ListChecks" },
    { id: "sc_mine", label: "My Visits", href: "/soul-care/my-visits", icon: "Home" },
    { id: "sc_flagged", label: "Flagged", href: "/soul-care/flagged", icon: "Flag" },
    { id: "sc_testimonies", label: "Care Testimonies", href: "/testimonies", icon: "BookHeart" },
    { id: "pe_mine", label: "My Potential Envoys", href: "/soul-care/my-potential-envoys", icon: "UserCheck" },
    { id: "nc_assign", label: "New Converts", href: "/new-converts/assign", icon: "BookOpen" },
    { id: "nc_mine", label: "My New Converts", href: "/new-converts/mine", icon: "BookOpen" },
    { id: "nc_qr", label: "QR Code", href: "/new-converts/qr", icon: "QrCode" },
    { id: "nc_report", label: "New Converts Retention", href: "/new-converts/report", icon: "TrendingUp" },
    { id: "soulcare_dashboard", label: "Soul Care Dashboard", href: "/soul-care/dashboard", icon: "BarChart3" },
    { id: "vip_journey_dashboard", label: "VIP Journey Dashboard", href: "/soul-care/vip-journey", icon: "Route" },
  ],
  soulcareteam: [
    { id: "sc_mine", label: "My Visits", href: "/soul-care/my-visits", icon: "Home" },
    { id: "nc_mine", label: "My New Converts", href: "/new-converts/mine", icon: "BookOpen" },
  ],
  megastars: [
    { id: "megastars_checkinout", label: "Check In / Out", href: "/megastars/check-in-out", icon: "LogIn" },
    { id: "megastars_roster", label: "Roster", href: "/megastars/roster", icon: "ClipboardList" },
  ],
  megastarsadmin: [
    { id: "megastars_checkinout", label: "Check In / Out", href: "/megastars/check-in-out", icon: "LogIn" },
    { id: "megastars_services", label: "Services", href: "/megastars/services", icon: "Calendar" },
    { id: "megastars_roster", label: "Roster", href: "/megastars/roster", icon: "ClipboardList" },
  ],
  research: [
    { id: "research_feedback", label: "Service Feedback", href: "/research/feedback", icon: "MessageSquare" },
    { id: "feedback_qr", label: "Feedback QR", href: "/research/qr", icon: "QrCode" },
    { id: "general_feedback", label: "General Feedback", href: "/research/general-feedback", icon: "MessageSquare" },
  ],
  testimonyteam: [
    { id: "sc_testimonies", label: "Testimonies", href: "/testimonies", icon: "BookHeart" },
    { id: "testimony_bank", label: "Testimony Bank", href: "/testimonies/bank", icon: "Archive" },
    { id: "testimony_qr", label: "Testimony QR", href: "/testimonies/qr", icon: "QrCode" },
  ],
  connectcentre: [{ id: "connect_centre_prospects", label: "Prospective Members", href: "/connect-centre", icon: "Handshake" }],
};
const NAV_GROUP_DEFS: Partial<Record<AppRole, { title: string; ids: string[] }[]>> = {
  dofficer: [
    { title: "First-Timers", ids: ["firsttimers", "vip_contact", "addmember", "qrcode"] },
    { title: "New Converts", ids: ["nc_registry", "nc_qr"] },
    { title: "Megastars", ids: ["megastars_checkinout", "megastars_services", "megastars_roster"] },
  ],
  admin: [
    { title: "Administration", ids: ["admin_overview", "admin_users", "admin_adduser"] },
    { title: "First-Timers", ids: ["firsttimers", "vip_contact", "qrcode"] },
    { title: "Experience Team", ids: ["assign_calls", "callqueue", "experience_dashboard"] },
    { title: "Visits", ids: ["add_visit", "sc_assign", "sc_queue", "visitation_tab"] },
    { title: "Retention Funnel", ids: ["completed_pipelines", "pe_assign", "envoys_visitors"] },
    { title: "Care Channels", ids: ["members_care", "steward_care", "care_priority_list", "nc_assign", "nc_qr", "nc_report", "soulcare_dashboard"] },
    { title: "Pastoral", ids: ["report", "allfeedback", "flagged", "nc_report"] },
    { title: "Megastars", ids: ["megastars_checkinout", "megastars_services", "megastars_roster"] },
    { title: "Research", ids: ["research_feedback", "general_feedback", "feedback_qr"] },
    { title: "Testimonies", ids: ["sc_testimonies", "testimony_bank", "testimony_qr"] },
    { title: "Connect Centre", ids: ["connect_centre_prospects"] },
  ],
  soulcareadmin: [
    { title: "Visits", ids: ["add_visit", "sc_assign", "sc_queue", "sc_mine", "sc_flagged"] },
    { title: "New Converts", ids: ["nc_assign", "nc_mine", "nc_qr", "nc_report"] },
    { title: "Potential Envoys", ids: ["pe_mine"] },
    { title: "Testimonies", ids: ["sc_testimonies"] },
    { title: "Reports", ids: ["soulcare_dashboard", "vip_journey_dashboard"] },
  ],
};
export function getNavItems(role: AppRole): NavItem[] { return NAV[role] ?? []; }
export function buildNavSections(role: AppRole): NavSection[] {
  const items = getNavItems(role);
  const groups = NAV_GROUP_DEFS[role];
  if (!groups) return [{ title: null, items }];
  const grouped: NavSection[] = groups.map((g) => ({ title: g.title, items: items.filter((i) => g.ids.includes(i.id)) }));
  const coveredIds = new Set(groups.flatMap((g) => g.ids));
  const leftover = items.filter((i) => !coveredIds.has(i.id));
  if (leftover.length) grouped.push({ title: "Other", items: leftover });
  return grouped.filter((s) => s.items.length > 0);
}
export const DEFAULT_ROUTE: Record<AppRole, string> = {
  admin: "/admin", dofficer: "/first-timers", experienceadmin: "/experience/assign-calls",
  expteam: "/experience/my-calls", soulcareadmin: "/soul-care/dashboard", soulcareteam: "/soul-care/my-visits",
  megastars: "/megastars/check-in-out", megastarsadmin: "/megastars/check-in-out",
  research: "/research/feedback", testimonyteam: "/testimonies", connectcentre: "/connect-centre",
};
