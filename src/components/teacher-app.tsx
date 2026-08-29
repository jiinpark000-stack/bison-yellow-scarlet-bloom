import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Fingerprint, KeyRound, Lock, LockOpen, LogOut, ScanFace } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FaceScan } from "@/components/face-scan";
import {
  changeTeacherPasswordFn,
  lockVaultFn,
  logoutFn,
  registerStudentFaceFn,
  registerVaultFaceFn,
  removeFingerprintFn,
  removeVaultFaceFn,
  unlockVaultFaceFn,
  unlockVaultPasswordFn,
} from "@/lib/fn/session";
import {
  deleteEventFn,
  payEventRewardsFn,
  setEventStatusFn,
  teacherCancelEventFn,
  teacherJoinAllFn,
  teacherJoinEventFn,
  upsertEventFn,
} from "@/lib/fn/events";
import {
  addStudentFn,
  addStudentsBulkFn,
  adjustCashFn,
  assessTaxKindFn,
  collectAllTaxFn,
  collectTaxFn,
  deleteJobFn,
  deleteProductFn,
  deleteTaxKindFn,
  fulfillOrderFn,
  payInterestFn,
  paySalariesFn,
  refundOrderFn,
  removeStudentFn,
  renameClassFn,
  setSavingsRateFn,
  teacherOverviewFn,
  updateStudentFn,
  upsertJobFn,
  upsertProductFn,
  upsertTaxKindFn,
} from "@/lib/fn/teacher";
import { clearToken, getToken } from "@/lib/session-client";
import { eventStatusLabel, formatDay, formatWhen, formatWon, interestOn, paidThisWeek, taxAppliesLabel, taxRuleLabel, vaultKindLabel } from "@/lib/utils";

function errMsg(e: unknown) {
  return e instanceof Error ? e.message : "잠시 후 다시 시도해 주세요.";
}

