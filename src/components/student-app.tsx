import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowRightLeft,
  BookOpen,
  CalendarDays,
  Cookie,
  HeartHandshake,
  Home,
  Landmark,
  LogOut,
  Minus,
  PiggyBank,
  Plus,
  Search,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { BioPanel } from "@/components/bio-panel";
import { Sparkline } from "@/components/sparkline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { buyStockFn, getFeaturedQuotes, getStockFn, searchStocksFn, sellStockFn } from "@/lib/fn/market";
import { listProductsFn, myOrdersFn, placeOrderFn } from "@/lib/fn/shop";
import { logoutFn } from "@/lib/fn/session";
import { cancelJoinFn, joinEventFn, studentEventsFn } from "@/lib/fn/events";
import { donateFn, getLedger, getStudentHome, moveSavingsFn, payTaxFn, transferFn } from "@/lib/fn/student";
import { clearToken, getToken } from "@/lib/session-client";
import type { Quote } from "@/lib/types";
import {
  changeTone,
  eventStatusLabel,
  formatDay,
  formatPct,
  formatWhen,
  formatWon,
  interestOn,
  kindLabel,
  paidThisWeek,
  taxAppliesLabel,
  taxRuleLabel,
} from "@/lib/utils";

function errMsg(e: unknown) {
  return e instanceof Error ? e.message : "잠시 후 다시 시도해 주세요.";
}

type Tab = "home" | "market" | "shop" | "events" | "tax" | "book";

