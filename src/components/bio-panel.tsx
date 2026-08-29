import { useState } from "react";
import { Fingerprint, ScanFace } from "lucide-react";
import { toast } from "sonner";
import { FaceScan } from "@/components/face-scan";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  registerStudentFaceFn,
  removeStudentFaceFn,
  removeStudentPrintFn,
} from "@/lib/fn/session";
import { registerStudentFingerprint } from "@/lib/webauthn-client";

function errMsg(e: unknown) {
  return e instanceof Error ? e.message : "잠시 후 다시 시도해 주세요.";
}

export function BioPanel({
  token,
  studentId,
  faces,
  prints,
  onDone,
}: {
  token: string;
  studentId?: number;
  faces: { id: number; label: string }[];
  prints: { id: number; label: string }[];
  onDone: () => void;
}) {
  const [scan, setScan] = useState(false);
  const [faceLabel, setFaceLabel] = useState("");
  const [printLabel, setPrintLabel] = useState("");

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <h2 className="font-display font-semibold">통장 열기 방법</h2>
        <p className="text-sm text-muted">
          선생님 창구와 같이 얼굴·지문·비밀번호로 열 수 있어요. 얼굴은 타원 안만 보고 뒤 배경은 보지 않습니다. 지문은
          휴대폰·태블릿에서 넣고, 미리보기에서 막히면 새 창이 열립니다. 이 얼굴·지문으로는 선생님 창구를 열 수 없어요.
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
                      await removeStudentFaceFn({ data: { token, studentId, id: face.id } });
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
              placeholder="이름 (선택)"
            />
            <Button type="button" variant="outline" disabled={faces.length >= 8} onClick={() => setScan(true)}>
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
                      await removeStudentPrintFn({ data: { token, studentId, id: print.id } });
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
                  await registerStudentFingerprint(token, printLabel.trim() || undefined, studentId);
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
            onCancel={() => setScan(false)}
            onCapture={async (descriptor) => {
              try {
                await registerStudentFaceFn({
                  data: { token, studentId, descriptor, label: faceLabel.trim() || undefined },
                });
                setScan(false);
                setFaceLabel("");
                toast.success("얼굴을 추가했어요.");
                onDone();
              } catch (err) {
                toast.error(errMsg(err));
              }
            }}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
