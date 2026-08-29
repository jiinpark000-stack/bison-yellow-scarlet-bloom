import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, r as Slot, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { n as cn } from "./utils-gSYKWV4o.mjs";
import { a as number, n as array, o as object, s as string } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/session-client-FsXee0JG.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium transition-[color,background-color,transform,opacity] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:not-disabled:scale-[0.96]", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:bg-primary-hover",
			secondary: "bg-secondary text-secondary-foreground hover:bg-border",
			outline: "border border-border bg-surface text-fg hover:bg-surface-2",
			ghost: "text-fg hover:bg-bg-sunken",
			destructive: "bg-destructive text-primary-foreground hover:opacity-90"
		},
		size: {
			default: "h-11 px-4",
			sm: "h-9 px-3 text-sm",
			lg: "h-12 px-5 text-base",
			icon: "size-11"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
function Card({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("rounded-xl border border-border bg-surface text-fg shadow-[var(--shadow-card)]", className),
		...props
	});
}
function CardContent({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("p-5 pt-0", className),
		...props
	});
}
var Input = import_react.forwardRef(({ className, type, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		className: cn("flex h-11 w-full rounded-md border border-input bg-surface px-3 text-base text-fg shadow-none transition-colors placeholder:text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50", className),
		ref,
		...props
	});
});
Input.displayName = "Input";
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var getPublicClass = createServerFn({ method: "GET" }).handler(createSsrRpc("a8622b7af66e42719b4b3d7ffcac8c7460d901d720ff4aab5ce2be2b6e0b8c31"));
createServerFn({ method: "GET" }).validator((d) => object({ token: string().optional() }).parse(d ?? {})).handler(createSsrRpc("801f088297d1080a06a0b54e47f0b96dcacbf20c2d639cb444d86435bd1c903a"));
var teacherLoginFn = createServerFn({ method: "POST" }).validator((d) => object({ password: string().min(1) }).parse(d)).handler(createSsrRpc("22448c90f61f0b387df36c22b061542ec0903fea38aa0170b83a155350ce2bac"));
var studentLoginFn = createServerFn({ method: "POST" }).validator((d) => object({
	studentId: number().int(),
	pin: string().min(1)
}).parse(d)).handler(createSsrRpc("ad51bbe8e1f6ffcedaf185f65ed2b36774e394d393a8b27fc1a060718a9320b5"));
var logoutFn = createServerFn({ method: "POST" }).validator((d) => object({ token: string().optional() }).parse(d ?? {})).handler(createSsrRpc("aa73b4bee0703fcee0aee313d64c867e06644f6e1c392cb1add3a30a055bfa2f"));
var changeTeacherPasswordFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	current: string().min(1),
	next: string().min(4)
}).parse(d)).handler(createSsrRpc("80185e4ca8c459161626aaead59f329802da31c04f280b5c16d6dbdce7ba4930"));
var registerVaultFaceFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	descriptor: array(number())
}).parse(d)).handler(createSsrRpc("747bff290e422be6144da8725acf4dcb2c652687e452f3f5ce8b2ebbc7f79c0f"));
var unlockVaultFaceFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	descriptor: array(number())
}).parse(d)).handler(createSsrRpc("82decfb02566a954ca67a14a520d5ef6635fffa160b8a367da22e01e379bb3cc"));
var unlockVaultPasswordFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	password: string().min(1)
}).parse(d)).handler(createSsrRpc("fc139d0ad9542ff10ead20d3559575f7a2f85ec06982e457d15f5bf04c0d8e1d"));
var lockVaultFn = createServerFn({ method: "POST" }).validator((d) => object({ token: string().optional() }).parse(d ?? {})).handler(createSsrRpc("1ce12fe8abec48c34d3e5ea658216ca02ec72a760e2f52541b7a9341053de156"));
var STUDENT_KEY = "moibank.studentToken";
var TEACHER_KEY = "moibank.teacherToken";
function getToken(role) {
	if (typeof window === "undefined") return "";
	return localStorage.getItem(role === "student" ? STUDENT_KEY : TEACHER_KEY) ?? "";
}
function setToken(role, token) {
	localStorage.setItem(role === "student" ? STUDENT_KEY : TEACHER_KEY, token);
}
function clearToken(role) {
	localStorage.removeItem(role === "student" ? STUDENT_KEY : TEACHER_KEY);
}
//#endregion
export { unlockVaultPasswordFn as _, changeTeacherPasswordFn as a, getPublicClass as c, logoutFn as d, registerVaultFaceFn as f, unlockVaultFaceFn as g, teacherLoginFn as h, Input as i, getToken as l, studentLoginFn as m, Card as n, clearToken as o, setToken as p, CardContent as r, createSsrRpc as s, Button as t, lockVaultFn as u };
