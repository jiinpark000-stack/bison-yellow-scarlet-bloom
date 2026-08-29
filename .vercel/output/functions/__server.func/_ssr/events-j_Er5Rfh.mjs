import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as createServerFn } from "./ssr.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { n as cn } from "./utils-gSYKWV4o.mjs";
import { a as number, o as object, r as boolean, s as string, t as _enum } from "../_libs/zod.mjs";
import { s as createSsrRpc } from "./session-client-FsXee0JG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/events-j_Er5Rfh.js
var import_jsx_runtime = require_jsx_runtime();
var badgeVariants = cva("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", {
	variants: { variant: {
		default: "border-transparent bg-primary/10 text-primary",
		outline: "border-border text-muted",
		up: "border-transparent bg-up/10 text-up",
		down: "border-transparent bg-down/10 text-down",
		warn: "border-transparent bg-warn/10 text-warn"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
var tokenSchema = object({ token: string().optional() });
var upsertEventFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	id: number().int().optional(),
	name: string().min(1).max(30),
	description: string().max(120).optional(),
	fee: number().min(0).max(1e5),
	reward: number().min(0).max(1e5),
	eventOn: string().optional(),
	openNow: boolean().optional()
}).parse(d)).handler(createSsrRpc("c8d2fd324e4be2bbc41c2485534b6114a0017b07ed7a9fc2b31678e4290d84ce"));
var setEventStatusFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	id: number().int(),
	status: _enum([
		"draft",
		"open",
		"closed"
	])
}).parse(d)).handler(createSsrRpc("804d111d2b1294fb9097e71d98a041828059cbb0089f8e5f10e96832233bc286"));
var deleteEventFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	id: number().int()
}).parse(d)).handler(createSsrRpc("e2561243f50514b3ae5f8c78537b7204f604e650b2a43d3ca0261ad7cdd35066"));
var teacherJoinEventFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	eventId: number().int(),
	studentId: number().int()
}).parse(d)).handler(createSsrRpc("d91a8dfb9af0ad49956bf45f147fbcde91926f92096ec61bd8b1340452b28bc4"));
var teacherCancelEventFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	eventId: number().int(),
	studentId: number().int()
}).parse(d)).handler(createSsrRpc("84150c9443884163455548a5607a082891e530c4225eabb165ee4b83ae2ae9bf"));
var teacherJoinAllFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	eventId: number().int()
}).parse(d)).handler(createSsrRpc("ac079925e5ef7977cdbdf517dff61859b8ab63dc6f0ef8a6aba7cfc9b6aaa3b0"));
var payEventRewardsFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	eventId: number().int()
}).parse(d)).handler(createSsrRpc("bb78d89cc1887717c1d46fbbaa4da6cfc20a2982dc5db8d21463c2eafa7c1f81"));
var studentEventsFn = createServerFn({ method: "GET" }).validator((d) => tokenSchema.parse(d ?? {})).handler(createSsrRpc("abf6b354369f78106087dc28ccb974752837bf574fde8ed371bba89a54ef8192"));
var joinEventFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	eventId: number().int()
}).parse(d)).handler(createSsrRpc("91676114b4d8233cad65fbc774569a9a27a8d2dea9291135ebc17283dd7b4f74"));
var cancelJoinFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	eventId: number().int()
}).parse(d)).handler(createSsrRpc("8ec5fd2a5ecf520cd9e13498d6a757c62bf03fb58d2e2a833f5878a32ac5eefa"));
//#endregion
export { payEventRewardsFn as a, teacherCancelEventFn as c, upsertEventFn as d, joinEventFn as i, teacherJoinAllFn as l, cancelJoinFn as n, setEventStatusFn as o, deleteEventFn as r, studentEventsFn as s, Badge as t, teacherJoinEventFn as u };
