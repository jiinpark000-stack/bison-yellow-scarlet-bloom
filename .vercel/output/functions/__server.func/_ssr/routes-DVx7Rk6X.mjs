import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as DEFAULT_TEACHER_PASSWORD } from "./types-CAoddweu.mjs";
import { c as getPublicClass, h as teacherLoginFn, i as Input, m as studentLoginFn, n as Card, p as setToken, r as CardContent, t as Button } from "./session-client-FsXee0JG.mjs";
import { h as Landmark, m as LockKeyhole, r as Users } from "../_libs/lucide-react.mjs";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, r as DialogDescription, t as Dialog } from "./dialog-CcfOcoSL.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as Label } from "./label-DihCeUQB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DVx7Rk6X.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PassbookMark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 88 88",
		className,
		"aria-hidden": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "8",
				y: "14",
				width: "72",
				height: "60",
				rx: "10",
				fill: "var(--color-surface)",
				stroke: "var(--color-border-strong)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "8",
				y: "14",
				width: "10",
				height: "60",
				rx: "4",
				fill: "var(--color-primary)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "26",
				y: "28",
				width: "42",
				height: "4",
				rx: "2",
				fill: "var(--color-border-strong)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "26",
				y: "38",
				width: "34",
				height: "4",
				rx: "2",
				fill: "var(--color-border)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "26",
				y: "48",
				width: "38",
				height: "4",
				rx: "2",
				fill: "var(--color-border)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "64",
				cy: "58",
				r: "10",
				fill: "var(--color-primary)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M60 58.5l3 3 6-7",
				fill: "none",
				stroke: "var(--color-primary-foreground)",
				strokeWidth: "2.2",
				strokeLinecap: "round"
			})
		]
	});
}
function errMsg(e) {
	return e instanceof Error ? e.message : "잠시 후 다시 시도해 주세요.";
}
function LandingView() {
	const navigate = useNavigate();
	const { data, isLoading } = useQuery({
		queryKey: ["public-class"],
		queryFn: () => getPublicClass(),
		staleTime: 0,
		refetchOnMount: "always"
	});
	const [mode, setMode] = (0, import_react.useState)("pick");
	const [selected, setSelected] = (0, import_react.useState)(null);
	const [pin, setPin] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const studentLogin = useMutation({
		mutationFn: () => studentLoginFn({ data: {
			studentId: selected.id,
			pin
		} }),
		onSuccess: (res) => {
			setToken("student", res.token);
			toast.success(`${selected?.name} 통장이 열렸어요.`);
			navigate({ to: "/play" });
		},
		onError: (e) => toast.error(errMsg(e))
	});
	const teacherLogin = useMutation({
		mutationFn: () => teacherLoginFn({ data: { password } }),
		onSuccess: (res) => {
			setToken("teacher", res.token);
			toast.success("선생님 창구에 들어왔어요.");
			navigate({ to: "/teacher" });
		},
		onError: (e) => toast.error(errMsg(e))
	});
	const className = data?.className ?? "6학년 5반";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto min-h-dvh max-w-3xl px-4 py-8 sm:py-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "stagger-in",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm font-medium tracking-wide text-primary",
					children: [className, " · 금융놀이"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex items-end justify-between gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-4xl font-semibold tracking-tight sm:text-5xl",
						children: "모이뱅크"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-md text-muted",
						children: "실제 주식의 오르내림은 그대로, 살 수 있는 가격만 1/1,000로 줄인 학급 투자 통장. 간식은 여기서 사고 학교에서 받아요."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PassbookMark, { className: "hidden size-24 shrink-0 sm:block" })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 grid gap-3 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setMode("pick"),
					className: `rounded-xl border p-5 text-left transition-colors ${mode === "pick" ? "border-primary bg-surface" : "border-border bg-surface-2"}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-5 text-primary" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 font-display text-lg font-semibold",
							children: "학생 입장"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "내 이름을 고르고 숫자 비밀번호를 입력해요."
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setMode("teacher"),
					className: `rounded-xl border p-5 text-left transition-colors ${mode === "teacher" ? "border-primary bg-surface" : "border-border bg-surface-2"}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, { className: "size-5 text-primary" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 font-display text-lg font-semibold",
							children: "선생님 창구"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "학급, 직업, 간식, 비밀번호를 관리해요."
						})
					]
				})]
			}),
			mode === "teacher" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "mt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "p-5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "space-y-4",
						onSubmit: (e) => {
							e.preventDefault();
							teacherLogin.mutate();
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "teacher-pw",
									children: "선생님 비밀번호"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "teacher-pw",
									type: "password",
									autoComplete: "current-password",
									value: password,
									onChange: (e) => setPassword(e.target.value),
									placeholder: "비밀번호"
								}),
								data && !data.passwordChanged ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm text-muted",
									children: [
										"처음 비밀번호는 ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-medium text-fg",
											children: DEFAULT_TEACHER_PASSWORD
										}),
										" ",
										"예요. 들어간 뒤 꼭 바꿔 주세요."
									]
								}) : null
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							className: "w-full",
							disabled: teacherLogin.isPending,
							children: teacherLogin.isPending ? "확인 중…" : "창구 열기"
						})]
					})
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-lg font-semibold",
						children: "우리 반"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: [data?.students.length ?? 0, "명"]
					})]
				}), isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 gap-2 sm:grid-cols-3",
					children: Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-14 animate-pulse rounded-lg bg-bg-sunken" }, i))
				}) : data?.students.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 gap-2 sm:grid-cols-3",
					children: data.students.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => {
							setSelected(s);
							setPin("");
						},
						className: "h-14 rounded-lg border border-border bg-surface px-3 text-left font-medium transition-colors hover:border-primary hover:bg-surface-2",
						children: s.name
					}, s.id))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "p-6 text-sm text-muted",
					children: "아직 등록된 친구가 없어요. 선생님이 창구에서 이름을 넣어 주면 여기서 입장할 수 있어요."
				}) })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: Boolean(selected),
				onOpenChange: (open) => !open && setSelected(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: selected?.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "선생님이 알려 준 숫자 4자리 비밀번호를 입력하세요." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "space-y-4",
					onSubmit: (e) => {
						e.preventDefault();
						studentLogin.mutate();
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "pin",
							children: "비밀번호"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "pin",
							inputMode: "numeric",
							autoComplete: "off",
							maxLength: 8,
							value: pin,
							onChange: (e) => setPin(e.target.value.replace(/\D/g, "")),
							placeholder: "숫자 4자리"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "submit",
						className: "w-full",
						disabled: pin.length < 4 || studentLogin.isPending,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockKeyhole, { className: "size-4" }), studentLogin.isPending ? "여는 중…" : "통장 열기"]
					})]
				})] })
			})
		]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LandingView, {});
}
//#endregion
export { Home as component };
