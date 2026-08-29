import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as createServerFn } from "./ssr.mjs";
import { c as interestOn, d as paidThisWeek, g as vaultKindLabel, i as formatDay, m as taxRuleLabel, n as cn, o as formatWhen, p as taxAppliesLabel, r as eventStatusLabel, s as formatWon } from "./utils-gSYKWV4o.mjs";
import { n as captureFaceDescriptor } from "./face-v4_U7c_1.mjs";
import { a as number, n as array, o as object, r as boolean, s as string, t as _enum } from "../_libs/zod.mjs";
import { _ as unlockVaultPasswordFn, a as changeTeacherPasswordFn, d as logoutFn, f as registerVaultFaceFn, g as unlockVaultFaceFn, i as Input, l as getToken, n as Card, o as clearToken, r as CardContent, s as createSsrRpc, t as Button, u as lockVaultFn } from "./session-client-FsXee0JG.mjs";
import { d as LogOut, f as Lock, g as KeyRound, p as LockOpen, s as ScanFace } from "../_libs/lucide-react.mjs";
import { a as payEventRewardsFn, c as teacherCancelEventFn, d as upsertEventFn, l as teacherJoinAllFn, o as setEventStatusFn, r as deleteEventFn, t as Badge, u as teacherJoinEventFn } from "./events-j_Er5Rfh.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as Label } from "./label-DihCeUQB.mjs";
import { i as Trigger, n as List, r as Root2, t as Content } from "../_libs/radix-ui__react-tabs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/teacher-CPNUuw9b.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Tabs = Root2;
var TabsList = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {
	ref,
	className: cn("inline-flex h-11 items-center gap-1 rounded-md bg-bg-sunken p-1 text-muted", className),
	...props
}));
TabsList.displayName = List.displayName;
var TabsTrigger = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, {
	ref,
	className: cn("inline-flex h-9 items-center justify-center rounded-sm px-3 text-sm font-medium whitespace-nowrap transition-colors data-[state=active]:bg-surface data-[state=active]:text-fg data-[state=active]:shadow-sm", className),
	...props
}));
TabsTrigger.displayName = Trigger.displayName;
var TabsContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content, {
	ref,
	className: cn("mt-4 outline-none", className),
	...props
}));
TabsContent.displayName = Content.displayName;
function FaceScan({ mode, busy, onCapture, onCancel }) {
	const videoRef = (0, import_react.useRef)(null);
	const [ready, setReady] = (0, import_react.useState)(false);
	const [err, setErr] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		let stream = null;
		let dead = false;
		(async () => {
			try {
				stream = await navigator.mediaDevices.getUserMedia({
					video: {
						facingMode: "user",
						width: { ideal: 480 },
						height: { ideal: 480 }
					},
					audio: false
				});
				if (dead) {
					for (const track of stream.getTracks()) track.stop();
					return;
				}
				const video = videoRef.current;
				if (!video) return;
				video.srcObject = stream;
				await video.play();
				setReady(true);
			} catch {
				setErr("카메라를 켤 수 없어요. 브라우저에서 카메라 권한을 허용해 주세요.");
			}
		})();
		return () => {
			dead = true;
			if (stream) for (const track of stream.getTracks()) track.stop();
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mx-auto aspect-square w-full max-w-xs overflow-hidden rounded-xl bg-bg-sunken",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
					ref: videoRef,
					className: "size-full scale-x-[-1] object-cover",
					playsInline: true,
					muted: true,
					autoPlay: true
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "pointer-events-none absolute inset-0 grid place-items-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-[72%] w-[58%] rounded-full border-2 border-primary" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-center text-sm text-muted",
				children: err || (mode === "register" ? "타원 안에 얼굴을 맞추고 등록을 눌러 주세요." : "타원 안에 얼굴을 맞추고 열어 주세요.")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					type: "button",
					onClick: onCancel,
					children: "닫기"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					disabled: !ready || busy || Boolean(err),
					onClick: async () => {
						const video = videoRef.current;
						if (!video) return;
						try {
							onCapture(await captureFaceDescriptor(video));
						} catch (e) {
							setErr(e instanceof Error ? e.message : "얼굴을 담지 못했어요.");
						}
					},
					children: mode === "register" ? "이 얼굴로 등록" : "이 얼굴로 열기"
				})]
			})
		]
	});
}
var tokenSchema = object({ token: string().optional() });
var teacherOverviewFn = createServerFn({ method: "GET" }).validator((d) => tokenSchema.parse(d ?? {})).handler(createSsrRpc("9671f83f1f2d17f7e6d90431f92e2ccee5f6b257c171c5062ab8ee8f3c460ab3"));
var addStudentFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	name: string().min(1).max(20),
	pin: string().regex(/^\d{4}$/, "비밀번호는 숫자 4자리예요."),
	jobId: number().int().nullable().optional()
}).parse(d)).handler(createSsrRpc("a2081b535932ff1e355f1a81c8b419896ac54ca41a14836cec7fd3010c5e55e3"));
var addStudentsBulkFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	rows: array(object({
		name: string().min(1).max(20),
		pin: string().regex(/^\d{4}$/)
	}))
}).parse(d)).handler(createSsrRpc("d65d1122ca75101a408751eeb22c58817fd805890e8981454f8f1678c77f3919"));
var updateStudentFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	studentId: number().int(),
	name: string().min(1).max(20).optional(),
	pin: string().regex(/^\d{4}$/).optional(),
	jobId: number().int().nullable().optional()
}).parse(d)).handler(createSsrRpc("451cf54df15b408ebea43a3c3400e2a57b30baeff9061683c6f2a904c5bbc8a6"));
var adjustCashFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	studentId: number().int(),
	amount: number(),
	memo: string().max(40).optional()
}).parse(d)).handler(createSsrRpc("7af0b6cc563f7fa81a0bfe3f2bff2d7b0dceba10df51ae6e9ae88ec8fe033b71"));
var removeStudentFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	studentId: number().int()
}).parse(d)).handler(createSsrRpc("3d74a56617e5b57d563de4272cddb6b5a8d0b3c640f1e19f150fb68cae98cbd7"));
var upsertJobFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	id: number().int().optional(),
	name: string().min(1).max(20),
	salary: number().min(0)
}).parse(d)).handler(createSsrRpc("0a6010a392f9761f7edd7cdd13d220e93ff0310ba5df86234ca354465a4eb8e9"));
var deleteJobFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	id: number().int()
}).parse(d)).handler(createSsrRpc("8ce164d8174dac95b4b2c6b179eb2a2d0f680a37abe02654546a82d7af8b2c75"));
var upsertProductFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	id: number().int().optional(),
	name: string().min(1).max(20),
	price: number().positive(),
	description: string().max(80).optional(),
	isActive: boolean().optional()
}).parse(d)).handler(createSsrRpc("80e2e7b9c610a12d3bb9340ffaf690a6adaa9df5e2f63f9d3c2bd50fe27aaa04"));
var deleteProductFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	id: number().int()
}).parse(d)).handler(createSsrRpc("7e9b54c439859b123f90087a755ff95574a83a0145be6cd389992a40945b575d"));
var fulfillOrderFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	orderId: number().int()
}).parse(d)).handler(createSsrRpc("e7b95a73ebe3f2050ec645f089b06eaa9a597574ee7bdc536e2aa48ce96fb100"));
var refundOrderFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	orderId: number().int()
}).parse(d)).handler(createSsrRpc("ceab3905aac7698b28ee3f339d0b07909e6bda77dfe03f98cf75ca0b932ae686"));
var paySalariesFn = createServerFn({ method: "POST" }).validator((d) => tokenSchema.parse(d ?? {})).handler(createSsrRpc("89ca50a2b7430c095c087370e52019725b8da11428402c69b668a3639e6d9291"));
var setSavingsRateFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	rate: number().min(0).max(100)
}).parse(d)).handler(createSsrRpc("e8f4f4d1a1520607dc44a7b79f52f0885705196371259406f2b0c6e1f3118c14"));
var payInterestFn = createServerFn({ method: "POST" }).validator((d) => tokenSchema.parse(d ?? {})).handler(createSsrRpc("f1d5894739c1d47094a84e3d73636ca2579a183848aa639a4760d1d4410bc96e"));
var renameClassFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	className: string().min(1).max(30)
}).parse(d)).handler(createSsrRpc("960be6621bc5e281fc4da338a5d5ab4f05cbf719fbbd3318b67fd850cdb708ec"));
var upsertTaxKindFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	id: number().int().optional(),
	name: string().min(1).max(20),
	appliesOn: _enum([
		"income",
		"gain",
		"snack",
		"manual"
	]),
	charge: _enum(["percent", "fixed"]),
	value: number().min(0).max(1e6),
	isActive: boolean().optional()
}).parse(d)).handler(createSsrRpc("3fb6b8d0ac59130d973f6bd38764f37f1926de9a5b4b750c38f5f83b3d093f91"));
var deleteTaxKindFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	id: number().int()
}).parse(d)).handler(createSsrRpc("9a496429b00f0b7e9d8188fb8dff6623621f8c381cc8c8e19f669deffad06268"));
var assessTaxKindFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	kindId: number().int(),
	studentId: number().int().optional()
}).parse(d)).handler(createSsrRpc("74360896bcb93518edd305fc4ccdca76033a8f222de6d0d20cedcb20a70a3a86"));
var collectTaxFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	studentId: number().int()
}).parse(d)).handler(createSsrRpc("17065cd4fa3faf9633d4005330a5c82164f6488cb9934293b3ecef19cdfd4af0"));
var collectAllTaxFn = createServerFn({ method: "POST" }).validator((d) => tokenSchema.parse(d ?? {})).handler(createSsrRpc("95e17987211c57069e1e427597361959adfc1af1dba80da9f44e181a1b39adf1"));
function errMsg(e) {
	return e instanceof Error ? e.message : "잠시 후 다시 시도해 주세요.";
}
function TeacherApp() {
	const navigate = useNavigate();
	const qc = useQueryClient();
	const [token, setTokenState] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const t = getToken("teacher");
		if (!t) {
			navigate({ to: "/" });
			return;
		}
		setTokenState(t);
	}, [navigate]);
	const overview = useQuery({
		queryKey: ["teacher", token],
		queryFn: () => teacherOverviewFn({ data: { token: token ?? "" } }),
		enabled: Boolean(token),
		placeholderData: (prev) => prev
	});
	(0, import_react.useEffect)(() => {
		if (overview.isError && token) {
			clearToken("teacher");
			navigate({ to: "/" });
		}
	}, [
		overview.isError,
		token,
		navigate
	]);
	if (!token) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "min-h-dvh bg-bg" });
	const refresh = () => void qc.invalidateQueries({ queryKey: ["teacher"] });
	const data = overview.data;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto min-h-dvh max-w-4xl px-4 py-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mb-6 flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-wide text-primary",
					children: "선생님 창구"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-2xl font-semibold",
					children: data?.className ?? "6학년 5반"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "ghost",
					size: "sm",
					onClick: async () => {
						await logoutFn({ data: { token } });
						clearToken("teacher");
						navigate({ to: "/" });
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" }), "나가기"]
				})]
			}),
			data && !data.passwordChanged ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "mb-4 border-warn/30",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "p-4 text-sm",
					children: "아직 기본 비밀번호예요. 설정 탭에서 다른 기기로도 쓸 비밀번호로 바꿔 주세요."
				})
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				defaultValue: "class",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
						className: "flex h-auto w-full flex-wrap justify-start",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "class",
								children: "학급"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "jobs",
								children: "직업"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "snacks",
								children: "간식"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								value: "orders",
								children: ["주문", data?.orders.some((o) => o.status === "waiting") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ml-1 size-1.5 rounded-full bg-warn" }) : null]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								value: "tax",
								children: ["세금", data?.students.some((s) => s.taxDue > 0) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ml-1 size-1.5 rounded-full bg-warn" }) : null]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								value: "events",
								children: ["행사", (data?.openEventCount ?? 0) > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ml-1 size-1.5 rounded-full bg-warn" }) : null]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "savings",
								children: "저축"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "settings",
								children: "설정"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "class",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClassPanel, {
							token,
							data,
							onDone: refresh
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "jobs",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(JobsPanel, {
							token,
							data,
							onDone: refresh
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "snacks",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductsPanel, {
							token,
							data,
							onDone: refresh
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "orders",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrdersPanel, {
							token,
							data,
							onDone: refresh
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "tax",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaxOfficePanel, {
							token,
							data,
							onDone: refresh
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "events",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventsPanel, {
							token,
							data,
							onDone: refresh
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "savings",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SavingsPanel, {
							token,
							data,
							onDone: refresh
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "settings",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsPanel, {
							token,
							roomName: data?.className ?? "",
							onDone: refresh
						})
					})
				]
			})
		]
	});
}
function ClassPanel({ token, data, onDone }) {
	const [name, setName] = (0, import_react.useState)("");
	const [pin, setPin] = (0, import_react.useState)("");
	const [jobId, setJobId] = (0, import_react.useState)("");
	const [bulk, setBulk] = (0, import_react.useState)("");
	const [adjustId, setAdjustId] = (0, import_react.useState)(null);
	const [adjustAmt, setAdjustAmt] = (0, import_react.useState)("");
	const topDonated = Math.max(0, ...(data?.donors ?? []).map((d) => d.donated));
	const add = useMutation({
		mutationFn: () => addStudentFn({ data: {
			token,
			name,
			pin,
			jobId: jobId ? Number(jobId) : null
		} }),
		onSuccess: () => {
			toast.success(`${name} 을(를) 등록했어요. 시작 용돈 1,000원.`);
			setName("");
			setPin("");
			onDone();
		},
		onError: (e) => toast.error(errMsg(e))
	});
	const bulkAdd = useMutation({
		mutationFn: () => {
			const rows = bulk.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
				const [n, p] = line.split(/[,/\s]+/);
				return {
					name: (n ?? "").trim(),
					pin: (p ?? "").trim()
				};
			}).filter((r) => r.name && /^\d{4}$/.test(r.pin));
			if (!rows.length) throw new Error("한 줄에 이름,비밀번호 형식으로 적어 주세요. 예: 민준,1234");
			return addStudentsBulkFn({ data: {
				token,
				rows
			} });
		},
		onSuccess: (res) => {
			toast.success(`${res.added}명을 등록했어요.`);
			setBulk("");
			onDone();
		},
		onError: (e) => toast.error(errMsg(e))
	});
	const pay = useMutation({
		mutationFn: () => paySalariesFn({ data: { token } }),
		onSuccess: (res) => {
			toast.success(res.count ? `${res.count}명에게 이번 주 월급을 넣었어요.` : "이미 이번 주 월급이 들어갔어요.");
			onDone();
		},
		onError: (e) => toast.error(errMsg(e))
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => pay.mutate(),
					disabled: pay.isPending,
					children: "이번 주 월급 지급"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "self-center text-sm text-muted",
					children: "월요일~일요일에 한 번, 학생이 들어오면 자동으로 들어갑니다."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-3 p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display font-semibold",
						children: "학생 등록"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "grid gap-2 sm:grid-cols-4",
						onSubmit: (e) => {
							e.preventDefault();
							add.mutate();
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: name,
								onChange: (e) => setName(e.target.value),
								placeholder: "이름",
								required: true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: pin,
								onChange: (e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4)),
								placeholder: "숫자 4자리",
								inputMode: "numeric",
								required: true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								className: "h-11 rounded-md border border-input bg-surface px-3 text-sm",
								value: jobId,
								onChange: (e) => setJobId(e.target.value),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "기본 직업(학생)"
								}), (data?.jobs ?? []).map((j) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
									value: j.id,
									children: [
										j.name,
										" · ",
										formatWon(j.salary)
									]
								}, j.id))]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								disabled: add.isPending,
								children: "추가"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "text-muted",
						children: "여러 명 (한 줄에 이름,비밀번호)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						className: "min-h-24 w-full rounded-md border border-input bg-surface p-3 text-sm",
						placeholder: "민준,1234\n서연,5678",
						value: bulk,
						onChange: (e) => setBulk(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => bulkAdd.mutate(),
						disabled: bulkAdd.isPending,
						children: "한 번에 등록"
					})
				]
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [(data?.students ?? []).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-3 p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-start justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: s.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted",
							children: [
								s.jobName ?? "직업 없음",
								" · 현금 ",
								formatWon(s.cash),
								" · 저축 ",
								formatWon(s.savings),
								" · 주식",
								" ",
								formatWon(s.holdingsValue),
								" · 합계 ",
								formatWon(s.total),
								s.donated > 0 ? ` · 기부 ${formatWon(s.donated)}` : "",
								s.taxDue > 0 ? ` · 미납 세금 ${formatWon(s.taxDue)}` : "",
								s.taxParts.length ? ` (${s.taxParts.map((p) => `${p.name} ${formatWon(p.due)}`).join(", ")})` : ""
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-1",
							children: [
								paidThisWeek(s.lastSalaryOn) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									children: "이번 주 월급"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "warn",
									children: "월급 대기"
								}),
								s.savings > 0 ? paidThisWeek(s.lastInterestOn) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									children: "이번 주 이자"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "warn",
									children: "이자 대기"
								}) : null,
								s.donated > 0 && s.donated === topDonated ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "기부왕" }) : null,
								s.taxDue > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "warn",
									children: "세금 미납"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									children: "세금 완납"
								})
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								className: "h-11 rounded-md border border-input bg-surface px-3 text-sm",
								value: s.jobId ?? "",
								onChange: async (e) => {
									const value = e.target.value ? Number(e.target.value) : null;
									try {
										await updateStudentFn({ data: {
											token,
											studentId: s.id,
											jobId: value
										} });
										toast.success("직업을 바꿨어요.");
										onDone();
									} catch (err) {
										toast.error(errMsg(err));
									}
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "직업 없음"
								}), (data?.jobs ?? []).map((j) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: j.id,
									children: j.name
								}, j.id))]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								className: "w-28",
								placeholder: "새 비밀번호",
								inputMode: "numeric",
								onBlur: async (e) => {
									const next = e.target.value.replace(/\D/g, "");
									if (next.length !== 4) return;
									try {
										await updateStudentFn({ data: {
											token,
											studentId: s.id,
											pin: next
										} });
										toast.success("비밀번호를 바꿨어요.");
										e.target.value = "";
									} catch (err) {
										toast.error(errMsg(err));
									}
								}
							}),
							adjustId === s.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								className: "flex gap-2",
								onSubmit: async (e) => {
									e.preventDefault();
									try {
										await adjustCashFn({ data: {
											token,
											studentId: s.id,
											amount: Number(adjustAmt)
										} });
										toast.success("잔액을 조정했어요.");
										setAdjustId(null);
										setAdjustAmt("");
										onDone();
									} catch (err) {
										toast.error(errMsg(err));
									}
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									className: "w-28",
									value: adjustAmt,
									onChange: (e) => setAdjustAmt(e.target.value),
									placeholder: "+100 / -50"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "submit",
									size: "sm",
									children: "적용"
								})]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								onClick: () => setAdjustId(s.id),
								children: "잔액"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "sm",
								onClick: async () => {
									if (!confirm(`${s.name} 학생을 삭제할까요?`)) return;
									try {
										await removeStudentFn({ data: {
											token,
											studentId: s.id
										} });
										toast.success("삭제했어요.");
										onDone();
									} catch (err) {
										toast.error(errMsg(err));
									}
								},
								children: "삭제"
							})
						]
					})]
				}) }, s.id)), data && data.students.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "아직 학생이 없어요. 위에서 이름을 등록해 주세요."
				}) : null]
			})
		]
	});
}
function JobsPanel({ token, data, onDone }) {
	const [name, setName] = (0, import_react.useState)("");
	const [salary, setSalary] = (0, import_react.useState)("280");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "space-y-2 p-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "금액은 일주일 월급이에요. 매주 한 번 자동으로 들어갑니다."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "grid gap-2 sm:grid-cols-3",
				onSubmit: async (e) => {
					e.preventDefault();
					try {
						await upsertJobFn({ data: {
							token,
							name,
							salary: Number(salary)
						} });
						toast.success("직업을 추가했어요.");
						setName("");
						onDone();
					} catch (err) {
						toast.error(errMsg(err));
					}
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: name,
						onChange: (e) => setName(e.target.value),
						placeholder: "직업 이름",
						required: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "number",
						min: 0,
						value: salary,
						onChange: (e) => setSalary(e.target.value),
						placeholder: "일주일 월급",
						required: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						children: "직업 추가"
					})
				]
			})]
		}) }), (data?.jobs ?? []).map((j) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(JobRow, {
			token,
			job: j,
			onDone
		}, j.id))]
	});
}
function JobRow({ token, job, onDone }) {
	const [name, setName] = (0, import_react.useState)(job.name);
	const [salary, setSalary] = (0, import_react.useState)(String(job.salary));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
		className: "flex flex-wrap items-center gap-2 p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				className: "sm:max-w-40",
				value: name,
				onChange: (e) => setName(e.target.value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				className: "w-28",
				type: "number",
				min: 0,
				value: salary,
				onChange: (e) => setSalary(e.target.value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				onClick: async () => {
					try {
						await upsertJobFn({ data: {
							token,
							id: job.id,
							name,
							salary: Number(salary)
						} });
						toast.success("저장했어요.");
						onDone();
					} catch (err) {
						toast.error(errMsg(err));
					}
				},
				children: "저장"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				onClick: async () => {
					try {
						await deleteJobFn({ data: {
							token,
							id: job.id
						} });
						toast.success("직업을 지웠어요.");
						onDone();
					} catch (err) {
						toast.error(errMsg(err));
					}
				},
				children: "삭제"
			})
		]
	}) });
}
function ProductsPanel({ token, data, onDone }) {
	const [name, setName] = (0, import_react.useState)("");
	const [price, setPrice] = (0, import_react.useState)("80");
	const [description, setDescription] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "space-y-2 p-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "grid gap-2 sm:grid-cols-2",
				onSubmit: async (e) => {
					e.preventDefault();
					try {
						await upsertProductFn({ data: {
							token,
							name,
							price: Number(price),
							description
						} });
						toast.success("간식을 추가했어요.");
						setName("");
						setDescription("");
						onDone();
					} catch (err) {
						toast.error(errMsg(err));
					}
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: name,
						onChange: (e) => setName(e.target.value),
						placeholder: "간식 이름",
						required: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "number",
						min: 1,
						value: price,
						onChange: (e) => setPrice(e.target.value),
						placeholder: "가격",
						required: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						className: "sm:col-span-2",
						value: description,
						onChange: (e) => setDescription(e.target.value),
						placeholder: "설명 (학교에서 받는 방식 등)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						className: "sm:col-span-2",
						children: "간식 추가"
					})
				]
			})
		}) }), (data?.products ?? []).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductRow, {
			token,
			product: p,
			onDone
		}, p.id))]
	});
}
function ProductRow({ token, product, onDone }) {
	const [name, setName] = (0, import_react.useState)(product.name);
	const [price, setPrice] = (0, import_react.useState)(String(product.price));
	const [description, setDescription] = (0, import_react.useState)(product.description);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: product.isActive ? "" : "opacity-60",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "space-y-2 p-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2 sm:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: name,
						onChange: (e) => setName(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "number",
						min: 1,
						value: price,
						onChange: (e) => setPrice(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						className: "sm:col-span-2",
						value: description,
						onChange: (e) => setDescription(e.target.value)
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						onClick: async () => {
							try {
								await upsertProductFn({ data: {
									token,
									id: product.id,
									name,
									price: Number(price),
									description,
									isActive: product.isActive
								} });
								toast.success("저장했어요.");
								onDone();
							} catch (err) {
								toast.error(errMsg(err));
							}
						},
						children: "저장"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "sm",
						onClick: async () => {
							try {
								await upsertProductFn({ data: {
									token,
									id: product.id,
									name,
									price: Number(price),
									description,
									isActive: !product.isActive
								} });
								onDone();
							} catch (err) {
								toast.error(errMsg(err));
							}
						},
						children: product.isActive ? "판매 중지" : "다시 판매"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "sm",
						onClick: async () => {
							try {
								await deleteProductFn({ data: {
									token,
									id: product.id
								} });
								toast.success("목록에서 내렸어요.");
								onDone();
							} catch (err) {
								toast.error(errMsg(err));
							}
						},
						children: "내리기"
					})
				]
			})]
		})
	});
}
function OrdersPanel({ token, data, onDone }) {
	const waiting = (data?.orders ?? []).filter((o) => o.status === "waiting");
	const rest = (data?.orders ?? []).filter((o) => o.status !== "waiting");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "결제는 이미 끝났어요. 간식을 건네준 뒤 수령 완료를 눌러 주세요."
			}),
			waiting.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "대기 중인 주문이 없어요."
			}) : null,
			waiting.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "flex flex-wrap items-center justify-between gap-2 p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-medium",
					children: [
						o.studentName,
						" · ",
						o.productName,
						" × ",
						o.qty
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: formatWon(o.total)
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						onClick: async () => {
							try {
								await fulfillOrderFn({ data: {
									token,
									orderId: o.id
								} });
								toast.success("수령 완료");
								onDone();
							} catch (err) {
								toast.error(errMsg(err));
							}
						},
						children: "수령 완료"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "outline",
						onClick: async () => {
							try {
								await refundOrderFn({ data: {
									token,
									orderId: o.id
								} });
								toast.success("취소하고 돈을 돌려줬어요.");
								onDone();
							} catch (err) {
								toast.error(errMsg(err));
							}
						},
						children: "취소·환불"
					})]
				})]
			}) }, o.id)),
			rest.slice(0, 12).map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between px-1 text-sm text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					o.studentName,
					" · ",
					o.productName,
					" × ",
					o.qty
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: o.status === "done" ? "수령" : "취소" })]
			}, o.id))
		]
	});
}
function TaxOfficePanel({ token, data, onDone }) {
	const [name, setName] = (0, import_react.useState)("");
	const [appliesOn, setAppliesOn] = (0, import_react.useState)("manual");
	const [charge, setCharge] = (0, import_react.useState)("fixed");
	const [value, setValue] = (0, import_react.useState)("10");
	const unpaid = (data?.students ?? []).filter((s) => s.taxDue > 0);
	const dueTotal = unpaid.reduce((sum, s) => sum + s.taxDue, 0);
	const kinds = data?.taxKinds ?? [];
	const donors = data?.donors ?? [];
	const top = donors[0] ?? null;
	const topTied = top ? donors.filter((d) => d.donated === top.donated) : [];
	const donatedTotal = donors.reduce((sum, d) => sum + d.donated, 0);
	const unlocked = Boolean(data?.vaultUnlocked);
	const faceReady = Boolean(data?.vaultFaceRegistered);
	const [scan, setScan] = (0, import_react.useState)(null);
	const [vaultPw, setVaultPw] = (0, import_react.useState)("");
	const registerFace = useMutation({
		mutationFn: (descriptor) => registerVaultFaceFn({ data: {
			token,
			descriptor
		} }),
		onSuccess: () => {
			setScan(null);
			toast.success("선생님 얼굴을 등록했어요. 이제 얼굴로 창고를 열 수 있어요.");
			onDone();
		},
		onError: (err) => toast.error(errMsg(err))
	});
	const unlockFace = useMutation({
		mutationFn: (descriptor) => unlockVaultFaceFn({ data: {
			token,
			descriptor
		} }),
		onSuccess: () => {
			setScan(null);
			toast.success("학급 창고를 열었어요. 잠그기를 누를 때까지 열려 있어요.");
			onDone();
		},
		onError: (err) => toast.error(errMsg(err))
	});
	const unlockPassword = useMutation({
		mutationFn: () => unlockVaultPasswordFn({ data: {
			token,
			password: vaultPw
		} }),
		onSuccess: () => {
			setVaultPw("");
			setScan(null);
			toast.success("학급 창고를 열었어요. 잠그기를 누를 때까지 열려 있어요.");
			onDone();
		},
		onError: (err) => toast.error(errMsg(err))
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-3 p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-end justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [
									unlocked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockOpen, { className: "size-4 text-primary" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-4 text-primary" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "font-display font-semibold",
										children: "학급 창고"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: unlocked ? "outline" : "warn",
										children: unlocked ? "열림" : "잠김"
									})
								]
							}),
							unlocked ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 font-display text-3xl tabular-nums",
								children: formatWon(data?.taxVault ?? 0)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-muted",
								children: [
									"아직 안 낸 세금 ",
									formatWon(dueTotal),
									donatedTotal > 0 ? ` · 기부 ${formatWon(donatedTotal)}` : ""
								]
							})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted",
								children: "선생님 얼굴이나 비밀번호 중 하나로 열면 잔액·출납을 볼 수 있어요."
							}),
							top ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 text-sm font-medium",
								children: [
									"기부왕 ",
									topTied.map((d) => d.name).join(", "),
									" · ",
									formatWon(top.donated)
								]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted",
								children: "아직 기부왕이 없어요."
							})
						] }), unlocked ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									onClick: async () => {
										try {
											const res = await collectAllTaxFn({ data: { token } });
											toast.success(res.count ? `${res.count}명에게서 ${formatWon(res.paid)} 징수했어요.` : "징수할 잔액이 없어요.");
											onDone();
										} catch (err) {
											toast.error(errMsg(err));
										}
									},
									disabled: unpaid.length === 0,
									children: "미납 일괄 징수"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "outline",
									onClick: () => setScan("register"),
									children: "얼굴 다시 등록"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									onClick: async () => {
										try {
											await lockVaultFn({ data: { token } });
											toast.success("학급 창고를 잠갔어요.");
											onDone();
										} catch (err) {
											toast.error(errMsg(err));
										}
									},
									children: "잠그기"
								})
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex w-full min-w-56 flex-col gap-3 sm:w-auto",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										type: "button",
										variant: "outline",
										onClick: () => setScan("register"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanFace, { className: "size-4" }), faceReady ? "얼굴 다시 등록" : "얼굴 등록"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										type: "button",
										disabled: !faceReady,
										onClick: () => setScan("unlock"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanFace, { className: "size-4" }), "얼굴로 열기"]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-center text-xs text-muted",
									children: "또는 비밀번호"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
									className: "flex flex-wrap gap-2",
									onSubmit: (e) => {
										e.preventDefault();
										unlockPassword.mutate();
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "password",
										autoComplete: "current-password",
										value: vaultPw,
										onChange: (e) => setVaultPw(e.target.value),
										placeholder: "선생님 비밀번호",
										className: "w-40"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										type: "submit",
										disabled: unlockPassword.isPending || vaultPw.length < 1,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "size-4" }), "비밀번호로 열기"]
									})]
								})
							]
						})]
					}),
					scan ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FaceScan, {
						mode: scan,
						busy: registerFace.isPending || unlockFace.isPending,
						onCancel: () => setScan(null),
						onCapture: (descriptor) => {
							if (scan === "register") registerFace.mutate(descriptor);
							else unlockFace.mutate(descriptor);
						}
					}) : null,
					unlocked && (data?.vaultLedger?.length ?? 0) > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1 rounded-lg bg-bg-sunken px-3 py-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: "출납 기록"
						}), data?.vaultLedger?.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-3 text-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								vaultKindLabel(row.kind),
								" · ",
								row.memo
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "shrink-0 tabular-nums",
								children: [
									formatWon(row.amount),
									" · ",
									formatWhen(row.createdAt)
								]
							})]
						}, row.id))]
					}) : null
				]
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-3 p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display font-semibold",
					children: "기부 순위"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "학생 통장에서 기부한 돈이 학급 금고로 들어옵니다."
				})] }), donors.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "아직 기부한 학생이 없어요."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-2",
					children: donors.map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							i + 1,
							"등 ",
							d.name,
							top && d.donated === top.donated ? " · 기부왕" : ""
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "tabular-nums font-medium",
							children: formatWon(d.donated)
						})]
					}, d.studentId))
				})]
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-3 p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display font-semibold",
					children: "세금 종류"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "건강세, 환경세처럼 이름을 붙여 추가해요. 월급·주식·간식에 자동으로 붙이거나, 선생님이 직접 고지할 수 있어요."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "grid gap-2 sm:grid-cols-2",
					onSubmit: async (e) => {
						e.preventDefault();
						try {
							await upsertTaxKindFn({ data: {
								token,
								name,
								appliesOn,
								charge,
								value: Number(value)
							} });
							toast.success(`${name.trim()}를 추가했어요.`);
							setName("");
							onDone();
						} catch (err) {
							toast.error(errMsg(err));
						}
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: name,
							onChange: (e) => setName(e.target.value),
							placeholder: "세금 이름 (예: 환경세)",
							required: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							className: "h-11 rounded-md border border-input bg-surface px-3 text-sm",
							value: appliesOn,
							onChange: (e) => setAppliesOn(e.target.value),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "income",
									children: "월급 받을 때"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "gain",
									children: "주식 이익 날 때"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "snack",
									children: "간식 살 때"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "manual",
									children: "선생님이 고지할 때"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							className: "h-11 rounded-md border border-input bg-surface px-3 text-sm",
							value: charge,
							onChange: (e) => setCharge(e.target.value),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "percent",
								children: "비율 %"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "fixed",
								children: "정액 원"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							min: 0,
							max: charge === "percent" ? 100 : void 0,
							step: 1,
							value,
							onChange: (e) => setValue(e.target.value),
							placeholder: charge === "percent" ? "세율 %" : "금액 원",
							required: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							className: "sm:col-span-2",
							children: "세금 추가"
						})
					]
				})]
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [kinds.map((kind) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaxKindRow, {
					token,
					kind,
					studentCount: data?.students.length ?? 0,
					onDone
				}, kind.id)), kinds.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "아직 세금 종류가 없어요. 위에서 추가해 주세요."
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display font-semibold",
						children: "미납 학생"
					}),
					unpaid.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "미납 학생이 없어요."
					}) : null,
					unpaid.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "flex flex-wrap items-center justify-between gap-2 p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: s.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted",
							children: [
								"미납 ",
								formatWon(s.taxDue),
								" · 현금 ",
								formatWon(s.cash),
								s.taxParts.length ? ` · ${s.taxParts.map((p) => `${p.name} ${formatWon(p.due)}`).join(", ")}` : ""
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							disabled: !unlocked,
							onClick: async () => {
								try {
									const res = await collectTaxFn({ data: {
										token,
										studentId: s.id
									} });
									toast.success(`${s.name}에게서 ${formatWon(res.paid)} 징수했어요.`);
									onDone();
								} catch (err) {
									toast.error(errMsg(err));
								}
							},
							children: unlocked ? "징수" : "창고 잠김"
						})]
					}) }, s.id))
				]
			})
		]
	});
}
function TaxKindRow({ token, kind, studentCount, onDone }) {
	const [name, setName] = (0, import_react.useState)(kind.name);
	const [appliesOn, setAppliesOn] = (0, import_react.useState)(kind.appliesOn);
	const [charge, setCharge] = (0, import_react.useState)(kind.charge);
	const [value, setValue] = (0, import_react.useState)(String(kind.charge === "fixed" ? kind.amount : kind.rate));
	const [editing, setEditing] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: kind.isActive ? "" : "opacity-70",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "space-y-3 p-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium",
					children: kind.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted",
					children: [
						taxRuleLabel(kind),
						" · ",
						taxAppliesLabel(kind.appliesOn),
						kind.isActive ? "" : " · 꺼짐"
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						kind.appliesOn === "manual" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							disabled: !kind.isActive || studentCount === 0,
							onClick: async () => {
								try {
									const res = await assessTaxKindFn({ data: {
										token,
										kindId: kind.id
									} });
									toast.success(res.count ? `${kind.name} ${formatWon(res.billed)}을 ${res.count}명에게 고지했어요.` : "고지할 금액이 없어요.");
									onDone();
								} catch (err) {
									toast.error(errMsg(err));
								}
							},
							children: "전원 고지"
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							onClick: () => setEditing((v) => !v),
							children: editing ? "닫기" : "수정"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							onClick: async () => {
								try {
									await upsertTaxKindFn({ data: {
										token,
										id: kind.id,
										name: kind.name,
										appliesOn: kind.appliesOn,
										charge: kind.charge,
										value: kind.charge === "fixed" ? kind.amount : kind.rate,
										isActive: !kind.isActive
									} });
									toast.success(kind.isActive ? `${kind.name}를 껐어요.` : `${kind.name}를 켰어요.`);
									onDone();
								} catch (err) {
									toast.error(errMsg(err));
								}
							},
							children: kind.isActive ? "끄기" : "켜기"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: async () => {
								if (!confirm(`${kind.name}를 삭제할까요?`)) return;
								try {
									await deleteTaxKindFn({ data: {
										token,
										id: kind.id
									} });
									toast.success("세금을 지웠어요.");
									onDone();
								} catch (err) {
									toast.error(errMsg(err));
								}
							},
							children: "삭제"
						})
					]
				})]
			}), editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "grid gap-2 sm:grid-cols-5",
				onSubmit: async (e) => {
					e.preventDefault();
					try {
						await upsertTaxKindFn({ data: {
							token,
							id: kind.id,
							name,
							appliesOn,
							charge,
							value: Number(value),
							isActive: kind.isActive
						} });
						toast.success("저장했어요.");
						setEditing(false);
						onDone();
					} catch (err) {
						toast.error(errMsg(err));
					}
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: name,
						onChange: (e) => setName(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: "h-11 rounded-md border border-input bg-surface px-3 text-sm",
						value: appliesOn,
						onChange: (e) => setAppliesOn(e.target.value),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "income",
								children: "월급 받을 때"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "gain",
								children: "주식 이익 날 때"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "snack",
								children: "간식 살 때"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "manual",
								children: "선생님이 고지할 때"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: "h-11 rounded-md border border-input bg-surface px-3 text-sm",
						value: charge,
						onChange: (e) => setCharge(e.target.value),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "percent",
							children: "비율 %"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "fixed",
							children: "정액 원"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "number",
						min: 0,
						value,
						onChange: (e) => setValue(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						variant: "outline",
						children: "저장"
					})
				]
			}) : null]
		})
	});
}
function EventsPanel({ token, data, onDone }) {
	const [name, setName] = (0, import_react.useState)("");
	const [description, setDescription] = (0, import_react.useState)("");
	const [fee, setFee] = (0, import_react.useState)("50");
	const [reward, setReward] = (0, import_react.useState)("0");
	const [eventOn, setEventOn] = (0, import_react.useState)("");
	async function create(openNow) {
		await upsertEventFn({ data: {
			token,
			name,
			description,
			fee: Number(fee) || 0,
			reward: Number(reward) || 0,
			eventOn,
			openNow
		} });
		toast.success(openNow ? `${name.trim()}를 개최했어요.` : `${name.trim()}를 등록했어요.`);
		setName("");
		setDescription("");
		setFee("50");
		setReward("0");
		setEventOn("");
		onDone();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-3 p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display font-semibold",
					children: "학급 이벤트"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "등록만 하면 학생에게 안 보여요. 개최하면 바로 신청할 수 있습니다. 참가비는 학급 금고로 들어가고, 보상은 금고에서 줍니다."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "grid gap-2 sm:grid-cols-2",
					onSubmit: async (e) => {
						e.preventDefault();
						try {
							await create(false);
						} catch (err) {
							toast.error(errMsg(err));
						}
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "event-name",
								children: "행사 이름"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "event-name",
								value: name,
								onChange: (e) => setName(e.target.value),
								placeholder: "예: 봄 소풍",
								required: true
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "event-on",
								children: "날짜"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "event-on",
								type: "date",
								value: eventOn,
								onChange: (e) => setEventOn(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "event-fee",
								children: "참가비 (원)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "event-fee",
								type: "number",
								min: 0,
								value: fee,
								onChange: (e) => setFee(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "event-reward",
								children: "참여 보상 (원)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "event-reward",
								type: "number",
								min: 0,
								value: reward,
								onChange: (e) => setReward(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1 sm:col-span-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "event-desc",
								children: "설명"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "event-desc",
								value: description,
								onChange: (e) => setDescription(e.target.value),
								placeholder: "어디서 하는지, 준비물 등"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							variant: "outline",
							children: "등록"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							onClick: async () => {
								try {
									await create(true);
								} catch (err) {
									toast.error(errMsg(err));
								}
							},
							children: "등록하고 개최"
						})
					]
				})]
			}) }),
			(data?.events ?? []).map((ev) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventRow, {
				token,
				event: ev,
				students: data?.students ?? [],
				onDone
			}, ev.id)),
			(data?.events ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "아직 등록된 행사가 없어요. 위에서 만들어 주세요."
			}) : null
		]
	});
}
function EventRow({ token, event, students, onDone }) {
	const [editing, setEditing] = (0, import_react.useState)(false);
	const [name, setName] = (0, import_react.useState)(event.name);
	const [description, setDescription] = (0, import_react.useState)(event.description);
	const [fee, setFee] = (0, import_react.useState)(String(event.fee));
	const [reward, setReward] = (0, import_react.useState)(String(event.reward));
	const [eventOn, setEventOn] = (0, import_react.useState)(event.eventOn ?? "");
	const [showPeople, setShowPeople] = (0, import_react.useState)(event.status === "open");
	const joined = new Set(event.signups.map((s) => s.studentId));
	const others = students.filter((s) => !joined.has(s.id));
	const unpaidReward = event.signups.filter((s) => s.rewarded <= 0).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
		className: "space-y-3 p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: event.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: event.status === "open" ? "warn" : "outline",
							children: eventStatusLabel(event.status)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: [
							event.eventOn ? `${formatDay(event.eventOn)} · ` : "",
							"참가비 ",
							formatWon(event.fee),
							event.reward > 0 ? ` · 보상 ${formatWon(event.reward)}` : "",
							` · ${event.signupCount}명 참가`
						]
					}),
					event.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: event.description
					}) : null
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						event.status !== "open" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							onClick: async () => {
								try {
									await setEventStatusFn({ data: {
										token,
										id: event.id,
										status: "open"
									} });
									toast.success(`${event.name}를 개최했어요.`);
									onDone();
								} catch (err) {
									toast.error(errMsg(err));
								}
							},
							children: event.status === "closed" ? "다시 개최" : "개최"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							onClick: async () => {
								try {
									await setEventStatusFn({ data: {
										token,
										id: event.id,
										status: "closed"
									} });
									toast.success("행사를 종료했어요.");
									onDone();
								} catch (err) {
									toast.error(errMsg(err));
								}
							},
							children: "종료"
						}),
						event.reward > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							disabled: unpaidReward === 0,
							onClick: async () => {
								try {
									const res = await payEventRewardsFn({ data: {
										token,
										eventId: event.id
									} });
									toast.success(res.count ? `${res.count}명에게 ${formatWon(res.paid)} 보상을 줬어요.` : "줄 보상이 없어요.");
									onDone();
								} catch (err) {
									toast.error(errMsg(err));
								}
							},
							children: "보상 지급"
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							onClick: () => setShowPeople((v) => !v),
							children: "참가자"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							onClick: () => setEditing((v) => !v),
							children: editing ? "닫기" : "수정"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: async () => {
								if (!confirm(`${event.name}를 삭제할까요?`)) return;
								try {
									await deleteEventFn({ data: {
										token,
										id: event.id
									} });
									toast.success("행사를 지웠어요.");
									onDone();
								} catch (err) {
									toast.error(errMsg(err));
								}
							},
							children: "삭제"
						})
					]
				})]
			}),
			editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "grid gap-2 sm:grid-cols-2",
				onSubmit: async (e) => {
					e.preventDefault();
					try {
						await upsertEventFn({ data: {
							token,
							id: event.id,
							name,
							description,
							fee: Number(fee) || 0,
							reward: Number(reward) || 0,
							eventOn
						} });
						toast.success("저장했어요.");
						setEditing(false);
						onDone();
					} catch (err) {
						toast.error(errMsg(err));
					}
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "행사 이름" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: name,
							onChange: (e) => setName(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "날짜" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "date",
							value: eventOn,
							onChange: (e) => setEventOn(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "참가비 (원)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							min: 0,
							value: fee,
							onChange: (e) => setFee(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "참여 보상 (원)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							min: 0,
							value: reward,
							onChange: (e) => setReward(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1 sm:col-span-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "설명" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: description,
							onChange: (e) => setDescription(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						variant: "outline",
						className: "sm:col-span-2",
						children: "저장"
					})
				]
			}) : null,
			showPeople ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2 border-t border-border pt-3",
				children: [
					event.status === "open" && others.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "flex flex-wrap gap-2",
						onSubmit: async (e) => {
							e.preventDefault();
							const select = e.currentTarget.elements.namedItem("studentId");
							const studentId = Number(select.value);
							if (!studentId) return;
							try {
								await teacherJoinEventFn({ data: {
									token,
									eventId: event.id,
									studentId
								} });
								toast.success("대신 참가시켰어요.");
								onDone();
							} catch (err) {
								toast.error(errMsg(err));
							}
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								name: "studentId",
								className: "h-11 min-w-36 flex-1 rounded-md border border-input bg-surface px-3 text-sm",
								defaultValue: "",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									disabled: true,
									children: "대신 참가시킬 학생"
								}), others.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: s.id,
									children: s.name
								}, s.id))]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								size: "sm",
								variant: "outline",
								children: "대신 신청"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								size: "sm",
								onClick: async () => {
									try {
										const res = await teacherJoinAllFn({ data: {
											token,
											eventId: event.id
										} });
										const skipNote = res.skipped.length ? ` · ${res.skipped.map((s) => `${s.name}(${s.reason})`).join(", ")}` : "";
										toast.success(res.joined ? `${res.joined}명을 참가시켰어요.${skipNote}` : `새로 참가한 학생이 없어요.${skipNote}`);
										onDone();
									} catch (err) {
										toast.error(errMsg(err));
									}
								},
								children: "전원 참가"
							})
						]
					}) : null,
					event.signups.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "아직 참가한 학생이 없어요."
					}) : null,
					event.signups.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							s.studentName,
							s.paid > 0 ? ` · 참가비 ${formatWon(s.paid)}` : "",
							s.rewarded > 0 ? ` · 보상 ${formatWon(s.rewarded)}` : ""
						] }), event.status === "open" && s.rewarded <= 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: async () => {
								try {
									await teacherCancelEventFn({ data: {
										token,
										eventId: event.id,
										studentId: s.studentId
									} });
									toast.success(`${s.studentName} 참가를 취소했어요.`);
									onDone();
								} catch (err) {
									toast.error(errMsg(err));
								}
							},
							children: "환불"
						}) : null]
					}, s.studentId))
				]
			}) : null
		]
	}) });
}
function SavingsPanel({ token, data, onDone }) {
	const [rate, setRate] = (0, import_react.useState)(String(data?.savingsRate ?? 5));
	(0, import_react.useEffect)(() => {
		setRate(String(data?.savingsRate ?? 5));
	}, [data?.savingsRate]);
	const pay = useMutation({
		mutationFn: () => payInterestFn({ data: { token } }),
		onSuccess: (res) => {
			toast.success(res.count ? `${res.count}명에게 이자 ${formatWon(res.paid)}를 넣었어요.` : "이번 주 이자는 이미 들어갔거나, 저축한 학생이 없어요.");
			onDone();
		},
		onError: (e) => toast.error(errMsg(e))
	});
	const students = data?.students ?? [];
	const totalSavings = students.reduce((sum, s) => sum + s.savings, 0);
	const currentRate = data?.savingsRate ?? 5;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-3 p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display font-semibold",
						children: "저축 이자"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: [
							"학생이 통장에서 저축하면, 월요일~일요일에 한 번 이자가 저축에 붙어요. 지금 반 저축 ",
							formatWon(totalSavings),
							"."
						]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "flex flex-wrap items-end gap-2",
						onSubmit: async (e) => {
							e.preventDefault();
							const next = Number(rate);
							if (!Number.isFinite(next) || next < 0 || next > 100) {
								toast.error("이자율은 0%부터 100%까지예요.");
								return;
							}
							try {
								await setSavingsRateFn({ data: {
									token,
									rate: next
								} });
								toast.success(`일주일 이자를 ${next}%로 바꿨어요.`);
								onDone();
							} catch (err) {
								toast.error(errMsg(err));
							}
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "savings-rate",
								children: "일주일 이자율 (%)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "savings-rate",
								type: "number",
								min: 0,
								max: 100,
								step: .5,
								className: "w-32",
								value: rate,
								onChange: (e) => setRate(e.target.value)
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							children: "이자율 저장"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: () => pay.mutate(),
							disabled: pay.isPending,
							children: "이번 주 이자 지급"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "학생이 들어오면 자동으로도 들어갑니다."
						})]
					})
				]
			}) }),
			students.map((s) => {
				const due = paidThisWeek(s.lastInterestOn) ? 0 : interestOn(s.savings, currentRate);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "flex flex-wrap items-center justify-between gap-2 p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: s.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: [
							"저축 ",
							formatWon(s.savings),
							s.savings > 0 ? paidThisWeek(s.lastInterestOn) ? " · 이번 주 이자 입금" : due > 0 ? ` · 이번 주 예상 ${formatWon(due)}` : "" : " · 아직 저축 없음"
						]
					})] }), s.savings > 0 ? paidThisWeek(s.lastInterestOn) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						children: "이번 주 이자"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "warn",
						children: "이자 대기"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						children: "저축 없음"
					})]
				}) }, s.id);
			}),
			students.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "아직 학생이 없어요."
			}) : null
		]
	});
}
function SettingsPanel({ token, roomName, onDone }) {
	const [nextName, setNextName] = (0, import_react.useState)(roomName);
	const [current, setCurrent] = (0, import_react.useState)("");
	const [next, setNext] = (0, import_react.useState)("");
	const [next2, setNext2] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		setNextName(roomName);
	}, [roomName]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "space-y-3 p-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display font-semibold",
				children: "학급 이름"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "flex gap-2",
				onSubmit: async (e) => {
					e.preventDefault();
					try {
						await renameClassFn({ data: {
							token,
							className: nextName
						} });
						toast.success("학급 이름을 바꿨어요.");
						onDone();
					} catch (err) {
						toast.error(errMsg(err));
					}
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: nextName,
					onChange: (e) => setNextName(e.target.value)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					children: "저장"
				})]
			})]
		}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "space-y-3 p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display font-semibold",
					children: "선생님 비밀번호 바꾸기"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "다른 기기에서도 같은 비밀번호로 창구에 들어갈 수 있어요."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "space-y-2",
					onSubmit: async (e) => {
						e.preventDefault();
						if (next !== next2) {
							toast.error("새 비밀번호가 서로 달라요.");
							return;
						}
						try {
							await changeTeacherPasswordFn({ data: {
								token,
								current,
								next
							} });
							toast.success("비밀번호를 바꿨어요.");
							setCurrent("");
							setNext("");
							setNext2("");
							onDone();
						} catch (err) {
							toast.error(errMsg(err));
						}
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "password",
							value: current,
							onChange: (e) => setCurrent(e.target.value),
							placeholder: "지금 비밀번호"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "password",
							value: next,
							onChange: (e) => setNext(e.target.value),
							placeholder: "새 비밀번호 (4자 이상)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "password",
							value: next2,
							onChange: (e) => setNext2(e.target.value),
							placeholder: "새 비밀번호 확인"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							children: "비밀번호 변경"
						})
					]
				})
			]
		}) })]
	});
}
function TeacherPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TeacherApp, {});
}
//#endregion
export { TeacherPage as component };