export function TeacherApp() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [token, setTokenState] = useState<string | null>(null);

  useEffect(() => {
    const t = getToken("teacher");
    if (!t) {
      void navigate({ to: "/" });
      return;
    }
    setTokenState(t);
  }, [navigate]);

  const overview = useQuery({
    queryKey: ["teacher", token],
    queryFn: () => teacherOverviewFn({ data: { token: token ?? "" } }),
    enabled: Boolean(token),
    placeholderData: (prev) => prev,
  });

  useEffect(() => {
    if (overview.isError && token) {
      clearToken("teacher");
      void navigate({ to: "/" });
    }
  }, [overview.isError, token, navigate]);

  if (!token) {
    return <div className="min-h-dvh bg-bg" />;
  }

  const refresh = () => void qc.invalidateQueries({ queryKey: ["teacher"] });
  const data = overview.data;

  return (
    <div className="mx-auto min-h-dvh max-w-4xl px-4 py-6">
      <header className="mb-6 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-primary">선생님 창구</p>
          <h1 className="font-display text-2xl font-semibold">{data?.className ?? "6학년 5반"}</h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            await logoutFn({ data: { token } });
            clearToken("teacher");
            void navigate({ to: "/" });
          }}
        >
          <LogOut className="size-4" />
          나가기
        </Button>
      </header>

      {data && !data.passwordChanged ? (
        <Card className="mb-4 border-warn/30">
          <CardContent className="p-4 text-sm">
            아직 기본 비밀번호예요. 설정 탭에서 다른 기기로도 쓸 비밀번호로 바꿔 주세요.
          </CardContent>
        </Card>
      ) : null}

      <Tabs defaultValue="class">
        <TabsList className="flex h-auto w-full flex-wrap justify-start">
          <TabsTrigger value="class">학급</TabsTrigger>
          <TabsTrigger value="jobs">직업</TabsTrigger>
          <TabsTrigger value="snacks">간식</TabsTrigger>
          <TabsTrigger value="orders">
            주문
            {data?.orders.some((o) => o.status === "waiting") ? (
              <span className="ml-1 size-1.5 rounded-full bg-warn" />
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="tax">
            세금
            {data?.students.some((s) => s.taxDue > 0) ? (
              <span className="ml-1 size-1.5 rounded-full bg-warn" />
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="events">
            행사
            {(data?.openEventCount ?? 0) > 0 ? (
              <span className="ml-1 size-1.5 rounded-full bg-warn" />
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="savings">저축</TabsTrigger>
          <TabsTrigger value="settings">설정</TabsTrigger>
        </TabsList>

        <TabsContent value="class">
          <ClassPanel token={token} data={data} onDone={refresh} />
        </TabsContent>
        <TabsContent value="jobs">
          <JobsPanel token={token} data={data} onDone={refresh} />
        </TabsContent>
        <TabsContent value="snacks">
          <ProductsPanel token={token} data={data} onDone={refresh} />
        </TabsContent>
        <TabsContent value="orders">
          <OrdersPanel token={token} data={data} onDone={refresh} />
        </TabsContent>
        <TabsContent value="tax">
          <TaxOfficePanel token={token} data={data} onDone={refresh} />
        </TabsContent>
        <TabsContent value="events">
          <EventsPanel token={token} data={data} onDone={refresh} />
        </TabsContent>
        <TabsContent value="savings">
          <SavingsPanel token={token} data={data} onDone={refresh} />
        </TabsContent>
        <TabsContent value="settings">
          <SettingsPanel
            token={token}
            roomName={data?.className ?? ""}
            faces={data?.faces ?? []}
            prints={data?.prints ?? []}
            onDone={refresh}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ClassPanel({
  token,
  data,
  onDone,
}: {
  token: string;
  data: Awaited<ReturnType<typeof teacherOverviewFn>> | undefined;
  onDone: () => void;
}) {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [jobId, setJobId] = useState<string>("");
  const [bulk, setBulk] = useState("");
  const [adjustId, setAdjustId] = useState<number | null>(null);
  const [adjustAmt, setAdjustAmt] = useState("");
  const [scanStudentId, setScanStudentId] = useState<number | null>(null);
  const topDonated = Math.max(0, ...(data?.donors ?? []).map((d) => d.donated));

  const add = useMutation({
    mutationFn: () =>
      addStudentFn({
        data: {
          token,
          name,
          pin,
          jobId: jobId ? Number(jobId) : null,
        },
      }),
    onSuccess: () => {
      toast.success(`${name} 을(를) 등록했어요. 시작 용돈 1,000원.`);
      setName("");
      setPin("");
      onDone();
    },
    onError: (e) => toast.error(errMsg(e)),
  });

  const bulkAdd = useMutation({
    mutationFn: () => {
      const rows = bulk
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [n, p] = line.split(/[,/\s]+/);
          return { name: (n ?? "").trim(), pin: (p ?? "").trim() };
        })
        .filter((r) => r.name && /^\d{4}$/.test(r.pin));
      if (!rows.length) throw new Error("한 줄에 이름,비밀번호 형식으로 적어 주세요. 예: 민준,1234");
      return addStudentsBulkFn({ data: { token, rows } });
    },
    onSuccess: (res) => {
      toast.success(`${res.added}명을 등록했어요.`);
      setBulk("");
      onDone();
    },
    onError: (e) => toast.error(errMsg(e)),
  });

  const pay = useMutation({
    mutationFn: () => paySalariesFn({ data: { token } }),
    onSuccess: (res) => {
      toast.success(res.count ? `${res.count}명에게 이번 주 월급을 넣었어요.` : "이미 이번 주 월급이 들어갔어요.");
      onDone();
    },
    onError: (e) => toast.error(errMsg(e)),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => pay.mutate()} disabled={pay.isPending}>
          이번 주 월급 지급
        </Button>
        <p className="self-center text-sm text-muted">월요일~일요일에 한 번, 학생이 들어오면 자동으로 들어갑니다.</p>
      </div>

      <Card>
        <CardContent className="space-y-3 p-4">
          <h2 className="font-display font-semibold">학생 등록</h2>
          <form
            className="grid gap-2 sm:grid-cols-4"
            onSubmit={(e) => {
              e.preventDefault();
              add.mutate();
            }}
          >
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="이름" required />
            <Input
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="숫자 4자리"
              inputMode="numeric"
              required
            />
            <select
              className="h-11 rounded-md border border-input bg-surface px-3 text-sm"
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
            >
              <option value="">기본 직업(학생)</option>
              {(data?.jobs ?? []).map((j) => (
                <option key={j.id} value={j.id}>
                  {j.name} · {formatWon(j.salary)}
                </option>
              ))}
            </select>
            <Button type="submit" disabled={add.isPending}>
              추가
            </Button>
          </form>
          <Label className="text-muted">여러 명 (한 줄에 이름,비밀번호)</Label>
          <textarea
            className="min-h-24 w-full rounded-md border border-input bg-surface p-3 text-sm"
            placeholder={"민준,1234\n서연,5678"}
            value={bulk}
            onChange={(e) => setBulk(e.target.value)}
          />
          <Button variant="outline" onClick={() => bulkAdd.mutate()} disabled={bulkAdd.isPending}>
            한 번에 등록
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {(data?.students ?? []).map((s) => (
          <Card key={s.id}>
            <CardContent className="space-y-3 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-sm text-muted">
                    {s.jobName ?? "직업 없음"} · 현금 {formatWon(s.cash)} · 저축 {formatWon(s.savings)} · 주식{" "}
                    {formatWon(s.holdingsValue)} · 합계 {formatWon(s.total)}
                    {s.donated > 0 ? ` · 기부 ${formatWon(s.donated)}` : ""}
                    {s.taxDue > 0 ? ` · 미납 세금 ${formatWon(s.taxDue)}` : ""}
                    {s.taxParts.length
                      ? ` (${s.taxParts.map((p) => `${p.name} ${formatWon(p.due)}`).join(", ")})`
                      : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {paidThisWeek(s.lastSalaryOn) ? <Badge variant="outline">이번 주 월급</Badge> : <Badge variant="warn">월급 대기</Badge>}
                  {s.savings > 0 ? (
                    paidThisWeek(s.lastInterestOn) ? (
                      <Badge variant="outline">이번 주 이자</Badge>
                    ) : (
                      <Badge variant="warn">이자 대기</Badge>
                    )
                  ) : null}
                  {s.donated > 0 && s.donated === topDonated ? <Badge>기부왕</Badge> : null}
                  {s.taxDue > 0 ? <Badge variant="warn">세금 미납</Badge> : <Badge variant="outline">세금 완납</Badge>}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <select
                  className="h-11 rounded-md border border-input bg-surface px-3 text-sm"
                  value={s.jobId ?? ""}
                  onChange={async (e) => {
                    const value = e.target.value ? Number(e.target.value) : null;
                    try {
                      await updateStudentFn({ data: { token, studentId: s.id, jobId: value } });
                      toast.success("직업을 바꿨어요.");
                      onDone();
                    } catch (err) {
                      toast.error(errMsg(err));
                    }
                  }}
                >
                  <option value="">직업 없음</option>
                  {(data?.jobs ?? []).map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.name}
                    </option>
                  ))}
                </select>
                <Input
                  className="w-28"
                  placeholder="새 비밀번호"
                  inputMode="numeric"
                  onBlur={async (e) => {
                    const next = e.target.value.replace(/\D/g, "");
                    if (next.length !== 4) return;
                    try {
                      await updateStudentFn({ data: { token, studentId: s.id, pin: next } });
                      toast.success("비밀번호를 바꿨어요.");
                      e.target.value = "";
                    } catch (err) {
                      toast.error(errMsg(err));
                    }
                  }}
                />
                {adjustId === s.id ? (
                  <form
                    className="flex gap-2"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      try {
                        await adjustCashFn({
                          data: { token, studentId: s.id, amount: Number(adjustAmt) },
                        });
                        toast.success("잔액을 조정했어요.");
                        setAdjustId(null);
                        setAdjustAmt("");
                        onDone();
                      } catch (err) {
                        toast.error(errMsg(err));
                      }
                    }}
                  >
                    <Input
                      className="w-28"
                      value={adjustAmt}
                      onChange={(e) => setAdjustAmt(e.target.value)}
                      placeholder="+100 / -50"
                    />
                    <Button type="submit" size="sm">
                      적용
                    </Button>
                  </form>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setAdjustId(s.id)}>
                    잔액
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => setScanStudentId(s.id)}>
                  얼굴 {s.faceCount ?? 0}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      const { registerStudentFingerprint } = await import("@/lib/webauthn-client");
                      await registerStudentFingerprint(token, undefined, s.id);
                      toast.success(`${s.name} 지문을 넣었어요. 선생님 창구에는 쓸 수 없어요.`);
                      onDone();
                    } catch (err) {
                      toast.error(errMsg(err));
                    }
                  }}
                >
                  지문 {s.printCount ?? 0}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    if (!confirm(`${s.name} 학생을 삭제할까요?`)) return;
                    try {
                      await removeStudentFn({ data: { token, studentId: s.id } });
                      toast.success("삭제했어요.");
                      onDone();
                    } catch (err) {
                      toast.error(errMsg(err));
                    }
                  }}
                >
                  삭제
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {data && data.students.length === 0 ? (
          <p className="text-sm text-muted">아직 학생이 없어요. 위에서 이름을 등록해 주세요.</p>
        ) : null}
      </div>
      {scanStudentId ? (
        <FaceScan
          mode="register"
          onCancel={() => setScanStudentId(null)}
          onCapture={async (descriptor) => {
            try {
              await registerStudentFaceFn({ data: { token, studentId: scanStudentId, descriptor } });
              const who = data?.students.find((s) => s.id === scanStudentId)?.name ?? "학생";
              toast.success(`${who} 얼굴을 넣었어요. 배경은 보지 않아요. 선생님 창구에는 쓸 수 없어요.`);
              setScanStudentId(null);
              onDone();
            } catch (err) {
              toast.error(errMsg(err));
            }
          }}
        />
      ) : null}
    </div>
  );
}

