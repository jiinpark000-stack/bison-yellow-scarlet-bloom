import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as createServerFn } from "./ssr.mjs";
import { a as formatPct, c as interestOn, d as paidThisWeek, i as formatDay, l as kindLabel, m as taxRuleLabel, n as cn, o as formatWhen, p as taxAppliesLabel, r as eventStatusLabel, s as formatWon, t as changeTone } from "./utils-gSYKWV4o.mjs";
import { a as number, o as object, s as string } from "../_libs/zod.mjs";
import { d as logoutFn, i as Input, l as getToken, n as Card, o as clearToken, r as CardContent, s as createSsrRpc, t as Button } from "./session-client-FsXee0JG.mjs";
import { S as ArrowRightLeft, _ as House, a as TrendingUp, b as CalendarDays, c as Plus, d as LogOut, h as Landmark, l as PiggyBank, n as Wallet, o as Search, u as Minus, v as HeartHandshake, x as BookOpen, y as Cookie } from "../_libs/lucide-react.mjs";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, r as DialogDescription, t as Dialog } from "./dialog-CcfOcoSL.mjs";
import { i as joinEventFn, n as cancelJoinFn, s as studentEventsFn, t as Badge } from "./events-j_Er5Rfh.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/play-BmPfecE1.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Sparkline({ points, className, rising }) {
	if (points.length < 2) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("h-10", className) });
	const min = Math.min(...points);
	const span = Math.max(...points) - min || 1;
	const w = 120;
	const h = 40;
	const d = points.map((p, i) => {
		const x = i / (points.length - 1) * w;
		const y = h - (p - min) / span * 36 - 2;
		return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
	}).join(" ");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: `0 0 ${w} ${h}`,
		className: cn("h-10 w-full", className),
		"aria-hidden": true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d,
			fill: "none",
			stroke: rising ? "var(--color-up)" : "var(--color-down)",
			strokeWidth: "1.8",
			strokeLinejoin: "round",
			strokeLinecap: "round"
		})
	});
}
object({ token: string().optional() });
var getFeaturedQuotes = createServerFn({ method: "GET" }).handler(createSsrRpc("d411df3b32c76c5df0137843b6d0b43288c8de6612eb6e041632239c2f478ff1"));
var searchStocksFn = createServerFn({ method: "GET" }).validator((d) => object({ q: string() }).parse(d)).handler(createSsrRpc("88cbc5aabe5bfe8503b656045ad7052fb249437cc2f9570fb62541e8fd842d05"));
var getStockFn = createServerFn({ method: "GET" }).validator((d) => object({ symbol: string().min(1) }).parse(d)).handler(createSsrRpc("317bc04b5d2c4d2dad44863d251d1ace4a6daca44e78f502e109d7c527a21903"));
var buyStockFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	symbol: string().min(1),
	qty: number().int().positive()
}).parse(d)).handler(createSsrRpc("489b46c5eb01fc77aada28989ceb2838a763c46058f7bed8ed558933a806c0ef"));
var sellStockFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	symbol: string().min(1),
	qty: number().int().positive()
}).parse(d)).handler(createSsrRpc("2f514835d38468a1a8dfaa98ee02a3129aa28ebeb5c3cc8b2fad37abd1c3a5e6"));
var tokenSchema$1 = object({ token: string().optional() });
var listProductsFn = createServerFn({ method: "GET" }).handler(createSsrRpc("3ab8519786d35c2c29539a7223612046d4fe469217196b612a8108d5c8a985b9"));
var placeOrderFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	productId: number().int(),
	qty: number().int().positive()
}).parse(d)).handler(createSsrRpc("636738a2a5accc8fbe2590fe8622a30fdf000b0e32bf12c57031b4ba5d4dcc36"));
var myOrdersFn = createServerFn({ method: "GET" }).validator((d) => tokenSchema$1.parse(d ?? {})).handler(createSsrRpc("beb0263a05bc8cd2584c83f2a40411d8904e26146781ad37e58698f34daffa25"));
var tokenSchema = object({ token: string().optional() });
var getStudentHome = createServerFn({ method: "GET" }).validator((d) => tokenSchema.parse(d ?? {})).handler(createSsrRpc("974d111813c155e69c1e297d71ba8820f4aa6e45a146a238c5b7b05060da4397"));
var getLedger = createServerFn({ method: "GET" }).validator((d) => tokenSchema.parse(d ?? {})).handler(createSsrRpc("32a79d81f642c7cc6752fa6fe9cb286ae7a1970039242f8b3cfaabb1ab217b0c"));
var payTaxFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	amount: number().positive().optional()
}).parse(d ?? {})).handler(createSsrRpc("d1e166d30218e0474af17ec663b6f89947274e8617fc6ba6724e0b1e7c7a495c"));
var moveSavingsFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	amount: number()
}).parse(d)).handler(createSsrRpc("2ef4aafd49e66a07f41112237fff4e3f8fdcd78a401730453490897bffdda5bc"));
var donateFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	amount: number().positive()
}).parse(d)).handler(createSsrRpc("9d6da70d3d87b9cf67e88f58b94847244c6838b02b8177a7a37ce286d9f73a59"));
var transferFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	toStudentId: number().int().positive(),
	amount: number().positive()
}).parse(d)).handler(createSsrRpc("e7c5061cf32fc2092039bff105d140e5780f673792af0e9a29f1fd138c260a84"));
function errMsg(e) {
	return e instanceof Error ? e.message : "잠시 후 다시 시도해 주세요.";
}
function StudentApp() {
	const navigate = useNavigate();
	const qc = useQueryClient();
	const [token, setTokenState] = (0, import_react.useState)(null);
	const [tab, setTab] = (0, import_react.useState)("home");
	(0, import_react.useEffect)(() => {
		const t = getToken("student");
		if (!t) {
			navigate({ to: "/" });
			return;
		}
		setTokenState(t);
	}, [navigate]);
	const home = useQuery({
		queryKey: ["student-home", token],
		queryFn: () => getStudentHome({ data: { token: token ?? "" } }),
		enabled: Boolean(token),
		refetchInterval: 12e3,
		refetchOnWindowFocus: true,
		placeholderData: (prev) => prev
	});
	(0, import_react.useEffect)(() => {
		if (!home.isError || !token) return;
		if ((home.error instanceof Error ? home.error.message : "").includes("로그인해")) {
			clearToken("student");
			navigate({ to: "/" });
		}
	}, [
		home.isError,
		home.error,
		token,
		navigate
	]);
	if (!token) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "min-h-dvh bg-bg" });
	const data = home.data;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex min-h-dvh max-w-3xl flex-col pb-24",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center justify-between px-4 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-wide text-primary",
					children: data?.className ?? "6학년 5반"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-xl font-semibold",
					children: data?.student.name ?? "통장"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "ghost",
					size: "sm",
					onClick: async () => {
						await logoutFn({ data: { token } });
						clearToken("student");
						navigate({ to: "/" });
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" }), "나가기"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 px-4",
				children: [
					tab === "home" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HomePanel, {
						token,
						data,
						loading: home.isLoading,
						onDone: () => void qc.invalidateQueries(),
						onOpenMarket: () => setTab("market"),
						onOpenTax: () => setTab("tax"),
						onOpenEvents: () => setTab("events")
					}),
					tab === "market" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketPanel, {
						token,
						cash: data?.student.cash ?? 0,
						holdings: data?.holdings ?? [],
						onDone: () => void qc.invalidateQueries()
					}),
					tab === "shop" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShopPanel, {
						token,
						cash: data?.student.cash ?? 0,
						onDone: () => void qc.invalidateQueries()
					}),
					tab === "events" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventPanel, {
						token,
						cash: data?.student.cash ?? 0,
						onDone: () => void qc.invalidateQueries()
					}),
					tab === "tax" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaxPanel, {
						token,
						cash: data?.student.cash ?? 0,
						taxDue: data?.student.taxDue ?? 0,
						kinds: data?.taxKinds ?? [],
						bills: data?.taxBills ?? [],
						onDone: () => void qc.invalidateQueries()
					}),
					tab === "book" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookPanel, { token })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto grid max-w-3xl grid-cols-6",
					children: [
						[
							"home",
							"통장",
							House
						],
						[
							"market",
							"주식",
							TrendingUp
						],
						[
							"shop",
							"간식",
							Cookie
						],
						[
							"events",
							"행사",
							CalendarDays
						],
						[
							"tax",
							"세금",
							Landmark
						],
						[
							"book",
							"기록",
							BookOpen
						]
					].map(([id, label, Icon]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setTab(id),
						className: `flex min-h-14 flex-col items-center justify-center gap-1 text-xs font-medium ${tab === id ? "text-primary" : "text-muted"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" }), label]
					}, id))
				})
			})
		]
	});
}
function HomePanel({ token, data, loading, onDone, onOpenMarket, onOpenTax, onOpenEvents }) {
	const [saveAmt, setSaveAmt] = (0, import_react.useState)("");
	const [donateAmt, setDonateAmt] = (0, import_react.useState)("");
	const [toId, setToId] = (0, import_react.useState)(null);
	const [xferAmt, setXferAmt] = (0, import_react.useState)("");
	const move = useMutation({
		mutationFn: (amount) => moveSavingsFn({ data: {
			token,
			amount
		} }),
		onSuccess: (_res, amount) => {
			toast.success(amount > 0 ? `${formatWon(amount)} 저축했어요.` : `${formatWon(-amount)} 찾았어요.`);
			setSaveAmt("");
			onDone();
		},
		onError: (e) => toast.error(errMsg(e))
	});
	const give = useMutation({
		mutationFn: (amount) => donateFn({ data: {
			token,
			amount
		} }),
		onSuccess: (res) => {
			toast.success(res.isTop ? `${formatWon(res.amount)} 기부했어요. 지금 기부왕이에요!` : `${formatWon(res.amount)} 기부했어요. 학급 금고로 들어갔어요.`);
			setDonateAmt("");
			onDone();
		},
		onError: (e) => toast.error(errMsg(e))
	});
	const send = useMutation({
		mutationFn: (payload) => transferFn({ data: {
			token,
			...payload
		} }),
		onSuccess: (res) => {
			toast.success(`${res.toName}에게 ${formatWon(res.amount)} 보냈어요.`);
			setXferAmt("");
			onDone();
		},
		onError: (e) => toast.error(errMsg(e))
	});
	if (loading || !data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-48 animate-pulse rounded-xl bg-bg-sunken" });
	const paidWeek = paidThisWeek(data.student.lastSalaryOn);
	const interestPaid = paidThisWeek(data.student.lastInterestOn);
	const digits = data.student.cash % 1 === 0 ? 0 : 2;
	const savings = data.student.savings;
	const rate = data.savingsRate;
	const expected = interestOn(savings, rate);
	const parsed = Math.round(Number(saveAmt));
	const canDeposit = Number.isFinite(parsed) && parsed > 0 && parsed <= data.student.cash;
	const canWithdraw = Number.isFinite(parsed) && parsed > 0 && parsed <= savings;
	const gift = Math.round(Number(donateAmt));
	const canDonate = Number.isFinite(gift) && gift > 0 && gift <= data.student.cash;
	const sendAmt = Math.round(Number(xferAmt));
	const canSend = toId != null && Number.isFinite(sendAmt) && sendAmt > 0 && sendAmt <= data.student.cash;
	const top = data.donors[0] ?? null;
	const topTied = top ? data.donors.filter((d) => d.donated === top.donated) : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "overflow-hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "passbook-grid px-5 py-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: "쓸 수 있는 돈"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "size-4 text-primary" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 font-display text-4xl font-semibold tabular-nums tracking-tight",
							children: formatWon(data.student.cash, digits)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-sm text-muted",
							children: [
								"저축 ",
								formatWon(savings, 0),
								" · 주식 ",
								formatWon(data.holdingsValue, 0),
								" · 총자산 ",
								formatWon(data.total, 0)
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "flex flex-wrap items-center gap-2 p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: data.student.jobName ?? "직업 없음" }),
						data.student.salary > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: paidWeek ? "outline" : "warn",
							children: paidWeek ? "이번 주 월급 입금" : `일주일 월급 ${formatWon(data.student.salary)}`
						}) : null,
						data.classSize > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "outline",
							children: [
								"반 순위 ",
								data.rank,
								"/",
								data.classSize
							]
						}) : null,
						data.student.taxDue > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: onOpenTax,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								variant: "warn",
								children: ["낼 세금 ", formatWon(data.student.taxDue)]
							})
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "outline",
							children: "세금 완납"
						}),
						(data.openEventCount ?? 0) > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: onOpenEvents,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								variant: "warn",
								children: [
									"개최 중 행사 ",
									data.openEventCount,
									"개"
								]
							})
						}) : null
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-3 p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PiggyBank, { className: "size-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-display font-semibold",
									children: "저축"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 font-display text-3xl font-semibold tabular-nums tracking-tight",
								children: formatWon(savings)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-sm text-muted",
								children: [
									"일주일 이자 ",
									rate,
									"%",
									savings > 0 ? interestPaid ? " · 이번 주 이자 입금" : expected > 0 ? ` · 이번 주 예상 ${formatWon(expected)}` : "" : " · 넣어 두면 이자가 붙어요"
								]
							})
						] }), interestPaid && savings > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "outline",
							children: "이번 주 이자"
						}) : null]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "grid gap-2 sm:grid-cols-[1fr_auto_auto]",
						onSubmit: (e) => {
							e.preventDefault();
							if (!canDeposit) {
								toast.error("넣을 금액을 확인해 주세요.");
								return;
							}
							move.mutate(parsed);
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "save-amount",
								type: "number",
								min: 1,
								inputMode: "numeric",
								value: saveAmt,
								onChange: (e) => setSaveAmt(e.target.value),
								placeholder: "금액"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								disabled: move.isPending || !canDeposit,
								children: "넣기"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "outline",
								disabled: move.isPending || !canWithdraw,
								onClick: () => {
									if (!canWithdraw) {
										toast.error("찾을 금액을 확인해 주세요.");
										return;
									}
									move.mutate(-parsed);
								},
								children: "찾기"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [
							[
								50,
								100,
								200
							].map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								size: "sm",
								variant: "ghost",
								onClick: () => setSaveAmt(String(n)),
								children: formatWon(n)
							}, n)),
							data.student.cash > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								size: "sm",
								variant: "ghost",
								onClick: () => setSaveAmt(String(Math.floor(data.student.cash))),
								children: "쓸 돈 전부"
							}) : null,
							savings > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								size: "sm",
								variant: "ghost",
								onClick: () => setSaveAmt(String(Math.floor(savings))),
								children: "저축 전부"
							}) : null
						]
					})
				]
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-3 p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRightLeft, { className: "size-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display font-semibold",
							children: "계좌이체"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "쓸 돈에서 반 친구 통장으로 바로 보내요."
					}),
					(data.classmates ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "이체할 친구가 없어요. 선생님이 이름을 등록하면 보낼 수 있어요."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-3 gap-2",
							children: (data.classmates ?? []).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setToId(c.id),
								className: `h-11 rounded-lg border px-2 text-sm font-medium transition-colors ${toId === c.id ? "border-primary bg-surface text-fg" : "border-border bg-surface-2 text-muted"}`,
								children: c.name
							}, c.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "grid gap-2 sm:grid-cols-[1fr_auto]",
							onSubmit: (e) => {
								e.preventDefault();
								if (toId == null) {
									toast.error("받는 친구를 골라 주세요.");
									return;
								}
								if (!canSend) {
									toast.error("보낼 금액을 확인해 주세요.");
									return;
								}
								send.mutate({
									toStudentId: toId,
									amount: sendAmt
								});
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "xfer-amount",
								type: "number",
								min: 1,
								inputMode: "numeric",
								value: xferAmt,
								onChange: (e) => setXferAmt(e.target.value),
								placeholder: "보낼 금액"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								disabled: send.isPending || !canSend,
								children: "보내기"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-2",
							children: [[
								10,
								50,
								100
							].map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								size: "sm",
								variant: "ghost",
								onClick: () => setXferAmt(String(n)),
								children: formatWon(n)
							}, n)), data.student.cash > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								size: "sm",
								variant: "ghost",
								onClick: () => setXferAmt(String(Math.floor(data.student.cash))),
								children: "쓸 돈 전부"
							}) : null]
						})
					] })
				]
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-3 p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeartHandshake, { className: "size-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-display font-semibold",
									children: "기부 코너"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 font-display text-3xl font-semibold tabular-nums tracking-tight",
								children: formatWon(data.myDonated)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted",
								children: "내 기부 · 학급 창고로 들어가요"
							})
						] }), top && top.studentId === data.student.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "기부왕" }) : null]
					}),
					top ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg bg-bg-sunken px-3 py-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-medium",
							children: [
								"기부왕",
								" ",
								topTied.map((d) => d.name).join(", "),
								" · ",
								formatWon(top.donated)
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 space-y-1 text-muted",
							children: data.donors.slice(0, 5).map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									i + 1,
									"등 ",
									d.name,
									d.studentId === data.student.id ? " (나)" : ""
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "tabular-nums",
									children: formatWon(d.donated)
								})]
							}, d.studentId))
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "아직 기부한 친구가 없어요. 첫 기부왕이 되어 보세요."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "grid gap-2 sm:grid-cols-[1fr_auto]",
						onSubmit: (e) => {
							e.preventDefault();
							if (!canDonate) {
								toast.error("기부할 금액을 확인해 주세요.");
								return;
							}
							give.mutate(gift);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "donate-amount",
							type: "number",
							min: 1,
							inputMode: "numeric",
							value: donateAmt,
							onChange: (e) => setDonateAmt(e.target.value),
							placeholder: "기부할 금액"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: give.isPending || !canDonate,
							children: "기부하기"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [[
							10,
							50,
							100
						].map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							size: "sm",
							variant: "ghost",
							onClick: () => setDonateAmt(String(n)),
							children: formatWon(n)
						}, n)), data.student.cash > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							size: "sm",
							variant: "ghost",
							onClick: () => setDonateAmt(String(Math.floor(data.student.cash))),
							children: "쓸 돈 전부"
						}) : null]
					})
				]
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-lg font-semibold",
					children: "내 주식"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "sm",
					onClick: onOpenMarket,
					children: "시장 보기"
				})]
			}),
			data.holdings.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "p-5 text-sm text-muted",
				children: "아직 산 주식이 없어요. 시장에서 실제 등락률 그대로, 가격만 낮춘 모이 주식을 살 수 있어요."
			}) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-2",
				children: data.holdings.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "flex items-center justify-between gap-3 p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: h.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted",
						children: [
							h.qty,
							"주 · 평균 ",
							formatWon(h.avgCost, 2)
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-right",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "tabular-nums font-medium",
							children: formatWon(h.value, 0)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: `text-xs tabular-nums ${changeTone(h.pnlPercent)}`,
							children: formatPct(h.pnlPercent)
						})]
					})]
				}) }, h.symbol))
			})
		]
	});
}
function MarketPanel({ token, cash, holdings, onDone }) {
	const [q, setQ] = (0, import_react.useState)("");
	const [picked, setPicked] = (0, import_react.useState)(null);
	const [board, setBoard] = (0, import_react.useState)("all");
	const featured = useQuery({
		queryKey: ["featured"],
		queryFn: () => getFeaturedQuotes(),
		refetchInterval: 8e3,
		staleTime: 4e3,
		refetchOnWindowFocus: true,
		placeholderData: (prev) => prev
	});
	const search = useQuery({
		queryKey: ["search", q],
		queryFn: () => searchStocksFn({ data: { q } }),
		enabled: q.trim().length >= 1,
		refetchInterval: 1e4,
		staleTime: 4e3,
		refetchOnWindowFocus: true,
		placeholderData: (prev) => prev
	});
	const shown = (featured.data ?? []).filter((quote) => {
		const kr = quote.symbol.includes(".KS") || quote.symbol.includes(".KQ");
		if (board === "kr") return kr;
		if (board === "us") return !kr;
		return true;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "p-4 text-sm text-muted",
				children: [
					"실제 주식 등락률을 그대로 쓰고, 사는 가격만 1/1,000로 줄였어요. 잔액 ",
					formatWon(cash),
					"."
				]
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: q,
					onChange: (e) => setQ(e.target.value),
					placeholder: "종목 이름 또는 티커 (삼성전자, AAPL)",
					className: "pl-10"
				})]
			}),
			q.trim() ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [(search.data ?? []).map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setPicked(row.symbol),
					className: "flex w-full items-center justify-between rounded-lg border border-border bg-surface px-4 py-3 text-left",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block font-medium",
						children: row.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted",
						children: row.symbol
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-right",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block tabular-nums",
							children: row.gamePrice != null ? formatWon(row.gamePrice, 2) : "—"
						}), row.changePercent != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `text-xs tabular-nums ${changeTone(row.changePercent)}`,
							children: formatPct(row.changePercent)
						}) : null]
					})]
				}, row.symbol)), search.isFetched && (search.data?.length ?? 0) === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "찾는 종목이 없어요. 티커를 정확히 입력해 보세요."
				}) : null]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						["all", "전체"],
						["kr", "한국"],
						["us", "미국"]
					].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						size: "sm",
						variant: board === id ? "default" : "outline",
						onClick: () => setBoard(id),
						children: label
					}, id))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted",
					children: [shown.length, "개"]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-2 sm:grid-cols-2",
				children: shown.map((quote) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuoteCard, {
					quote,
					onOpen: () => setPicked(quote.symbol)
				}, quote.symbol))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StockDialog, {
				symbol: picked,
				cash,
				held: holdings.find((h) => h.symbol === picked)?.qty ?? 0,
				token,
				onClose: () => setPicked(null),
				onDone
			})
		]
	});
}
function QuoteCard({ quote, onOpen }) {
	const rising = quote.changePercent >= 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: onOpen,
		className: "rounded-xl border border-border bg-surface p-4 text-left transition-colors hover:border-primary",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium",
					children: quote.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted",
					children: quote.symbol
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: `text-sm tabular-nums font-medium ${changeTone(quote.changePercent)}`,
					children: formatPct(quote.changePercent)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkline, {
				points: quote.history.map((h) => h.game),
				rising,
				className: "mt-2"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 font-display text-xl tabular-nums",
				children: formatWon(quote.gamePrice, 2)
			})
		]
	});
}
function StockDialog({ symbol, cash, held, token, onClose, onDone }) {
	const [qty, setQty] = (0, import_react.useState)(1);
	const [side, setSide] = (0, import_react.useState)("buy");
	const detail = useQuery({
		queryKey: ["stock", symbol],
		queryFn: () => getStockFn({ data: { symbol: symbol ?? "" } }),
		enabled: Boolean(symbol),
		refetchInterval: 8e3,
		staleTime: 4e3,
		refetchOnWindowFocus: true,
		placeholderData: (prev) => prev
	});
	const buy = useMutation({
		mutationFn: () => buyStockFn({ data: {
			token,
			symbol: symbol ?? "",
			qty
		} }),
		onSuccess: (res) => {
			toast.success(`${qty}주 샀어요. ${formatWon(res.cost, 2)}`);
			onDone();
			onClose();
		},
		onError: (e) => toast.error(errMsg(e))
	});
	const sell = useMutation({
		mutationFn: () => sellStockFn({ data: {
			token,
			symbol: symbol ?? "",
			qty
		} }),
		onSuccess: (res) => {
			toast.success(res.tax ? `${qty}주 팔았어요. ${formatWon(res.proceeds, 2)} · 양도세 ${formatWon(res.tax)} 고지` : `${qty}주 팔았어요. ${formatWon(res.proceeds, 2)}`);
			onDone();
			onClose();
		},
		onError: (e) => toast.error(errMsg(e))
	});
	const quote = detail.data;
	const total = quote ? quote.gamePrice * qty : 0;
	const maxBuy = quote ? Math.floor(cash / quote.gamePrice) : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: Boolean(symbol),
		onOpenChange: (open) => {
			if (!open) {
				setQty(1);
				setSide("buy");
				onClose();
			}
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
			className: "max-h-[90dvh] overflow-y-auto",
			children: quote ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: quote.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
					quote.symbol,
					" · 실제 ",
					quote.realPrice.toLocaleString("ko-KR"),
					" ",
					quote.currency,
					" · 모이 가격은 1/1,000"
				] })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-end justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-3xl tabular-nums",
						children: formatWon(quote.gamePrice, 2)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: `tabular-nums font-medium ${changeTone(quote.changePercent)}`,
						children: formatPct(quote.changePercent)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkline, {
					points: quote.history.map((h) => h.game),
					rising: quote.changePercent >= 0,
					className: "h-16"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: side === "buy" ? "default" : "outline",
						onClick: () => setSide("buy"),
						children: "사기"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: side === "sell" ? "default" : "outline",
						onClick: () => setSide("sell"),
						children: "팔기"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between rounded-md bg-bg-sunken px-2 py-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							onClick: () => setQty((n) => Math.max(1, n - 1)),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "tabular-nums text-lg font-medium",
							children: [qty, "주"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							onClick: () => setQty((n) => n + 1),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: side === "buy" ? `결제 ${formatWon(total, 2)} · 살 수 있는 최대 ${maxBuy}주` : `받을 돈 ${formatWon(total, 2)} · 보유 ${held}주`
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "w-full",
					disabled: buy.isPending || sell.isPending || side === "sell" && held < qty,
					onClick: () => side === "buy" ? buy.mutate() : sell.mutate(),
					children: side === "buy" ? "모이 가격으로 사기" : "지금 시세로 팔기"
				})
			] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "시세를 불러오는 중…"
			})
		})
	});
}
function ShopPanel({ token, cash, onDone }) {
	const products = useQuery({
		queryKey: ["products"],
		queryFn: () => listProductsFn()
	});
	const orders = useQuery({
		queryKey: ["my-orders", token],
		queryFn: () => myOrdersFn({ data: { token } })
	});
	const [qtyById, setQtyById] = (0, import_react.useState)({});
	const buy = useMutation({
		mutationFn: (input) => placeOrderFn({ data: {
			token,
			...input
		} }),
		onSuccess: (res, vars) => {
			toast.success(res.tax ? `주문했어요. 간식세 ${formatWon(res.tax)}가 고지됐어요. 학교에서 받으면 됩니다.` : "주문했어요. 학교에서 선생님께 받으면 됩니다.");
			setQtyById((m) => ({
				...m,
				[vars.productId]: 1
			}));
			onDone();
			orders.refetch();
		},
		onError: (e) => toast.error(errMsg(e))
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "p-4 text-sm text-muted",
				children: [
					"여기서 먼저 결제하고, 간식은 학교에서 받아요. 잔액 ",
					formatWon(cash),
					"."
				]
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-2 sm:grid-cols-2",
				children: (products.data ?? []).map((p) => {
					const qty = qtyById[p.id] ?? 1;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "space-y-3 p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium",
								children: p.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: p.description
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-xl tabular-nums",
								children: formatWon(p.price)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "outline",
										size: "icon",
										className: "size-10",
										onClick: () => setQtyById((m) => ({
											...m,
											[p.id]: Math.max(1, qty - 1)
										})),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, {})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "w-8 text-center tabular-nums",
										children: qty
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "outline",
										size: "icon",
										className: "size-10",
										onClick: () => setQtyById((m) => ({
											...m,
											[p.id]: qty + 1
										})),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										className: "ml-auto",
										disabled: buy.isPending,
										onClick: () => buy.mutate({
											productId: p.id,
											qty
										}),
										children: "주문"
									})
								]
							})
						]
					}) }, p.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-lg font-semibold",
				children: "내 주문"
			}),
			(orders.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "아직 주문이 없어요."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-2",
				children: (orders.data ?? []).map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "flex items-center justify-between p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-medium",
						children: [
							o.productName,
							" × ",
							o.qty
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: formatWhen(o.createdAt)
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: o.status === "waiting" ? "warn" : o.status === "done" ? "default" : "outline",
						children: o.status === "waiting" ? "학교 수령 대기" : o.status === "done" ? "수령 완료" : "취소"
					})]
				}) }, o.id))
			})
		]
	});
}
function EventPanel({ token, cash, onDone }) {
	const events = useQuery({
		queryKey: ["student-events", token],
		queryFn: () => studentEventsFn({ data: { token } })
	});
	const join = useMutation({
		mutationFn: (eventId) => joinEventFn({ data: {
			token,
			eventId
		} }),
		onSuccess: (res) => {
			toast.success(res.paid > 0 ? `참가했어요. 참가비 ${formatWon(res.paid)}` : "참가했어요.");
			onDone();
			events.refetch();
		},
		onError: (e) => toast.error(errMsg(e))
	});
	const cancel = useMutation({
		mutationFn: (eventId) => cancelJoinFn({ data: {
			token,
			eventId
		} }),
		onSuccess: (res) => {
			toast.success(res.refunded > 0 ? `취소하고 ${formatWon(res.refunded)} 돌려받았어요.` : "참가를 취소했어요.");
			onDone();
			events.refetch();
		},
		onError: (e) => toast.error(errMsg(e))
	});
	const list = events.data ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "p-4 text-sm text-muted",
				children: [
					"선생님이 개최한 행사에 참가해요. 참가비는 학급 창고로 들어갑니다. 잔액 ",
					formatWon(cash),
					"."
				]
			}) }),
			list.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "지금은 열린 행사가 없어요."
			}) : null,
			list.map((ev) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-3 p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap items-start justify-between gap-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium",
								children: ev.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: ev.status === "open" ? "warn" : "outline",
								children: eventStatusLabel(ev.status)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted",
							children: [
								ev.eventOn ? `${formatDay(ev.eventOn)} · ` : "",
								"참가비 ",
								formatWon(ev.fee),
								ev.reward > 0 ? ` · 보상 ${formatWon(ev.reward)}` : ""
							]
						}),
						ev.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: ev.description
						}) : null
					] })
				}), ev.joined ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, { children: ["참가함", ev.rewarded > 0 ? ` · 보상 ${formatWon(ev.rewarded)}` : ""] }), ev.status === "open" && ev.rewarded <= 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						disabled: cancel.isPending,
						onClick: () => cancel.mutate(ev.id),
						children: "참가 취소"
					}) : null]
				}) : ev.status === "open" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					disabled: join.isPending,
					onClick: () => join.mutate(ev.id),
					children: ev.fee > 0 ? `${formatWon(ev.fee)} 내고 참가` : "참가하기"
				}) : null]
			}) }, ev.id))
		]
	});
}
function TaxPanel({ token, cash, taxDue, kinds, bills, onDone }) {
	const pay = useMutation({
		mutationFn: () => payTaxFn({ data: { token } }),
		onSuccess: (res) => {
			toast.success(`${formatWon(res.paid)} 세금을 냈어요.`);
			onDone();
		},
		onError: (e) => toast.error(errMsg(e))
	});
	const canPay = taxDue > 0 && cash > 0;
	const grouped = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const bill of bills) map.set(bill.kindName, (map.get(bill.kindName) ?? 0) + bill.due);
		return [...map.entries()];
	}, [bills]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "overflow-hidden",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-5 py-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: "내가 낼 세금"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, { className: "size-4 text-primary" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 font-display text-4xl font-semibold tabular-nums tracking-tight",
							children: formatWon(taxDue)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-sm text-muted",
							children: [
								"통장 ",
								formatWon(cash),
								" · 낸 세금은 학급 창고로 들어가요"
							]
						})
					]
				}),
				grouped.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-2 border-t border-border px-5 py-4",
					children: grouped.map(([name, due]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: name }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "tabular-nums",
							children: formatWon(due)
						})]
					}, name))
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "p-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "w-full",
						disabled: !canPay || pay.isPending,
						onClick: () => pay.mutate(),
						children: taxDue <= 0 ? "낼 세금이 없어요" : cash <= 0 ? "잔액이 부족해요" : "세금 내기"
					})
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "space-y-2 p-4 text-sm text-muted",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium text-fg",
					children: "우리 반 세금"
				}),
				kinds.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "선생님이 아직 세금을 정하지 않았어요." }) : null,
				kinds.map((kind) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
					kind.name,
					" ",
					taxRuleLabel(kind),
					" · ",
					taxAppliesLabel(kind.appliesOn)
				] }, kind.name))
			]
		}) })]
	});
}
function BookPanel({ token }) {
	const ledger = useQuery({
		queryKey: ["ledger", token],
		queryFn: () => getLedger({ data: { token } })
	});
	const rows = (0, import_react.useMemo)(() => ledger.data ?? [], [ledger.data]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-display text-lg font-semibold",
			children: "통장 기록"
		}), rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: "아직 기록이 없어요."
		}) : rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium",
				children: kindLabel(row.kind)
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted",
				children: row.memo
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-right",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: `tabular-nums font-medium ${row.amount >= 0 ? "text-primary" : "text-fg"}`,
					children: [row.amount >= 0 ? "+" : "", formatWon(row.amount, 0)]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted",
					children: formatWhen(row.createdAt)
				})]
			})]
		}, row.id))]
	});
}
function PlayPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StudentApp, {});
}
//#endregion
export { PlayPage as component };