export function StudentApp() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [token, setTokenState] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("home");

  useEffect(() => {
    const t = getToken("student");
    if (!t) {
      void navigate({ to: "/" });
      return;
    }
    setTokenState(t);
  }, [navigate]);

  const home = useQuery({
    queryKey: ["student-home", token],
    queryFn: () => getStudentHome({ data: { token: token ?? "" } }),
    enabled: Boolean(token),
    refetchInterval: 12_000,
    refetchOnWindowFocus: true,
    placeholderData: (prev) => prev,
  });

  useEffect(() => {
    if (!home.isError || !token) return;
    const msg = home.error instanceof Error ? home.error.message : "";
    if (msg.includes("로그인해")) {
      clearToken("student");
      void navigate({ to: "/" });
    }
  }, [home.isError, home.error, token, navigate]);

  if (!token) {
    return <div className="min-h-dvh bg-bg" />;
  }

  const data = home.data;

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col pb-24">
      <header className="flex items-center justify-between px-4 py-4">
        <div>
          <p className="text-xs font-medium tracking-wide text-primary">{data?.className ?? "6학년 5반"}</p>
          <h1 className="font-display text-xl font-semibold">{data?.student.name ?? "통장"}</h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            await logoutFn({ data: { token } });
            clearToken("student");
            void navigate({ to: "/" });
          }}
        >
          <LogOut className="size-4" />
          나가기
        </Button>
      </header>

      <div className="flex-1 px-4">
        {tab === "home" && (
          <HomePanel
            token={token}
            data={data}
            loading={home.isLoading}
            onDone={() => void qc.invalidateQueries()}
            onOpenMarket={() => setTab("market")}
            onOpenTax={() => setTab("tax")}
            onOpenEvents={() => setTab("events")}
          />
        )}
        {tab === "market" && (
          <MarketPanel
            token={token}
            cash={data?.student.cash ?? 0}
            holdings={data?.holdings ?? []}
            onDone={() => void qc.invalidateQueries()}
          />
        )}
        {tab === "shop" && (
          <ShopPanel token={token} cash={data?.student.cash ?? 0} onDone={() => void qc.invalidateQueries()} />
        )}
        {tab === "events" && (
          <EventPanel
            token={token}
            cash={data?.student.cash ?? 0}
            onDone={() => void qc.invalidateQueries()}
          />
        )}
        {tab === "tax" && (
          <TaxPanel
            token={token}
            cash={data?.student.cash ?? 0}
            taxDue={data?.student.taxDue ?? 0}
            kinds={data?.taxKinds ?? []}
            bills={data?.taxBills ?? []}
            onDone={() => void qc.invalidateQueries()}
          />
        )}
        {tab === "book" && <BookPanel token={token} />}
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <div className="mx-auto grid max-w-3xl grid-cols-6">
          {(
            [
              ["home", "통장", Home],
              ["market", "주식", TrendingUp],
              ["shop", "간식", Cookie],
              ["events", "행사", CalendarDays],
              ["tax", "세금", Landmark],
              ["book", "기록", BookOpen],
            ] as const
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 text-xs font-medium ${
                tab === id ? "text-primary" : "text-muted"
              }`}
            >
              <Icon className="size-5" />
              {label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

function HomePanel({
  token,
  data,
  loading,
  onDone,
  onOpenMarket,
  onOpenTax,
  onOpenEvents,
}: {
  token: string;
  data: Awaited<ReturnType<typeof getStudentHome>> | undefined;
  loading: boolean;
  onDone: () => void;
  onOpenMarket: () => void;
  onOpenTax: () => void;
  onOpenEvents: () => void;
}) {
  const [saveAmt, setSaveAmt] = useState("");
  const [donateAmt, setDonateAmt] = useState("");
  const [toId, setToId] = useState<number | null>(null);
  const [xferAmt, setXferAmt] = useState("");
  const move = useMutation({
    mutationFn: (amount: number) => moveSavingsFn({ data: { token, amount } }),
    onSuccess: (_res, amount) => {
      toast.success(amount > 0 ? `${formatWon(amount)} 저축했어요.` : `${formatWon(-amount)} 찾았어요.`);
      setSaveAmt("");
      onDone();
    },
    onError: (e) => toast.error(errMsg(e)),
  });
  const give = useMutation({
    mutationFn: (amount: number) => donateFn({ data: { token, amount } }),
    onSuccess: (res) => {
      toast.success(
        res.isTop
          ? `${formatWon(res.amount)} 기부했어요. 지금 기부왕이에요!`
          : `${formatWon(res.amount)} 기부했어요. 학급 금고로 들어갔어요.`,
      );
      setDonateAmt("");
      onDone();
    },
    onError: (e) => toast.error(errMsg(e)),
  });
  const send = useMutation({
    mutationFn: (payload: { toStudentId: number; amount: number }) =>
      transferFn({ data: { token, ...payload } }),
    onSuccess: (res) => {
      toast.success(`${res.toName}에게 ${formatWon(res.amount)} 보냈어요.`);
      setXferAmt("");
      onDone();
    },
    onError: (e) => toast.error(errMsg(e)),
  });

  if (loading || !data) {
    return <div className="h-48 animate-pulse rounded-xl bg-bg-sunken" />;
  }
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
  const canSend =
    toId != null && Number.isFinite(sendAmt) && sendAmt > 0 && sendAmt <= data.student.cash;
  const top = data.donors[0] ?? null;
  const topTied = top ? data.donors.filter((d) => d.donated === top.donated) : [];

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="passbook-grid px-5 py-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">쓸 수 있는 돈</p>
            <Wallet className="size-4 text-primary" />
          </div>
          <p className="mt-2 font-display text-4xl font-semibold tabular-nums tracking-tight">
            {formatWon(data.student.cash, digits)}
          </p>
          <p className="mt-2 text-sm text-muted">
            저축 {formatWon(savings, 0)} · 주식 {formatWon(data.holdingsValue, 0)} · 총자산 {formatWon(data.total, 0)}
          </p>
        </div>
        <CardContent className="flex flex-wrap items-center gap-2 p-4">
          <Badge>{data.student.jobName ?? "직업 없음"}</Badge>
          {data.student.salary > 0 ? (
            <Badge variant={paidWeek ? "outline" : "warn"}>
              {paidWeek ? "이번 주 월급 입금" : `일주일 월급 ${formatWon(data.student.salary)}`}
            </Badge>
          ) : null}
          {data.classSize > 0 ? (
            <Badge variant="outline">
              반 순위 {data.rank}/{data.classSize}
            </Badge>
          ) : null}
          {data.student.taxDue > 0 ? (
            <button type="button" onClick={onOpenTax}>
              <Badge variant="warn">낼 세금 {formatWon(data.student.taxDue)}</Badge>
            </button>
          ) : (
            <Badge variant="outline">세금 완납</Badge>
          )}
          {(data.openEventCount ?? 0) > 0 ? (
            <button type="button" onClick={onOpenEvents}>
              <Badge variant="warn">개최 중 행사 {data.openEventCount}개</Badge>
            </button>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <PiggyBank className="size-4 text-primary" />
                <h2 className="font-display font-semibold">저축</h2>
              </div>
              <p className="mt-2 font-display text-3xl font-semibold tabular-nums tracking-tight">{formatWon(savings)}</p>
              <p className="mt-1 text-sm text-muted">
                일주일 이자 {rate}%
                {savings > 0
                  ? interestPaid
                    ? " · 이번 주 이자 입금"
                    : expected > 0
                      ? ` · 이번 주 예상 ${formatWon(expected)}`
                      : ""
                  : " · 넣어 두면 이자가 붙어요"}
              </p>
            </div>
            {interestPaid && savings > 0 ? <Badge variant="outline">이번 주 이자</Badge> : null}
          </div>
          <form
            className="grid gap-2 sm:grid-cols-[1fr_auto_auto]"
            onSubmit={(e) => {
              e.preventDefault();
              if (!canDeposit) {
                toast.error("넣을 금액을 확인해 주세요.");
                return;
              }
              move.mutate(parsed);
            }}
          >
            <Input
              id="save-amount"
              type="number"
              min={1}
              inputMode="numeric"
              value={saveAmt}
              onChange={(e) => setSaveAmt(e.target.value)}
              placeholder="금액"
            />
            <Button type="submit" disabled={move.isPending || !canDeposit}>
              넣기
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={move.isPending || !canWithdraw}
              onClick={() => {
                if (!canWithdraw) {
                  toast.error("찾을 금액을 확인해 주세요.");
                  return;
                }
                move.mutate(-parsed);
              }}
            >
              찾기
            </Button>
          </form>
          <div className="flex flex-wrap gap-2">
            {[50, 100, 200].map((n) => (
              <Button key={n} type="button" size="sm" variant="ghost" onClick={() => setSaveAmt(String(n))}>
                {formatWon(n)}
              </Button>
            ))}
            {data.student.cash > 0 ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setSaveAmt(String(Math.floor(data.student.cash)))}
              >
                쓸 돈 전부
              </Button>
            ) : null}
            {savings > 0 ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setSaveAmt(String(Math.floor(savings)))}
              >
                저축 전부
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="size-4 text-primary" />
            <h2 className="font-display font-semibold">계좌이체</h2>
          </div>
          <p className="text-sm text-muted">쓸 돈에서 반 친구 통장으로 바로 보내요.</p>
          {(data.classmates ?? []).length === 0 ? (
            <p className="text-sm text-muted">이체할 친구가 없어요. 선생님이 이름을 등록하면 보낼 수 있어요.</p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2">
                {(data.classmates ?? []).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setToId(c.id)}
                    className={`h-11 rounded-lg border px-2 text-sm font-medium transition-colors ${
                      toId === c.id
                        ? "border-primary bg-surface text-fg"
                        : "border-border bg-surface-2 text-muted"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
              <form
                className="grid gap-2 sm:grid-cols-[1fr_auto]"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (toId == null) {
                    toast.error("받는 친구를 골라 주세요.");
                    return;
                  }
                  if (!canSend) {
                    toast.error("보낼 금액을 확인해 주세요.");
                    return;
                  }
                  send.mutate({ toStudentId: toId, amount: sendAmt });
                }}
              >
                <Input
                  id="xfer-amount"
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={xferAmt}
                  onChange={(e) => setXferAmt(e.target.value)}
                  placeholder="보낼 금액"
                />
                <Button type="submit" disabled={send.isPending || !canSend}>
                  보내기
                </Button>
              </form>
              <div className="flex flex-wrap gap-2">
                {[10, 50, 100].map((n) => (
                  <Button key={n} type="button" size="sm" variant="ghost" onClick={() => setXferAmt(String(n))}>
                    {formatWon(n)}
                  </Button>
                ))}
                {data.student.cash > 0 ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setXferAmt(String(Math.floor(data.student.cash)))}
                  >
                    쓸 돈 전부
                  </Button>
                ) : null}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <HeartHandshake className="size-4 text-primary" />
                <h2 className="font-display font-semibold">기부 코너</h2>
              </div>
              <p className="mt-2 font-display text-3xl font-semibold tabular-nums tracking-tight">
                {formatWon(data.myDonated)}
              </p>
              <p className="mt-1 text-sm text-muted">내 기부 · 학급 창고로 들어가요</p>
            </div>
            {top && top.studentId === data.student.id ? <Badge>기부왕</Badge> : null}
          </div>
          {top ? (
            <div className="rounded-lg bg-bg-sunken px-3 py-2 text-sm">
              <p className="font-medium">
                기부왕{" "}
                {topTied.map((d) => d.name).join(", ")} · {formatWon(top.donated)}
              </p>
              <div className="mt-2 space-y-1 text-muted">
                {data.donors.slice(0, 5).map((d, i) => (
                  <div key={d.studentId} className="flex items-center justify-between">
                    <span>
                      {i + 1}등 {d.name}
                      {d.studentId === data.student.id ? " (나)" : ""}
                    </span>
                    <span className="tabular-nums">{formatWon(d.donated)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted">아직 기부한 친구가 없어요. 첫 기부왕이 되어 보세요.</p>
          )}
          <form
            className="grid gap-2 sm:grid-cols-[1fr_auto]"
            onSubmit={(e) => {
              e.preventDefault();
              if (!canDonate) {
                toast.error("기부할 금액을 확인해 주세요.");
                return;
              }
              give.mutate(gift);
            }}
          >
            <Input
              id="donate-amount"
              type="number"
              min={1}
              inputMode="numeric"
              value={donateAmt}
              onChange={(e) => setDonateAmt(e.target.value)}
              placeholder="기부할 금액"
            />
            <Button type="submit" disabled={give.isPending || !canDonate}>
              기부하기
            </Button>
          </form>
          <div className="flex flex-wrap gap-2">
            {[10, 50, 100].map((n) => (
              <Button key={n} type="button" size="sm" variant="ghost" onClick={() => setDonateAmt(String(n))}>
                {formatWon(n)}
              </Button>
            ))}
            {data.student.cash > 0 ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setDonateAmt(String(Math.floor(data.student.cash)))}
              >
                쓸 돈 전부
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <BioPanel token={token} faces={data.faces ?? []} prints={data.prints ?? []} onDone={onDone} />

      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">내 주식</h2>
        <Button variant="ghost" size="sm" onClick={onOpenMarket}>
          시장 보기
        </Button>
      </div>
      {data.holdings.length === 0 ? (
        <Card>
          <CardContent className="p-5 text-sm text-muted">
            아직 산 주식이 없어요. 시장에서 실제 등락률 그대로, 가격만 낮춘 모이 주식을 살 수 있어요.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {data.holdings.map((h) => (
            <Card key={h.symbol}>
              <CardContent className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium">{h.name}</p>
                  <p className="text-xs text-muted">
                    {h.qty}주 · 평균 {formatWon(h.avgCost, 2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="tabular-nums font-medium">{formatWon(h.value, 0)}</p>
                  <p className={`text-xs tabular-nums ${changeTone(h.pnlPercent)}`}>{formatPct(h.pnlPercent)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function MarketPanel({
  token,
  cash,
  holdings,
  onDone,
}: {
  token: string;
  cash: number;
  holdings: { symbol: string; qty: number }[];
  onDone: () => void;
}) {
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<string | null>(null);
  const [board, setBoard] = useState<"all" | "kr" | "us">("all");
  const featured = useQuery({
    queryKey: ["featured"],
    queryFn: () => getFeaturedQuotes(),
    refetchInterval: 8_000,
    staleTime: 4_000,
    refetchOnWindowFocus: true,
    placeholderData: (prev) => prev,
  });
  const search = useQuery({
    queryKey: ["search", q],
    queryFn: () => searchStocksFn({ data: { q } }),
    enabled: q.trim().length >= 1,
    refetchInterval: 10_000,
    staleTime: 4_000,
    refetchOnWindowFocus: true,
    placeholderData: (prev) => prev,
  });
  const quotes = featured.data ?? [];
  const shown = quotes.filter((quote) => {
    const kr = quote.symbol.includes(".KS") || quote.symbol.includes(".KQ");
    if (board === "kr") return kr;
    if (board === "us") return !kr;
    return true;
  });
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 text-sm text-muted">
          실제 주식 등락률을 그대로 쓰고, 사는 가격만 1/1,000로 줄였어요. 잔액 {formatWon(cash)}.
        </CardContent>
      </Card>
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="종목 이름 또는 티커 (삼성전자, AAPL)"
          className="pl-10"
        />
      </div>
      {q.trim() ? (
        <div className="space-y-2">
          {(search.data ?? []).map((row) => (
            <button
              key={row.symbol}
              type="button"
              onClick={() => setPicked(row.symbol)}
              className="flex w-full items-center justify-between rounded-lg border border-border bg-surface px-4 py-3 text-left"
            >
              <span>
                <span className="block font-medium">{row.name}</span>
                <span className="text-xs text-muted">{row.symbol}</span>
              </span>
              <span className="text-right">
                <span className="block tabular-nums">
                  {row.gamePrice != null ? formatWon(row.gamePrice, 2) : "—"}
                </span>
                {row.changePercent != null ? (
                  <span className={`text-xs tabular-nums ${changeTone(row.changePercent)}`}>
                    {formatPct(row.changePercent)}
                  </span>
                ) : null}
              </span>
            </button>
          ))}
          {search.isFetched && (search.data?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted">찾는 종목이 없어요. 티커를 정확히 입력해 보세요.</p>
          ) : null}
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["all", "전체"],
                  ["kr", "한국"],
                  ["us", "미국"],
                ] as const
              ).map(([id, label]) => (
                <Button
                  key={id}
                  type="button"
                  size="sm"
                  variant={board === id ? "default" : "outline"}
                  onClick={() => setBoard(id)}
                >
                  {label}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted">{shown.length}개</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {shown.map((quote) => (
              <QuoteCard key={quote.symbol} quote={quote} onOpen={() => setPicked(quote.symbol)} />
            ))}
          </div>
        </>
      )}
      <StockDialog
        symbol={picked}
        cash={cash}
        held={holdings.find((h) => h.symbol === picked)?.qty ?? 0}
        token={token}
        onClose={() => setPicked(null)}
        onDone={onDone}
      />
    </div>
  );
}

function QuoteCard({ quote, onOpen }: { quote: Quote; onOpen: () => void }) {
  const rising = quote.changePercent >= 0;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="rounded-xl border border-border bg-surface p-4 text-left transition-colors hover:border-primary"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium">{quote.name}</p>
          <p className="text-xs text-muted">{quote.symbol}</p>
        </div>
        <p className={`text-sm tabular-nums font-medium ${changeTone(quote.changePercent)}`}>
          {formatPct(quote.changePercent)}
        </p>
      </div>
      <Sparkline points={quote.history.map((h) => h.game)} rising={rising} className="mt-2" />
      <p className="mt-1 font-display text-xl tabular-nums">{formatWon(quote.gamePrice, 2)}</p>
    </button>
  );
}

function StockDialog({
  symbol,
  cash,
  held,
  token,
  onClose,
  onDone,
}: {
  symbol: string | null;
  cash: number;
  held: number;
  token: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [qty, setQty] = useState(1);
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const detail = useQuery({
    queryKey: ["stock", symbol],
    queryFn: () => getStockFn({ data: { symbol: symbol ?? "" } }),
    enabled: Boolean(symbol),
    refetchInterval: 8_000,
    staleTime: 4_000,
    refetchOnWindowFocus: true,
    placeholderData: (prev) => prev,
  });
  const buy = useMutation({
    mutationFn: () => buyStockFn({ data: { token, symbol: symbol ?? "", qty } }),
    onSuccess: (res) => {
      toast.success(`${qty}주 샀어요. ${formatWon(res.cost, 2)}`);
      onDone();
      onClose();
    },
    onError: (e) => toast.error(errMsg(e)),
  });
  const sell = useMutation({
    mutationFn: () => sellStockFn({ data: { token, symbol: symbol ?? "", qty } }),
    onSuccess: (res) => {
      toast.success(
        res.tax
          ? `${qty}주 팔았어요. ${formatWon(res.proceeds, 2)} · 양도세 ${formatWon(res.tax)} 고지`
          : `${qty}주 팔았어요. ${formatWon(res.proceeds, 2)}`,
      );
      onDone();
      onClose();
    },
    onError: (e) => toast.error(errMsg(e)),
  });
  const quote = detail.data;
  const total = quote ? quote.gamePrice * qty : 0;
  const maxBuy = quote ? Math.floor(cash / quote.gamePrice) : 0;
  return (
    <Dialog
      open={Boolean(symbol)}
      onOpenChange={(open) => {
        if (!open) {
          setQty(1);
          setSide("buy");
          onClose();
        }
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        {quote ? (
          <>
            <DialogHeader>
              <DialogTitle>{quote.name}</DialogTitle>
              <DialogDescription>
                {quote.symbol} · 실제 {quote.realPrice.toLocaleString("ko-KR")} {quote.currency} · 모이 가격은 1/1,000
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-end justify-between">
              <p className="font-display text-3xl tabular-nums">{formatWon(quote.gamePrice, 2)}</p>
              <p className={`tabular-nums font-medium ${changeTone(quote.changePercent)}`}>
                {formatPct(quote.changePercent)}
              </p>
            </div>
            <Sparkline points={quote.history.map((h) => h.game)} rising={quote.changePercent >= 0} className="h-16" />
            <div className="grid grid-cols-2 gap-2">
              <Button variant={side === "buy" ? "default" : "outline"} onClick={() => setSide("buy")}>
                사기
              </Button>
              <Button variant={side === "sell" ? "default" : "outline"} onClick={() => setSide("sell")}>
                팔기
              </Button>
            </div>
            <div className="flex items-center justify-between rounded-md bg-bg-sunken px-2 py-1">
              <Button variant="ghost" size="icon" onClick={() => setQty((n) => Math.max(1, n - 1))}>
                <Minus />
              </Button>
              <span className="tabular-nums text-lg font-medium">{qty}주</span>
              <Button variant="ghost" size="icon" onClick={() => setQty((n) => n + 1)}>
                <Plus />
              </Button>
            </div>
            <p className="text-sm text-muted">
              {side === "buy"
                ? `결제 ${formatWon(total, 2)} · 살 수 있는 최대 ${maxBuy}주`
                : `받을 돈 ${formatWon(total, 2)} · 보유 ${held}주`}
            </p>
            <Button
              className="w-full"
              disabled={buy.isPending || sell.isPending || (side === "sell" && held < qty)}
              onClick={() => (side === "buy" ? buy.mutate() : sell.mutate())}
            >
              {side === "buy" ? "모이 가격으로 사기" : "지금 시세로 팔기"}
            </Button>
          </>
        ) : (
          <p className="text-sm text-muted">시세를 불러오는 중…</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ShopPanel({ token, cash, onDone }: { token: string; cash: number; onDone: () => void }) {
  const products = useQuery({
    queryKey: ["products"],
    queryFn: () => listProductsFn(),
  });
  const orders = useQuery({
    queryKey: ["my-orders", token],
    queryFn: () => myOrdersFn({ data: { token } }),
  });
  const [qtyById, setQtyById] = useState<Record<number, number>>({});
  const buy = useMutation({
    mutationFn: (input: { productId: number; qty: number }) => placeOrderFn({ data: { token, ...input } }),
    onSuccess: (res, vars) => {
      toast.success(
        res.tax
          ? `주문했어요. 간식세 ${formatWon(res.tax)}가 고지됐어요. 학교에서 받으면 됩니다.`
          : "주문했어요. 학교에서 선생님께 받으면 됩니다.",
      );
      setQtyById((m) => ({ ...m, [vars.productId]: 1 }));
      onDone();
      void orders.refetch();
    },
    onError: (e) => toast.error(errMsg(e)),
  });
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 text-sm text-muted">
          여기서 먼저 결제하고, 간식은 학교에서 받아요. 잔액 {formatWon(cash)}.
        </CardContent>
      </Card>
      <div className="grid gap-2 sm:grid-cols-2">
        {(products.data ?? []).map((p) => {
          const qty = qtyById[p.id] ?? 1;
          return (
            <Card key={p.id}>
              <CardContent className="space-y-3 p-4">
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-sm text-muted">{p.description}</p>
                </div>
                <p className="font-display text-xl tabular-nums">{formatWon(p.price)}</p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-10"
                    onClick={() => setQtyById((m) => ({ ...m, [p.id]: Math.max(1, qty - 1) }))}
                  >
                    <Minus />
                  </Button>
                  <span className="w-8 text-center tabular-nums">{qty}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-10"
                    onClick={() => setQtyById((m) => ({ ...m, [p.id]: qty + 1 }))}
                  >
                    <Plus />
                  </Button>
                  <Button
                    className="ml-auto"
                    disabled={buy.isPending}
                    onClick={() => buy.mutate({ productId: p.id, qty })}
                  >
                    주문
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <h2 className="font-display text-lg font-semibold">내 주문</h2>
      {(orders.data ?? []).length === 0 ? (
        <p className="text-sm text-muted">아직 주문이 없어요.</p>
      ) : (
        <div className="space-y-2">
          {(orders.data ?? []).map((o) => (
            <Card key={o.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">
                    {o.productName} × {o.qty}
                  </p>
                  <p className="text-xs text-muted">{formatWhen(o.createdAt)}</p>
                </div>
                <Badge variant={o.status === "waiting" ? "warn" : o.status === "done" ? "default" : "outline"}>
                  {o.status === "waiting" ? "학교 수령 대기" : o.status === "done" ? "수령 완료" : "취소"}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function EventPanel({ token, cash, onDone }: { token: string; cash: number; onDone: () => void }) {
  const events = useQuery({
    queryKey: ["student-events", token],
    queryFn: () => studentEventsFn({ data: { token } }),
  });
  const join = useMutation({
    mutationFn: (eventId: number) => joinEventFn({ data: { token, eventId } }),
    onSuccess: (res) => {
      toast.success(res.paid > 0 ? `참가했어요. 참가비 ${formatWon(res.paid)}` : "참가했어요.");
      onDone();
      void events.refetch();
    },
    onError: (e) => toast.error(errMsg(e)),
  });
  const cancel = useMutation({
    mutationFn: (eventId: number) => cancelJoinFn({ data: { token, eventId } }),
    onSuccess: (res) => {
      toast.success(res.refunded > 0 ? `취소하고 ${formatWon(res.refunded)} 돌려받았어요.` : "참가를 취소했어요.");
      onDone();
      void events.refetch();
    },
    onError: (e) => toast.error(errMsg(e)),
  });
  const list = events.data ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 text-sm text-muted">
          선생님이 개최한 행사에 참가해요. 참가비는 학급 창고로 들어갑니다. 잔액 {formatWon(cash)}.
        </CardContent>
      </Card>
      {list.length === 0 ? <p className="text-sm text-muted">지금은 열린 행사가 없어요.</p> : null}
      {list.map((ev) => (
        <Card key={ev.id}>
          <CardContent className="space-y-3 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{ev.name}</p>
                  <Badge variant={ev.status === "open" ? "warn" : "outline"}>{eventStatusLabel(ev.status)}</Badge>
                </div>
                <p className="text-sm text-muted">
                  {ev.eventOn ? `${formatDay(ev.eventOn)} · ` : ""}
                  참가비 {formatWon(ev.fee)}
                  {ev.reward > 0 ? ` · 보상 ${formatWon(ev.reward)}` : ""}
                </p>
                {ev.description ? <p className="mt-1 text-sm text-muted">{ev.description}</p> : null}
              </div>
            </div>
            {ev.joined ? (
              <div className="flex flex-wrap items-center gap-2">
                <Badge>참가함{ev.rewarded > 0 ? ` · 보상 ${formatWon(ev.rewarded)}` : ""}</Badge>
                {ev.status === "open" && ev.rewarded <= 0 ? (
                  <Button variant="outline" size="sm" disabled={cancel.isPending} onClick={() => cancel.mutate(ev.id)}>
                    참가 취소
                  </Button>
                ) : null}
              </div>
            ) : ev.status === "open" ? (
              <Button disabled={join.isPending} onClick={() => join.mutate(ev.id)}>
                {ev.fee > 0 ? `${formatWon(ev.fee)} 내고 참가` : "참가하기"}
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TaxPanel({
  token,
  cash,
  taxDue,
  kinds,
  bills,
  onDone,
}: {
  token: string;
  cash: number;
  taxDue: number;
  kinds: { name: string; appliesOn: string; charge: string; rate: number; amount: number }[];
  bills: { id: number; kindName: string; due: number }[];
  onDone: () => void;
}) {
  const pay = useMutation({
    mutationFn: () => payTaxFn({ data: { token } }),
    onSuccess: (res) => {
      toast.success(`${formatWon(res.paid)} 세금을 냈어요.`);
      onDone();
    },
    onError: (e) => toast.error(errMsg(e)),
  });
  const canPay = taxDue > 0 && cash > 0;
  const grouped = useMemo(() => {
    const map = new Map<string, number>();
    for (const bill of bills) {
      map.set(bill.kindName, (map.get(bill.kindName) ?? 0) + bill.due);
    }
    return [...map.entries()];
  }, [bills]);

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="px-5 py-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">내가 낼 세금</p>
            <Landmark className="size-4 text-primary" />
          </div>
          <p className="mt-2 font-display text-4xl font-semibold tabular-nums tracking-tight">{formatWon(taxDue)}</p>
          <p className="mt-2 text-sm text-muted">통장 {formatWon(cash)} · 낸 세금은 학급 창고로 들어가요</p>
        </div>
        {grouped.length > 0 ? (
          <div className="space-y-2 border-t border-border px-5 py-4">
            {grouped.map(([name, due]) => (
              <div key={name} className="flex items-center justify-between text-sm">
                <span>{name}</span>
                <span className="tabular-nums">{formatWon(due)}</span>
              </div>
            ))}
          </div>
        ) : null}
        <CardContent className="p-4">
          <Button className="w-full" disabled={!canPay || pay.isPending} onClick={() => pay.mutate()}>
            {taxDue <= 0 ? "낼 세금이 없어요" : cash <= 0 ? "잔액이 부족해요" : "세금 내기"}
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-2 p-4 text-sm text-muted">
          <p className="font-medium text-fg">우리 반 세금</p>
          {kinds.length === 0 ? <p>선생님이 아직 세금을 정하지 않았어요.</p> : null}
          {kinds.map((kind) => (
            <p key={kind.name}>
              {kind.name} {taxRuleLabel(kind)} · {taxAppliesLabel(kind.appliesOn)}
            </p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function BookPanel({ token }: { token: string }) {
  const ledger = useQuery({
    queryKey: ["ledger", token],
    queryFn: () => getLedger({ data: { token } }),
  });
  const rows = useMemo(() => ledger.data ?? [], [ledger.data]);
  return (
    <div className="space-y-2">
      <h2 className="font-display text-lg font-semibold">통장 기록</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-muted">아직 기록이 없어요.</p>
      ) : (
        rows.map((row) => (
          <div
            key={row.id}
            className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium">{kindLabel(row.kind)}</p>
              <p className="text-xs text-muted">{row.memo}</p>
            </div>
            <div className="text-right">
              <p className={`tabular-nums font-medium ${row.amount >= 0 ? "text-primary" : "text-fg"}`}>
                {row.amount >= 0 ? "+" : ""}
                {formatWon(row.amount, 0)}
              </p>
              <p className="text-xs text-muted">{formatWhen(row.createdAt)}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
