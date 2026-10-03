import { existsSync } from "node:fs";
import { resolve } from "node:path";

const required = ["src/services/work-order-service.mjs", "supabase/migrations/20261003_task_016_work_orders.sql", "tests/task-016-work-orders.test.mjs", "app/admin/admin-shell.js"];
for (const file of required) if (!existsSync(resolve(file))) throw new Error(`TASK-016 missing: ${file}`);
const service = await import("../src/services/work-order-service.mjs");
for (const key of ["createWorkOrder", "transitionWorkOrder", "listWorkOrders", "suggestAreaForReport"]) if (typeof service[key] !== "function") throw new Error(`TASK-016 missing export: ${key}`);
if (!service.WORK_ORDER_STATUSES.has("awaiting_validation")) throw new Error("TASK-016 missing validation state.");
console.log("TASK-016 CHECK OK");
