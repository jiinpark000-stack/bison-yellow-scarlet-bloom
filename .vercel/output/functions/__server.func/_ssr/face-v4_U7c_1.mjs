//#region node_modules/.nitro/vite/services/ssr/assets/face-v4_U7c_1.js
var FACE_MATCH_MAX = .22;
function parseDescriptor(value) {
	if (!Array.isArray(value) || value.length !== 576) return null;
	const out = [];
	for (const item of value) {
		const n = typeof item === "number" ? item : Number(item);
		if (!Number.isFinite(n)) return null;
		out.push(n);
	}
	return out;
}
function descriptorFromImageData(data) {
	const px = data.data;
	const gray = [];
	for (let i = 0; i < px.length; i += 4) gray.push(.299 * px[i] + .587 * px[i + 1] + .114 * px[i + 2]);
	const mean = gray.reduce((sum, n) => sum + n, 0) / gray.length;
	const variance = gray.reduce((sum, n) => sum + (n - mean) ** 2, 0) / gray.length;
	const std = Math.sqrt(variance) || 1;
	const norm = gray.map((n) => (n - mean) / std);
	const mag = Math.sqrt(norm.reduce((sum, n) => sum + n * n, 0)) || 1;
	return norm.map((n) => n / mag);
}
function faceDistance(a, b) {
	if (a.length !== b.length) return 1;
	let dot = 0;
	for (let i = 0; i < a.length; i += 1) dot += a[i] * b[i];
	return 1 - dot;
}
async function faceBox(video) {
	const w = video.videoWidth || 320;
	const h = video.videoHeight || 240;
	const Fallback = new DOMRect(w * .22, h * .12, w * .56, h * .76);
	const Detector = window.FaceDetector;
	if (!Detector) return Fallback;
	try {
		const box = (await new Detector({
			fastMode: true,
			maxDetectedFaces: 1
		}).detect(video))[0]?.boundingBox;
		if (!box || box.width < 40 || box.height < 40) return Fallback;
		return new DOMRect(box.x, box.y, box.width, box.height);
	} catch {
		return Fallback;
	}
}
async function captureFaceDescriptor(video) {
	if (video.readyState < 2) throw new Error("카메라가 아직 준비되지 않았어요.");
	const box = await faceBox(video);
	const canvas = document.createElement("canvas");
	canvas.width = 24;
	canvas.height = 24;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("얼굴을 담을 수 없어요.");
	ctx.drawImage(video, box.x, box.y, box.width, box.height, 0, 0, 24, 24);
	return descriptorFromImageData(ctx.getImageData(0, 0, 24, 24));
}
//#endregion
export { parseDescriptor as i, captureFaceDescriptor as n, faceDistance as r, FACE_MATCH_MAX as t };
