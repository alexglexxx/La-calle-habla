import { getPublicPortalData } from "../../src/services/public-report-view.mjs";
import { listReports, getReportStats, listCategories, listStatuses } from "../../src/services/report-service.mjs";
import AdminShell from "./admin-shell";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  const reports = listReports();
  const data = getPublicPortalData();
  const stats = getReportStats();

  return (
    <AdminShell
      territory={data.territory}
      reports={reports}
      stats={stats}
      categories={listCategories()}
      statuses={listStatuses()}
    />
  );
}