function JobsPanel({
  token,
  data,
  onDone,
}: {
  token: string;
  data: Awaited<ReturnType<typeof teacherOverviewFn>> | undefined;
  onDone: () => void;
}) {
  const [name, setName] = useState("");
  const [salary, setSalary] = useState("280");
  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="space-y-2 p-4">
          <p className="text-sm text-muted">금액은 일주일 월급이에요. 매주 한 번 자동으로 들어갑니다.</p>
          <form
            className="grid gap-2 sm:grid-cols-3"
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await upsertJobFn({ data: { token, name, salary: Number(salary) } });
                toast.success("직업을 추가했어요.");
                setName("");
                onDone();
              } catch (err) {
                toast.error(errMsg(err));
              }
            }}
          >
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="직업 이름" required />
            <Input
              type="number"
              min={0}
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="일주일 월급"
              required
            />
            <Button type="submit">직업 추가</Button>
          </form>
        </CardContent>
      </Card>
      {(data?.jobs ?? []).map((j) => (
        <JobRow key={j.id} token={token} job={j} onDone={onDone} />
      ))}
    </div>
  );
}

function JobRow({
  token,
  job,
  onDone,
}: {
  token: string;
  job: { id: number; name: string; salary: number };
  onDone: () => void;
}) {
  const [name, setName] = useState(job.name);
  const [salary, setSalary] = useState(String(job.salary));
  return (
    <Card>
      <CardContent className="flex flex-wrap items-center gap-2 p-4">
        <Input className="sm:max-w-40" value={name} onChange={(e) => setName(e.target.value)} />
        <Input className="w-28" type="number" min={0} value={salary} onChange={(e) => setSalary(e.target.value)} />
        <Button
          variant="outline"
          onClick={async () => {
            try {
              await upsertJobFn({ data: { token, id: job.id, name, salary: Number(salary) } });
              toast.success("저장했어요.");
              onDone();
            } catch (err) {
              toast.error(errMsg(err));
            }
          }}
        >
          저장
        </Button>
        <Button
          variant="ghost"
          onClick={async () => {
            try {
              await deleteJobFn({ data: { token, id: job.id } });
              toast.success("직업을 지웠어요.");
              onDone();
            } catch (err) {
              toast.error(errMsg(err));
            }
          }}
        >
          삭제
        </Button>
      </CardContent>
    </Card>
  );
}

function ProductsPanel({
  token,
  data,
  onDone,
}: {
  token: string;
  data: Awaited<ReturnType<typeof teacherOverviewFn>> | undefined;
  onDone: () => void;
}) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("80");
  const [description, setDescription] = useState("");
  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="space-y-2 p-4">
          <form
            className="grid gap-2 sm:grid-cols-2"
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await upsertProductFn({
                  data: { token, name, price: Number(price), description },
                });
                toast.success("간식을 추가했어요.");
                setName("");
                setDescription("");
                onDone();
              } catch (err) {
                toast.error(errMsg(err));
              }
            }}
          >
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="간식 이름" required />
            <Input type="number" min={1} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="가격" required />
            <Input
              className="sm:col-span-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="설명 (학교에서 받는 방식 등)"
            />
            <Button type="submit" className="sm:col-span-2">
              간식 추가
            </Button>
          </form>
        </CardContent>
      </Card>
      {(data?.products ?? []).map((p) => (
        <ProductRow key={p.id} token={token} product={p} onDone={onDone} />
      ))}
    </div>
  );
}

function ProductRow({
  token,
  product,
  onDone,
}: {
  token: string;
  product: { id: number; name: string; price: number; description: string; isActive: boolean };
  onDone: () => void;
}) {
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(String(product.price));
  const [description, setDescription] = useState(product.description);
  return (
    <Card className={product.isActive ? "" : "opacity-60"}>
      <CardContent className="space-y-2 p-4">
        <div className="grid gap-2 sm:grid-cols-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
          <Input type="number" min={1} value={price} onChange={(e) => setPrice(e.target.value)} />
          <Input className="sm:col-span-2" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                await upsertProductFn({
                  data: {
                    token,
                    id: product.id,
                    name,
                    price: Number(price),
                    description,
                    isActive: product.isActive,
                  },
                });
                toast.success("저장했어요.");
                onDone();
              } catch (err) {
                toast.error(errMsg(err));
              }
            }}
          >
            저장
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              try {
                await upsertProductFn({
                  data: {
                    token,
                    id: product.id,
                    name,
                    price: Number(price),
                    description,
                    isActive: !product.isActive,
                  },
                });
                onDone();
              } catch (err) {
                toast.error(errMsg(err));
              }
            }}
          >
            {product.isActive ? "판매 중지" : "다시 판매"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              try {
                await deleteProductFn({ data: { token, id: product.id } });
                toast.success("목록에서 내렸어요.");
                onDone();
              } catch (err) {
                toast.error(errMsg(err));
              }
            }}
          >
            내리기
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function OrdersPanel({
  token,
  data,
  onDone,
}: {
  token: string;
  data: Awaited<ReturnType<typeof teacherOverviewFn>> | undefined;
  onDone: () => void;
}) {
  const waiting = (data?.orders ?? []).filter((o) => o.status === "waiting");
  const rest = (data?.orders ?? []).filter((o) => o.status !== "waiting");
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">결제는 이미 끝났어요. 간식을 건네준 뒤 수령 완료를 눌러 주세요.</p>
      {waiting.length === 0 ? <p className="text-sm text-muted">대기 중인 주문이 없어요.</p> : null}
      {waiting.map((o) => (
        <Card key={o.id}>
          <CardContent className="flex flex-wrap items-center justify-between gap-2 p-4">
            <div>
              <p className="font-medium">
                {o.studentName} · {o.productName} × {o.qty}
              </p>
              <p className="text-sm text-muted">{formatWon(o.total)}</p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={async () => {
                  try {
                    await fulfillOrderFn({ data: { token, orderId: o.id } });
                    toast.success("수령 완료");
                    onDone();
                  } catch (err) {
                    toast.error(errMsg(err));
                  }
                }}
              >
                수령 완료
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  try {
                    await refundOrderFn({ data: { token, orderId: o.id } });
                    toast.success("취소하고 돈을 돌려줬어요.");
                    onDone();
                  } catch (err) {
                    toast.error(errMsg(err));
                  }
                }}
              >
                취소·환불
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      {rest.slice(0, 12).map((o) => (
        <div key={o.id} className="flex items-center justify-between px-1 text-sm text-muted">
          <span>
            {o.studentName} · {o.productName} × {o.qty}
          </span>
          <span>{o.status === "done" ? "수령" : "취소"}</span>
        </div>
      ))}
    </div>
  );
}

