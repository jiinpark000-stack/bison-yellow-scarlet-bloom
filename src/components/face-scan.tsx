import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { captureFaceSamples, packSamples } from "@/lib/face";

export function FaceScan({
  mode,
  busy,
  onCapture,
  onCancel,
}: {
  mode: "register" | "unlock";
  busy?: boolean;
  onCapture: (descriptor: number[] | number[][]) => void;
  onCancel: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState("");
  const [working, setWorking] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let dead = false;
    void (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 720 },
            height: { ideal: 720 },
            frameRate: { ideal: 24 },
          },
          audio: false,
        });
        if (dead) {
          for (const track of stream.getTracks()) track.stop();
          return;
        }
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        if (video.readyState < 2) {
          await new Promise<void>((resolve) => {
            video.onloadeddata = () => resolve();
          });
        }
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

  return (
    <div className="space-y-3">
      <div className="relative mx-auto aspect-square w-full max-w-xs overflow-hidden rounded-xl bg-bg-sunken">
        <video ref={videoRef} className="size-full scale-x-[-1] object-cover" playsInline muted autoPlay />
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="h-[72%] w-[58%] rounded-full border-2 border-primary" />
        </div>
      </div>
      <p className="text-center text-sm text-muted">
        {err ||
          (working
            ? "얼굴을 여러 장 찍고 있어요. 조금만 가만히…"
            : mode === "register"
              ? "타원 안에 얼굴만 가득 채워 주세요. 뒤 배경은 보지 않아요."
              : "타원 안에 얼굴만 맞추면 배경이 달라도 열어요.")}
      </p>
      <div className="flex justify-center gap-2">
        <Button variant="outline" type="button" onClick={onCancel}>
          닫기
        </Button>
        <Button
          type="button"
          disabled={!ready || busy || working || Boolean(err)}
          onClick={async () => {
            const video = videoRef.current;
            if (!video) return;
            setWorking(true);
            setErr("");
            try {
              const samples = await captureFaceSamples(video, 4);
              onCapture(packSamples(samples));
            } catch (e) {
              setErr(e instanceof Error ? e.message : "얼굴을 담지 못했어요.");
            } finally {
              setWorking(false);
            }
          }}
        >
          {working ? "확인 중…" : mode === "register" ? "이 얼굴로 등록" : "이 얼굴로 열기"}
        </Button>
      </div>
    </div>
  );
}
