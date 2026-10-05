"use client";

import dynamic from "next/dynamic";

const ReportFormClient = dynamic(() => import("./report-form-client"), {
  ssr: false,
  loading: () => <div className="report-shell"><div className="report-card">Cargando formulario…</div></div>
});

export default ReportFormClient;