function TaxOfficePanel({
  token,
  data,
  onDone,
}: {
  token: string;
  data: Awaited<ReturnType<typeof teacherOverviewFn>> | undefined;
  onDone: () => void;
}) {
  const [name, setName] = useState("");
  const [appliesOn, setAppliesOn] = useState<"income" | "gain" | "snack" | "manual">("manual");
  const [charge, setCharge] = useState<"percent" | "fixed">("fixed");
  const [value, setValue] = useState("10");

  const unpaid = (data?.students ?? []).filter((s) => s.taxDue > 0);
  const dueTotal = unpaid.reduce((sum, s) => sum + s.taxDue, 0);
  const kinds = data?.taxKinds ?? [];
  const donors = data?.donors ?? [];
  const top = donors[0] ?? null;
  const topTied = top ? donors.filter((d) => d.donated === top.donated) : [];
  const donatedTotal = donors.reduce((sum, d) => sum + d.donated, 0);
  const unlocked = Boolean(data?.vaultUnlocked);
  const faceReady = Boolean(data?.vaultFaceRegistered);
  const [scan, setScan] = useState<"register" | "unlock" | null>(null);
  const [vaultPw, setVaultPw] = useState("");
  const registerFace = useMutation({
    mutationFn: (descriptor: number[] | number[][]) => registerVaultFaceFn({ data: { token, descriptor } }),
    onSuccess: () => {
      setScan(null);
      toast.success("얼굴을 추가했어요.");
      onDone();
    },
    onError: (err) => toast.error(errMsg(err)),
  });
  const unlockFace = useMutation({
    mutationFn: (descriptor: number[] | number[][]) => unlockVaultFaceFn({ data: { token, descriptor } }),
    onSuccess: () => {
      setScan(null);
      toast.success("학급 창고를 열었어요. 잠그기를 누를 때까지 열려 있어요.");
      onDone();
    },
    onError: (err) => toast.error(errMsg(err)),
  });
  const unlockPassword = useMutation({
    mutationFn: () => unlockVaultPasswordFn({ data: { token, password: vaultPw } }),
    onSuccess: () => {
      setVaultPw("");
      setScan(null);
      toast.success("학급 창고를 열었어요. 잠그기를 누를 때까지 열려 있어요.");
      onDone();
    },
    onError: (err) => toast.error(errMsg(err)),
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                {unlocked ? <LockOpen className="size-4 text-primary" /> : <Lock className="size-4 text-primary" />}
                <h2 className="font-display font-semibold">학급 창고</h2>
                <Badge variant={unlocked ? "outline" : "warn"}>{unlocked ? "열림" : "잠김"}</Badge>
              </div>
              {unlocked ? (
                <>
                  <p className="mt-2 font-display text-3xl tabular-nums">{formatWon(data?.taxVault ?? 0)}</p>
                  <p className="text-sm text-muted">
                    아직 안 낸 세금 {formatWon(dueTotal)}
                    {donatedTotal > 0 ? ` · 기부 ${formatWon(donatedTotal)}` : ""}
                  </p>
                </>
              ) : (
                <p className="mt-2 text-sm text-muted">
                  선생님 얼굴이나 비밀번호 중 하나로 열면 잔액·출납을 볼 수 있어요.
                </p>
              )}
              {top ? (
                <p className="mt-2 text-sm font-medium">
                  기부왕 {topTied.map((d) => d.name).join(", ")} · {formatWon(top.donated)}
                </p>
              ) : (
                <p className="mt-2 text-sm text-muted">아직 기부왕이 없어요.</p>
              )}
            </div>
            {unlocked ? (
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={async () => {
                    try {
                      const res = await collectAllTaxFn({ data: { token } });
                      toast.success(
                        res.count ? `${res.count}명에게서 ${formatWon(res.paid)} 징수했어요.` : "징수할 잔액이 없어요.",
                      );
                      onDone();
                    } catch (err) {
                      toast.error(errMsg(err));
                    }
                  }}
                  disabled={unpaid.length === 0}
                >
                  미납 일괄 징수
                </Button>
                <Button type="button" variant="outline" onClick={() => setScan("register")}>
                  얼굴 추가
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      await lockVaultFn({ data: { token } });
                      toast.success("학급 창고를 잠갔어요.");
                      onDone();
                    } catch (err) {
                      toast.error(errMsg(err));
                    }
                  }}
                >
                  잠그기
                </Button>
              </div>
            ) : (
              <div className="flex w-full min-w-56 flex-col gap-3 sm:w-auto">
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant={faceReady ? "outline" : "default"} onClick={() => setScan("register")}>
                    <ScanFace className="size-4" />
                    {faceReady ? "얼굴 추가" : "얼굴 등록"}
                  </Button>
                  <Button type="button" disabled={!faceReady} onClick={() => setScan("unlock")}>
                    <ScanFace className="size-4" />
                    얼굴로 열기
                  </Button>
                </div>
                <p className="text-center text-xs text-muted">또는 비밀번호</p>
                <form
                  className="flex flex-wrap gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    unlockPassword.mutate();
                  }}
                >
                  <Input
                    type="password"
                    autoComplete="current-password"
                    value={vaultPw}
                    onChange={(e) => setVaultPw(e.target.value)}
                    placeholder="선생님 비밀번호"
                    className="w-40"
                  />
                  <Button type="submit" disabled={unlockPassword.isPending || vaultPw.length < 1}>
                    <KeyRound className="size-4" />
                    비밀번호로 열기
                  </Button>
                </form>
              </div>
            )}
          </div>
          {scan ? (
            <FaceScan
              mode={scan}
              busy={registerFace.isPending || unlockFace.isPending}
              onCancel={() => setScan(null)}
              onCapture={(descriptor) => {
                if (scan === "register") registerFace.mutate(descriptor);
                else unlockFace.mutate(descriptor);
              }}
            />
          ) : null}
          {unlocked && (data?.vaultLedger?.length ?? 0) > 0 ? (
            <div className="space-y-1 rounded-lg bg-bg-sunken px-3 py-2 text-sm">
              <p className="font-medium">출납 기록</p>
              {data?.vaultLedger?.map((row) => (
                <div key={row.id} className="flex items-center justify-between gap-3 text-muted">
                  <span>
                    {vaultKindLabel(row.kind)} · {row.memo}
                  </span>
                  <span className="shrink-0 tabular-nums">
                    {formatWon(row.amount)} · {formatWhen(row.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-4">
          <div>
            <h2 className="font-display font-semibold">기부 순위</h2>
            <p className="text-sm text-muted">학생 통장에서 기부한 돈이 학급 금고로 들어옵니다.</p>
          </div>
          {donors.length === 0 ? (
            <p className="text-sm text-muted">아직 기부한 학생이 없어요.</p>
          ) : (
            <div className="space-y-2">
              {donors.map((d, i) => (
                <div key={d.studentId} className="flex items-center justify-between text-sm">
                  <span>
                    {i + 1}등 {d.name}
                    {top && d.donated === top.donated ? " · 기부왕" : ""}
                  </span>
                  <span className="tabular-nums font-medium">{formatWon(d.donated)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-4">
          <div>
            <h2 className="font-display font-semibold">세금 종류</h2>
            <p className="text-sm text-muted">
              건강세, 환경세처럼 이름을 붙여 추가해요. 월급·주식·간식에 자동으로 붙이거나, 선생님이 직접 고지할 수 있어요.
            </p>
          </div>
          <form
            className="grid gap-2 sm:grid-cols-2"
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await upsertTaxKindFn({
                  data: {
                    token,
                    name,
                    appliesOn,
                    charge,
                    value: Number(value),
                  },
                });
                toast.success(`${name.trim()}를 추가했어요.`);
                setName("");
                onDone();
              } catch (err) {
                toast.error(errMsg(err));
              }
            }}
          >
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="세금 이름 (예: 환경세)" required />
            <select
              className="h-11 rounded-md border border-input bg-surface px-3 text-sm"
              value={appliesOn}
              onChange={(e) => setAppliesOn(e.target.value as typeof appliesOn)}
            >
              <option value="income">월급 받을 때</option>
              <option value="gain">주식 이익 날 때</option>
              <option value="snack">간식 살 때</option>
              <option value="manual">선생님이 고지할 때</option>
            </select>
            <select
              className="h-11 rounded-md border border-input bg-surface px-3 text-sm"
              value={charge}
              onChange={(e) => setCharge(e.target.value as typeof charge)}
            >
              <option value="percent">비율 %</option>
              <option value="fixed">정액 원</option>
            </select>
            <Input
              type="number"
              min={0}
              max={charge === "percent" ? 100 : undefined}
              step={1}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={charge === "percent" ? "세율 %" : "금액 원"}
              required
            />
            <Button type="submit" className="sm:col-span-2">
              세금 추가
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {kinds.map((kind) => (
          <TaxKindRow key={kind.id} token={token} kind={kind} studentCount={data?.students.length ?? 0} onDone={onDone} />
        ))}
        {kinds.length === 0 ? <p className="text-sm text-muted">아직 세금 종류가 없어요. 위에서 추가해 주세요.</p> : null}
      </div>

      <div className="space-y-2">
        <h2 className="font-display font-semibold">미납 학생</h2>
        {unpaid.length === 0 ? <p className="text-sm text-muted">미납 학생이 없어요.</p> : null}
        {unpaid.map((s) => (
          <Card key={s.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-2 p-4">
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-sm text-muted">
                  미납 {formatWon(s.taxDue)} · 현금 {formatWon(s.cash)}
                  {s.taxParts.length ? ` · ${s.taxParts.map((p) => `${p.name} ${formatWon(p.due)}`).join(", ")}` : ""}
                </p>
              </div>
              <Button
                size="sm"
                disabled={!unlocked}
                onClick={async () => {
                  try {
                    const res = await collectTaxFn({ data: { token, studentId: s.id } });
                    toast.success(`${s.name}에게서 ${formatWon(res.paid)} 징수했어요.`);
                    onDone();
                  } catch (err) {
                    toast.error(errMsg(err));
                  }
                }}
              >
                {unlocked ? "징수" : "창고 잠김"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function TaxKindRow({
  token,
  kind,
  studentCount,
  onDone,
}: {
  token: string;
  kind: {
    id: number;
    name: string;
    appliesOn: "income" | "gain" | "snack" | "manual";
    charge: "percent" | "fixed";
    rate: number;
    amount: number;
    isActive: boolean;
  };
  studentCount: number;
  onDone: () => void;
}) {
  const [name, setName] = useState(kind.name);
  const [appliesOn, setAppliesOn] = useState(kind.appliesOn);
  const [charge, setCharge] = useState(kind.charge);
  const [value, setValue] = useState(String(kind.charge === "fixed" ? kind.amount : kind.rate));
  const [editing, setEditing] = useState(false);

  return (
    <Card className={kind.isActive ? "" : "opacity-70"}>
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-medium">{kind.name}</p>
            <p className="text-sm text-muted">
              {taxRuleLabel(kind)} · {taxAppliesLabel(kind.appliesOn)}
              {kind.isActive ? "" : " · 꺼짐"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {kind.appliesOn === "manual" ? (
              <Button
                size="sm"
                disabled={!kind.isActive || studentCount === 0}
                onClick={async () => {
                  try {
                    const res = await assessTaxKindFn({ data: { token, kindId: kind.id } });
                    toast.success(
                      res.count
                        ? `${kind.name} ${formatWon(res.billed)}을 ${res.count}명에게 고지했어요.`
                        : "고지할 금액이 없어요.",
                    );
                    onDone();
                  } catch (err) {
                    toast.error(errMsg(err));
                  }
                }}
              >
                전원 고지
              </Button>
            ) : null}
            <Button size="sm" variant="outline" onClick={() => setEditing((v) => !v)}>
              {editing ? "닫기" : "수정"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                try {
                  await upsertTaxKindFn({
                    data: {
                      token,
                      id: kind.id,
                      name: kind.name,
                      appliesOn: kind.appliesOn,
                      charge: kind.charge,
                      value: kind.charge === "fixed" ? kind.amount : kind.rate,
                      isActive: !kind.isActive,
                    },
                  });
                  toast.success(kind.isActive ? `${kind.name}를 껐어요.` : `${kind.name}를 켰어요.`);
                  onDone();
                } catch (err) {
                  toast.error(errMsg(err));
                }
              }}
            >
              {kind.isActive ? "끄기" : "켜기"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={async () => {
                if (!confirm(`${kind.name}를 삭제할까요?`)) return;
                try {
                  await deleteTaxKindFn({ data: { token, id: kind.id } });
                  toast.success("세금을 지웠어요.");
                  onDone();
                } catch (err) {
                  toast.error(errMsg(err));
                }
              }}
            >
              삭제
            </Button>
          </div>
        </div>
        {editing ? (
          <form
            className="grid gap-2 sm:grid-cols-5"
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await upsertTaxKindFn({
                  data: {
                    token,
                    id: kind.id,
                    name,
                    appliesOn,
                    charge,
                    value: Number(value),
                    isActive: kind.isActive,
                  },
                });
                toast.success("저장했어요.");
                setEditing(false);
                onDone();
              } catch (err) {
                toast.error(errMsg(err));
              }
            }}
          >
            <Input value={name} onChange={(e) => setName(e.target.value)} />
            <select
              className="h-11 rounded-md border border-input bg-surface px-3 text-sm"
              value={appliesOn}
              onChange={(e) => setAppliesOn(e.target.value as typeof appliesOn)}
            >
              <option value="income">월급 받을 때</option>
              <option value="gain">주식 이익 날 때</option>
              <option value="snack">간식 살 때</option>
              <option value="manual">선생님이 고지할 때</option>
            </select>
            <select
              className="h-11 rounded-md border border-input bg-surface px-3 text-sm"
              value={charge}
              onChange={(e) => setCharge(e.target.value as typeof charge)}
            >
              <option value="percent">비율 %</option>
              <option value="fixed">정액 원</option>
            </select>
            <Input type="number" min={0} value={value} onChange={(e) => setValue(e.target.value)} />
            <Button type="submit" variant="outline">
              저장
            </Button>
          </form>
        ) : null}
      </CardContent>
    </Card>
  );
}

function EventsPanel({
  token,
  data,
  onDone,
}: {
  token: string;
  data: Awaited<ReturnType<typeof teacherOverviewFn>> | undefined;
  onDone: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fee, setFee] = useState("50");
  const [reward, setReward] = useState("0");
  const [eventOn, setEventOn] = useState("");

  async function create(openNow: boolean) {
    await upsertEventFn({
      data: {
        token,
        name,
        description,
        fee: Number(fee) || 0,
        reward: Number(reward) || 0,
        eventOn,
        openNow,
      },
    });
    toast.success(openNow ? `${name.trim()}를 개최했어요.` : `${name.trim()}를 등록했어요.`);
    setName("");
    setDescription("");
    setFee("50");
    setReward("0");
    setEventOn("");
    onDone();
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-3 p-4">
          <div>
            <h2 className="font-display font-semibold">학급 이벤트</h2>
            <p className="text-sm text-muted">
              등록만 하면 학생에게 안 보여요. 개최하면 바로 신청할 수 있습니다. 참가비는 학급 금고로 들어가고, 보상은
              금고에서 줍니다.
            </p>
          </div>
          <form
            className="grid gap-2 sm:grid-cols-2"
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await create(false);
              } catch (err) {
                toast.error(errMsg(err));
              }
            }}
          >
            <div className="space-y-1">
              <Label htmlFor="event-name">행사 이름</Label>
              <Input id="event-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 봄 소풍" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="event-on">날짜</Label>
              <Input id="event-on" type="date" value={eventOn} onChange={(e) => setEventOn(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="event-fee">참가비 (원)</Label>
              <Input id="event-fee" type="number" min={0} value={fee} onChange={(e) => setFee(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="event-reward">참여 보상 (원)</Label>
              <Input id="event-reward" type="number" min={0} value={reward} onChange={(e) => setReward(e.target.value)} />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="event-desc">설명</Label>
              <Input
                id="event-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="어디서 하는지, 준비물 등"
              />
            </div>
            <Button type="submit" variant="outline">
              등록
            </Button>
            <Button
              type="button"
              onClick={async () => {
                try {
                  await create(true);
                } catch (err) {
                  toast.error(errMsg(err));
                }
              }}
            >
              등록하고 개최
            </Button>
          </form>
        </CardContent>
      </Card>
      {(data?.events ?? []).map((ev) => (
        <EventRow key={ev.id} token={token} event={ev} students={data?.students ?? []} onDone={onDone} />
      ))}
      {(data?.events ?? []).length === 0 ? (
        <p className="text-sm text-muted">아직 등록된 행사가 없어요. 위에서 만들어 주세요.</p>
      ) : null}
    </div>
  );
}

function EventRow({
  token,
  event,
  students,
  onDone,
}: {
  token: string;
  event: {
    id: number;
    name: string;
    description: string;
    fee: number;
    reward: number;
    status: "draft" | "open" | "closed";
    eventOn: string | null;
    signupCount: number;
    signups: { studentId: number; studentName: string; paid: number; rewarded: number }[];
  };
  students: { id: number; name: string; cash: number }[];
  onDone: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(event.name);
  const [description, setDescription] = useState(event.description);
  const [fee, setFee] = useState(String(event.fee));
  const [reward, setReward] = useState(String(event.reward));
  const [eventOn, setEventOn] = useState(event.eventOn ?? "");
  const [showPeople, setShowPeople] = useState(event.status === "open");
  const joined = new Set(event.signups.map((s) => s.studentId));
  const others = students.filter((s) => !joined.has(s.id));
  const unpaidReward = event.signups.filter((s) => s.rewarded <= 0).length;

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium">{event.name}</p>
              <Badge variant={event.status === "open" ? "warn" : "outline"}>{eventStatusLabel(event.status)}</Badge>
            </div>
            <p className="text-sm text-muted">
              {event.eventOn ? `${formatDay(event.eventOn)} · ` : ""}
              참가비 {formatWon(event.fee)}
              {event.reward > 0 ? ` · 보상 ${formatWon(event.reward)}` : ""}
              {` · ${event.signupCount}명 참가`}
            </p>
            {event.description ? <p className="mt-1 text-sm text-muted">{event.description}</p> : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {event.status !== "open" ? (
              <Button
                size="sm"
                onClick={async () => {
                  try {
                    await setEventStatusFn({ data: { token, id: event.id, status: "open" } });
                    toast.success(`${event.name}를 개최했어요.`);
                    onDone();
                  } catch (err) {
                    toast.error(errMsg(err));
                  }
                }}
              >
                {event.status === "closed" ? "다시 개최" : "개최"}
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  try {
                    await setEventStatusFn({ data: { token, id: event.id, status: "closed" } });
                    toast.success("행사를 종료했어요.");
                    onDone();
                  } catch (err) {
                    toast.error(errMsg(err));
                  }
                }}
              >
                종료
              </Button>
            )}
            {event.reward > 0 ? (
              <Button
                size="sm"
                variant="outline"
                disabled={unpaidReward === 0}
                onClick={async () => {
                  try {
                    const res = await payEventRewardsFn({ data: { token, eventId: event.id } });
                    toast.success(
                      res.count
                        ? `${res.count}명에게 ${formatWon(res.paid)} 보상을 줬어요.`
                        : "줄 보상이 없어요.",
                    );
                    onDone();
                  } catch (err) {
                    toast.error(errMsg(err));
                  }
                }}
              >
                보상 지급
              </Button>
            ) : null}
            <Button size="sm" variant="outline" onClick={() => setShowPeople((v) => !v)}>
              참가자
            </Button>
            <Button size="sm" variant="outline" onClick={() => setEditing((v) => !v)}>
              {editing ? "닫기" : "수정"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={async () => {
                if (!confirm(`${event.name}를 삭제할까요?`)) return;
                try {
                  await deleteEventFn({ data: { token, id: event.id } });
                  toast.success("행사를 지웠어요.");
                  onDone();
                } catch (err) {
                  toast.error(errMsg(err));
                }
              }}
            >
              삭제
            </Button>
          </div>
        </div>
        {editing ? (
          <form
            className="grid gap-2 sm:grid-cols-2"
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await upsertEventFn({
                  data: {
                    token,
                    id: event.id,
                    name,
                    description,
                    fee: Number(fee) || 0,
                    reward: Number(reward) || 0,
                    eventOn,
                  },
                });
                toast.success("저장했어요.");
                setEditing(false);
                onDone();
              } catch (err) {
                toast.error(errMsg(err));
              }
            }}
          >
            <div className="space-y-1">
              <Label>행사 이름</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>날짜</Label>
              <Input type="date" value={eventOn} onChange={(e) => setEventOn(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>참가비 (원)</Label>
              <Input type="number" min={0} value={fee} onChange={(e) => setFee(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>참여 보상 (원)</Label>
              <Input type="number" min={0} value={reward} onChange={(e) => setReward(e.target.value)} />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label>설명</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <Button type="submit" variant="outline" className="sm:col-span-2">
              저장
            </Button>
          </form>
        ) : null}
        {showPeople ? (
          <div className="space-y-2 border-t border-border pt-3">
            {event.status === "open" && others.length > 0 ? (
              <form
                className="flex flex-wrap gap-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const select = form.elements.namedItem("studentId") as HTMLSelectElement;
                  const studentId = Number(select.value);
                  if (!studentId) return;
                  try {
                    await teacherJoinEventFn({ data: { token, eventId: event.id, studentId } });
                    toast.success("대신 참가시켰어요.");
                    onDone();
                  } catch (err) {
                    toast.error(errMsg(err));
                  }
                }}
              >
                <select
                  name="studentId"
                  className="h-11 min-w-36 flex-1 rounded-md border border-input bg-surface px-3 text-sm"
                  defaultValue=""
                >
                  <option value="" disabled>
                    대신 참가시킬 학생
                  </option>
                  {others.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <Button type="submit" size="sm" variant="outline">
                  대신 신청
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={async () => {
                    try {
                      const res = await teacherJoinAllFn({ data: { token, eventId: event.id } });
                      const skipNote = res.skipped.length
                        ? ` · ${res.skipped.map((s) => `${s.name}(${s.reason})`).join(", ")}`
                        : "";
                      toast.success(
                        res.joined
                          ? `${res.joined}명을 참가시켰어요.${skipNote}`
                          : `새로 참가한 학생이 없어요.${skipNote}`,
                      );
                      onDone();
                    } catch (err) {
                      toast.error(errMsg(err));
                    }
                  }}
                >
                  전원 참가
                </Button>
              </form>
            ) : null}
            {event.signups.length === 0 ? <p className="text-sm text-muted">아직 참가한 학생이 없어요.</p> : null}
            {event.signups.map((s) => (
              <div key={s.studentId} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span>
                  {s.studentName}
                  {s.paid > 0 ? ` · 참가비 ${formatWon(s.paid)}` : ""}
                  {s.rewarded > 0 ? ` · 보상 ${formatWon(s.rewarded)}` : ""}
                </span>
                {event.status === "open" && s.rewarded <= 0 ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      try {
                        await teacherCancelEventFn({
                          data: { token, eventId: event.id, studentId: s.studentId },
                        });
                        toast.success(`${s.studentName} 참가를 취소했어요.`);
                        onDone();
                      } catch (err) {
                        toast.error(errMsg(err));
                      }
                    }}
                  >
                    환불
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function SavingsPanel({
  token,
  data,
  onDone,
}: {
  token: string;
  data: Awaited<ReturnType<typeof teacherOverviewFn>> | undefined;
  onDone: () => void;
}) {
  const [rate, setRate] = useState(String(data?.savingsRate ?? 5));
  useEffect(() => {
    setRate(String(data?.savingsRate ?? 5));
  }, [data?.savingsRate]);

  const pay = useMutation({
    mutationFn: () => payInterestFn({ data: { token } }),
    onSuccess: (res) => {
      toast.success(
        res.count ? `${res.count}명에게 이자 ${formatWon(res.paid)}를 넣었어요.` : "이번 주 이자는 이미 들어갔거나, 저축한 학생이 없어요.",
      );
      onDone();
    },
    onError: (e) => toast.error(errMsg(e)),
  });

  const students = data?.students ?? [];
  const totalSavings = students.reduce((sum, s) => sum + s.savings, 0);
  const currentRate = data?.savingsRate ?? 5;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-3 p-4">
          <div>
            <h2 className="font-display font-semibold">저축 이자</h2>
            <p className="text-sm text-muted">
              학생이 통장에서 저축하면, 월요일~일요일에 한 번 이자가 저축에 붙어요. 지금 반 저축 {formatWon(totalSavings)}.
            </p>
          </div>
          <form
            className="flex flex-wrap items-end gap-2"
            onSubmit={async (e) => {
              e.preventDefault();
              const next = Number(rate);
              if (!Number.isFinite(next) || next < 0 || next > 100) {
                toast.error("이자율은 0%부터 100%까지예요.");
                return;
              }
              try {
                await setSavingsRateFn({ data: { token, rate: next } });
                toast.success(`일주일 이자를 ${next}%로 바꿨어요.`);
                onDone();
              } catch (err) {
                toast.error(errMsg(err));
              }
            }}
          >
            <div className="space-y-1">
              <Label htmlFor="savings-rate">일주일 이자율 (%)</Label>
              <Input
                id="savings-rate"
                type="number"
                min={0}
                max={100}
                step={0.5}
                className="w-32"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
              />
            </div>
            <Button type="submit">이자율 저장</Button>
          </form>
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => pay.mutate()} disabled={pay.isPending}>
              이번 주 이자 지급
            </Button>
            <p className="text-sm text-muted">학생이 들어오면 자동으로도 들어갑니다.</p>
          </div>
        </CardContent>
      </Card>
      {students.map((s) => {
        const due = paidThisWeek(s.lastInterestOn) ? 0 : interestOn(s.savings, currentRate);
        return (
          <Card key={s.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-2 p-4">
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-sm text-muted">
                  저축 {formatWon(s.savings)}
                  {s.savings > 0
                    ? paidThisWeek(s.lastInterestOn)
                      ? " · 이번 주 이자 입금"
                      : due > 0
                        ? ` · 이번 주 예상 ${formatWon(due)}`
                        : ""
                    : " · 아직 저축 없음"}
                </p>
              </div>
              {s.savings > 0 ? (
                paidThisWeek(s.lastInterestOn) ? (
                  <Badge variant="outline">이번 주 이자</Badge>
                ) : (
                  <Badge variant="warn">이자 대기</Badge>
                )
              ) : (
                <Badge variant="outline">저축 없음</Badge>
              )}
            </CardContent>
          </Card>
        );
      })}
      {students.length === 0 ? <p className="text-sm text-muted">아직 학생이 없어요.</p> : null}
    </div>
  );
}

function SettingsPanel({
  token,
  roomName,
  faces,
  prints,
  onDone,
}: {
  token: string;
  roomName: string;
  faces: { id: string; label: string }[];
  prints: { id: string; label: string }[];
  onDone: () => void;
}) {
  const [nextName, setNextName] = useState(roomName);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [next2, setNext2] = useState("");
  const [scan, setScan] = useState(false);
  const [faceLabel, setFaceLabel] = useState("");
  const [printLabel, setPrintLabel] = useState("");
  const registerFace = useMutation({
    mutationFn: (descriptor: number[] | number[][]) =>
      registerVaultFaceFn({ data: { token, descriptor, label: faceLabel.trim() || undefined } }),
    onSuccess: () => {
      setScan(false);
      setFaceLabel("");
      toast.success("얼굴을 추가했어요.");
      onDone();
    },
    onError: (err) => toast.error(errMsg(err)),
  });

  useEffect(() => {
    setNextName(roomName);
  }, [roomName]);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-3 p-4">
          <h2 className="font-display font-semibold">학급 이름</h2>
          <form
            className="flex gap-2"
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await renameClassFn({ data: { token, className: nextName } });
                toast.success("학급 이름을 바꿨어요.");
                onDone();
              } catch (err) {
                toast.error(errMsg(err));
              }
            }}
          >
            <Input value={nextName} onChange={(e) => setNextName(e.target.value)} />
            <Button type="submit">저장</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-3 p-4">
          <h2 className="font-display font-semibold">창구 열기 방법</h2>
          <p className="text-sm text-muted">
            얼굴은 타원 안만 보고 배경은 보지 않아요. 얼굴과 지문은 여러 개 등록할 수 있어요. 지문은
            휴대폰·태블릿에서 넣고, 미리보기에서 막히면 새 창이 열립니다.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium">얼굴 {faces.length}개</p>
              {faces.length === 0 ? <p className="text-sm text-muted">아직 없어요.</p> : null}
              {faces.map((face) => (
                <div key={face.id} className="flex items-center justify-between gap-2 text-sm">
                  <span>{face.label}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      try {
                        await removeVaultFaceFn({ data: { token, id: face.id } });
                        toast.success("얼굴을 지웠어요.");
                        onDone();
                      } catch (err) {
                        toast.error(errMsg(err));
                      }
                    }}
                  >
                    지우기
                  </Button>
                </div>
              ))}
              <Input
                value={faceLabel}
                onChange={(e) => setFaceLabel(e.target.value)}
                placeholder="이름 (선택) 예: 담임"
              />
              <Button type="button" variant="outline" onClick={() => setScan(true)} disabled={faces.length >= 8}>
                <ScanFace className="size-4" />
                얼굴 추가
              </Button>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">지문 {prints.length}개</p>
              {prints.length === 0 ? <p className="text-sm text-muted">아직 없어요.</p> : null}
              {prints.map((print) => (
                <div key={print.id} className="flex items-center justify-between gap-2 text-sm">
                  <span>{print.label}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      try {
                        await removeFingerprintFn({ data: { token, id: print.id } });
                        toast.success("지문을 지웠어요.");
                        onDone();
                      } catch (err) {
                        toast.error(errMsg(err));
                      }
                    }}
                  >
                    지우기
                  </Button>
                </div>
              ))}
              <Input
                value={printLabel}
                onChange={(e) => setPrintLabel(e.target.value)}
                placeholder="이름 (선택) 예: 휴대폰"
              />
              <Button
                type="button"
                variant="outline"
                disabled={prints.length >= 8}
                onClick={async () => {
                  try {
                    const { registerTeacherFingerprint } = await import("@/lib/webauthn-client");
                    await registerTeacherFingerprint(token, printLabel.trim() || undefined);
                    setPrintLabel("");
                    toast.success("지문을 추가했어요.");
                    onDone();
                  } catch (err) {
                    toast.error(errMsg(err));
                  }
                }}
              >
                <Fingerprint className="size-4" />
                지문 추가
              </Button>
            </div>
          </div>
          {scan ? (
            <FaceScan
              mode="register"
              busy={registerFace.isPending}
              onCancel={() => setScan(false)}
              onCapture={(descriptor) => registerFace.mutate(descriptor)}
            />
          ) : null}
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-3 p-4">
          <h2 className="font-display font-semibold">선생님 비밀번호 바꾸기</h2>
          <p className="text-sm text-muted">다른 기기에서도 같은 비밀번호로 창구에 들어갈 수 있어요.</p>
          <form
            className="space-y-2"
            onSubmit={async (e) => {
              e.preventDefault();
              if (next !== next2) {
                toast.error("새 비밀번호가 서로 달라요.");
                return;
              }
              try {
                await changeTeacherPasswordFn({ data: { token, current, next } });
                toast.success("비밀번호를 바꿨어요.");
                setCurrent("");
                setNext("");
                setNext2("");
                onDone();
              } catch (err) {
                toast.error(errMsg(err));
              }
            }}
          >
            <Input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="지금 비밀번호" />
            <Input type="password" value={next} onChange={(e) => setNext(e.target.value)} placeholder="새 비밀번호 (4자 이상)" />
            <Input type="password" value={next2} onChange={(e) => setNext2(e.target.value)} placeholder="새 비밀번호 확인" />
            <Button type="submit">비밀번호 변경</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
