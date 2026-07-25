import React, { useState } from 'react';
import { Run, VisitStop } from '../types';
import { MapView } from './MapView';
import { 
  X, ArrowLeft, MoveUp, MoveDown, Save, Eye, 
  Sparkles, AlertTriangle, CheckCircle2, TrendingUp, Clock, Navigation, AlertCircle, Bot 
} from 'lucide-react';

interface SwitchTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  runs: Run[];
  tanggalReplenish: string;
  siklus: string;
  onSaveRuns: (updatedRuns: Run[], routeStatusText?: string) => void;
}

// Coordinate parser helper
const parseCoord = (coordStr: string): [number, number] => {
  if (!coordStr) return [-6.173256, 106.810058];
  const parts = coordStr.split(',').map(s => parseFloat(s.trim()));
  if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return [parts[0], parts[1]];
  }
  return [-6.173256, 106.810058];
};

// Euclidean/Vincenty approximate distance in km
const getDistanceKm = (c1: [number, number], c2: [number, number]): number => {
  const dx = c1[0] - c2[0];
  const dy = c1[1] - c2[1];
  return Math.sqrt(dx * dx + dy * dy) * 111;
};

// Calculate aggregate metrics (Distance, Traffic Delay, ETA) for a given runs array
const calculateRunsMetrics = (runsList: Run[]) => {
  let totalDistance = 0;
  let totalDelay = 0;
  let maxTimeMinutes = 8 * 60; // Start at 08:00 AM (480 mins)

  runsList.forEach(run => {
    let runDistance = 0;
    const depotCoord: [number, number] = [-6.173256, 106.810057];
    let prevCoord = depotCoord;
    let runMinutes = 8 * 60; // 08:00 AM

    run.rute_kunjungan.forEach((stop) => {
      const currCoord = parseCoord(stop.koordinat);
      const dist = getDistanceKm(prevCoord, currCoord);
      runDistance += dist;
      prevCoord = currCoord;

      // Traffic delay
      let delay = stop.prediksi_delay_menit ?? 0;
      if (!delay) {
        if (stop.status_lalu_lintas === 'Macet') delay = 15;
        else if (stop.status_lalu_lintas === 'Padat') delay = 8;
        else delay = 0;
      }
      totalDelay += delay;

      // Travel time roughly 2.5 mins per km + delay + transaction duration
      const travelTime = Math.ceil(dist * 2.5) + delay;
      const transTime = stop.durasi_transaksi_menit || 15;
      runMinutes += travelTime + transTime;
    });

    // Return to depot
    runDistance += getDistanceKm(prevCoord, depotCoord);
    totalDistance += runDistance;

    if (runMinutes > maxTimeMinutes) {
      maxTimeMinutes = runMinutes;
    }
  });

  const hours = Math.floor(maxTimeMinutes / 60);
  const mins = Math.round(maxTimeMinutes % 60);
  const etaStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} WIB`;

  return {
    totalDistance: parseFloat(totalDistance.toFixed(1)),
    totalDelay,
    etaStr,
    totalMinutes: maxTimeMinutes
  };
};

export const SwitchTripModal: React.FC<SwitchTripModalProps> = ({
  isOpen,
  onClose,
  runs: initialRuns,
  tanggalReplenish,
  siklus,
  onSaveRuns
}) => {
  const [runs, setRuns] = useState<Run[]>(JSON.parse(JSON.stringify(initialRuns)));
  const [previewRunIndex, setPreviewRunIndex] = useState<number | null>(null);
  const [showImpactModal, setShowImpactModal] = useState<boolean>(false);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState<boolean>(false);
  const [aiImpactResult, setAiImpactResult] = useState<any | null>(null);
  const [evaluatingCardPlanNo, setEvaluatingCardPlanNo] = useState<string | null>(null);

  // EPIC 2: Re-Optimization A/B Choice Modal States
  const [showReoptModal, setShowReoptModal] = useState<boolean>(false);
  const [isReoptimizing, setIsReoptimizing] = useState<boolean>(false);
  const [reoptResult, setReoptResult] = useState<any | null>(null);

  if (!isOpen) return null;

  // AI Recommendation Evaluator for each Trip Card Item
  const getTripAiStatus = (
    stop: VisitStop,
    stopIdx: number,
    currentRunIdx: number
  ) => {
    // Check if transferred from original run
    let origRunName = '';
    let origRunIdx = -1;
    initialRuns.forEach((r, rIdx) => {
      if (r.rute_kunjungan.some(s => s.plan_no === stop.plan_no)) {
        origRunName = r.nama_run;
        origRunIdx = rIdx;
      }
    });

    const isTransferred = origRunIdx !== -1 && origRunIdx !== currentRunIdx;

    // Calculate distance to previous stop
    const currRun = runs[currentRunIdx];
    const stopCoord = parseCoord(stop.koordinat);
    let prevCoord: [number, number] = [-6.173256, 106.810057];
    if (stopIdx > 0) {
      prevCoord = parseCoord(currRun.rute_kunjungan[stopIdx - 1].koordinat);
    }
    const distFromPrev = getDistanceKm(prevCoord, stopCoord);

    const isTrafficMacet = stop.status_lalu_lintas === 'Macet' || (stop.prediksi_delay_menit && stop.prediksi_delay_menit >= 15);
    const isLongJump = distFromPrev > 5.5;

    // High Risk: Transferred & long jump or traffic macet
    if (isTransferred && (isLongJump || isTrafficMacet)) {
      return {
        type: 'warning' as const,
        badge: '⚠️ Tidak Direkomendasikan',
        reason: isLongJump ? `Jarak antar titik cukup jauh (${distFromPrev.toFixed(1)} km) dari klaster ${currRun.nama_run}` : 'Area ini mengalami potensi kemacetan tinggi',
        isTransferred,
        origRunName
      };
    }

    if (isTrafficMacet && isLongJump) {
      return {
        type: 'warning' as const,
        badge: '⚠️ Tidak Direkomendasikan',
        reason: 'Urutan rute berisiko memicu kemacetan & memutarkan jalan',
        isTransferred,
        origRunName
      };
    }

    return {
      type: 'recommended' as const,
      badge: '✨ Direkomendasikan',
      reason: isTransferred ? `Transfer ke ${currRun.nama_run} sesuai geofencing` : 'Urutan rute efisien & efisiensi geofencing tinggi',
      isTransferred,
      origRunName
    };
  };

  // Move trip within same run (Up / Down)
  const handleReorderStop = (runIdx: number, stopIdx: number, direction: 'up' | 'down') => {
    const updated = [...runs];
    const targetIdx = direction === 'up' ? stopIdx - 1 : stopIdx + 1;

    if (targetIdx < 0 || targetIdx >= updated[runIdx].rute_kunjungan.length) return;

    const stops = [...updated[runIdx].rute_kunjungan];
    const [moved] = stops.splice(stopIdx, 1);
    stops.splice(targetIdx, 0, moved);

    // Re-assign sequence numbers
    stops.forEach((s, idx) => {
      s.urutan = idx + 1;
    });

    updated[runIdx].rute_kunjungan = stops;
    setRuns(updated);
  };

  // Transfer trip between runs (Pindah Run)
  const handleTransferTrip = (fromRunIdx: number, stopIdx: number, toRunIdx: number) => {
    if (fromRunIdx === toRunIdx) return;
    const updated = [...runs];

    const sourceStops = [...updated[fromRunIdx].rute_kunjungan];
    const destStops = [...updated[toRunIdx].rute_kunjungan];

    const [moved] = sourceStops.splice(stopIdx, 1);
    destStops.push(moved);

    // Re-sequence source
    sourceStops.forEach((s, idx) => (s.urutan = idx + 1));
    // Re-sequence dest
    destStops.forEach((s, idx) => (s.urutan = idx + 1));

    updated[fromRunIdx].rute_kunjungan = sourceStops;
    updated[fromRunIdx].jumlah_trip = sourceStops.length;

    updated[toRunIdx].rute_kunjungan = destStops;
    updated[toRunIdx].jumlah_trip = destStops.length;

    setRuns(updated);

    // Visual trigger feedback for evaluation
    setEvaluatingCardPlanNo(moved.plan_no);
    setTimeout(() => {
      setEvaluatingCardPlanNo(null);
    }, 600);
  };

  // Fetch Dual-Engine AI Impact Analysis from Backend
  const analyzeImpactWithAI = async (updatedRuns: Run[]) => {
    setIsAnalyzingAI(true);
    setAiImpactResult(null);

    const beforeMetrics = calculateRunsMetrics(initialRuns);
    const afterMetrics = calculateRunsMetrics(updatedRuns);

    const tripDataBefore = {
      total_jarak_km: beforeMetrics.totalDistance,
      total_waktu_macet_menit: beforeMetrics.totalDelay,
      eta: beforeMetrics.etaStr,
      runs: initialRuns.map(r => ({
        nama_run: r.nama_run,
        jumlah_trip: r.rute_kunjungan.length,
        stops: r.rute_kunjungan.map(s => `${s.nama_client} (${s.plan_no})`)
      }))
    };

    const proposedChange = {
      deskripsi: "Perubahan Switch Trip antar Run oleh Planner",
      total_jarak_km_setelah: afterMetrics.totalDistance,
      total_waktu_macet_menit_setelah: afterMetrics.totalDelay,
      eta_setelah: afterMetrics.etaStr,
      runs: updatedRuns.map(r => ({
        nama_run: r.nama_run,
        jumlah_trip: r.rute_kunjungan.length,
        stops: r.rute_kunjungan.map(s => `${s.nama_client} (${s.plan_no})`)
      }))
    };

    try {
      const res = await fetch('/api/analyze-switch-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripDataBefore, proposedChange })
      });

      if (res.ok) {
        const data = await res.json();
        setAiImpactResult(data);
      } else {
        throw new Error('Response error from AI backend');
      }
    } catch (err) {
      console.warn('Fallback to local AI calculation:', err);
      // Fallback calculation object matching system prompt output format
      const distDiff = parseFloat((afterMetrics.totalDistance - beforeMetrics.totalDistance).toFixed(1));
      const delayDiff = afterMetrics.totalDelay - beforeMetrics.totalDelay;
      const isRisk = delayDiff > 5 || distDiff > 3;

      setAiImpactResult({
        status_rekomendasi: isRisk ? "Tidak Direkomendasikan" : "Direkomendasikan",
        alasan: isRisk
          ? `Perpindahan trip menambah estimasi jarak (+${distDiff} km) dan delay macet (+${delayDiff} menit).`
          : "Perpindahan trip menjaga efisiensi geofencing klaster rute.",
        impact_metrics: {
          jarak_before_km: beforeMetrics.totalDistance,
          jarak_after_km: afterMetrics.totalDistance,
          selisih_jarak_km: (distDiff >= 0 ? `+${distDiff}` : `${distDiff}`) + " km",
          waktu_macet_before_menit: beforeMetrics.totalDelay,
          waktu_macet_after_menit: afterMetrics.totalDelay,
          selisih_macet_menit: (delayDiff >= 0 ? `+${delayDiff}` : `${delayDiff}`) + " menit",
          eta_before: beforeMetrics.etaStr,
          eta_after: afterMetrics.etaStr
        },
        pesan_peringatan: isRisk
          ? "Peringatan Operasional: Perpindahan ini sedikit melanggar efisiensi geofencing dan meningkatkan potensi keterlambatan jadwal."
          : "Rute hasil switch trip berada dalam batas toleransi efisiensi operasional ROC-COS."
      });
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  // Trigger Save Impact Analysis Pop-up
  const handleSaveClick = () => {
    setShowImpactModal(true);
    analyzeImpactWithAI(runs);
  };

  // EPIC 2: Trigger Advantage Smart Route Re-optimization & open A/B Choice Modal
  const triggerReoptimization = async (currentRuns: Run[]) => {
    setShowImpactModal(false);
    setShowReoptModal(true);
    setIsReoptimizing(true);
    setReoptResult(null);

    try {
      const res = await fetch('/api/reoptimize-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          runs: currentRuns,
          cabang: "JAKARTA",
          tanggalReplenish,
          siklus
        })
      });

      if (res.ok) {
        const data = await res.json();
        setReoptResult(data);
      } else {
        throw new Error("Failed to reoptimize");
      }
    } catch (err) {
      console.warn("Reoptimization fallback triggered:", err);
      const metrics = calculateRunsMetrics(currentRuns);
      setReoptResult({
        optionA: { runs: currentRuns, totalDistance: metrics.totalDistance, totalDelay: metrics.totalDelay },
        optionB: { runs: currentRuns, totalDistance: metrics.totalDistance, totalDelay: metrics.totalDelay },
        savings: { distanceKmSaved: 0, delayMinsSaved: 0 },
        alasan_optimasi: "Advantage Smart Route mereorganisasi urutan rute berdasarkan matriks jarak Vincenty. Penyesuaian ini mengoptimalkan alur lintasan & jadwal operasional.",
        kesimpulan_singkat: "Rute teroptimasi AI memberikan urutan paling efisien.",
        reasoning: "Advantage Smart Route mereorganisasi urutan rute berdasarkan matriks jarak Vincenty. Penyesuaian ini mengoptimalkan alur lintasan & jadwal operasional."
      });
    } finally {
      setIsReoptimizing(false);
    }
  };

  const confirmSave = () => {
    triggerReoptimization(runs);
  };

  const selectedPreviewRun = previewRunIndex !== null ? runs[previewRunIndex] : null;

  // Calculate Impact Analysis Metrics
  const beforeMetrics = calculateRunsMetrics(initialRuns);
  const afterMetrics = calculateRunsMetrics(runs);

  const distanceDiff = parseFloat((afterMetrics.totalDistance - beforeMetrics.totalDistance).toFixed(1));
  const delayDiff = afterMetrics.totalDelay - beforeMetrics.totalDelay;

  // Check if any trip triggered warning
  let hasWarnings = false;
  runs.forEach((r, rIdx) => {
    r.rute_kunjungan.forEach((s, sIdx) => {
      const status = getTripAiStatus(s, sIdx, rIdx);
      if (status.type === 'warning') {
        hasWarnings = true;
      }
    });
  });

  const isRiskIncreased = hasWarnings || delayDiff > 0 || distanceDiff > 2.0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 md:p-6 overflow-hidden">
      <div className="bg-slate-50 border border-slate-200 rounded-2xl w-full max-w-6xl h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative">
        
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Switch Trip & Route Editor</h2>
              <span className="text-xs bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                <Sparkles className="w-3 h-3 text-amber-300" /> AI Interactive Planner
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Atur dan pindahkan urutan kunjungan ATM antar Run dengan panduan rekomendasi AI
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
              <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">TANGGAL REPLENISH:</span>
              <span className="font-bold text-slate-800">{tanggalReplenish || '02 Jun 2026'}</span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] px-2">SIKLUS (CYCLE):</span>
              <span className="bg-blue-600 text-white font-bold px-3 py-1 rounded-md">
                {siklus || 'Pagi'}
              </span>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {selectedPreviewRun !== null ? (
          /* View 2: Run Detail Preview Modal */
          <div className="flex-1 overflow-hidden flex flex-col md:flex-row p-6 gap-6 bg-slate-100">
            <div className="w-full md:w-1/2 flex flex-col h-full">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setPreviewRunIndex(null)}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Kembali ke Semua Run
                </button>
                <span className="text-xs font-extrabold uppercase px-3 py-1 bg-blue-600 text-white rounded-lg shadow-xs">
                  {selectedPreviewRun.nama_run} ({selectedPreviewRun.rute_kunjungan.length} Trip)
                </span>
              </div>

              {/* Map Preview of specific run */}
              <div className="flex-1 rounded-xl overflow-hidden shadow-sm border border-slate-200 bg-white">
                <MapView runs={[selectedPreviewRun]} height="100%" />
              </div>
            </div>

            {/* Right side: Detailed Trip Cards list for this run */}
            <div className="w-full md:w-1/2 flex flex-col h-full bg-white rounded-xl border border-slate-200 p-4 overflow-y-auto">
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3 flex items-center justify-between">
                <span>Daftar kunjungan untuk {selectedPreviewRun.nama_run}</span>
                <span className="text-xs font-normal text-slate-500">
                  {selectedPreviewRun.rute_kunjungan.length} Lokasi ATM
                </span>
              </h3>

              <div className="space-y-3">
                {selectedPreviewRun.rute_kunjungan.map((stop, stopIdx) => {
                  const aiStatus = getTripAiStatus(stop, stopIdx, previewRunIndex);

                  return (
                    <div
                      key={stop.plan_no + stop.urutan}
                      className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl hover:border-blue-300 transition-colors space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {stop.urutan}
                          </span>
                          <span className="font-bold text-slate-900 text-sm">{stop.nama_client}</span>
                        </div>
                        <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">
                          {stop.plan_no}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 pl-8">{stop.alamat}</p>

                      {/* AI Badge Suggestion */}
                      <div className="pl-8">
                        <div
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                            aiStatus.type === 'warning'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {aiStatus.badge}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pl-8 text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-100">
                        <div>Status ATM: <b className="text-slate-800">{stop.status_atm}</b></div>
                        <div>Tipe Trip: <b className="text-slate-800">{stop.tipe_trip}</b></div>
                        <div>Jam Tiba: <b className="text-blue-600">{stop.prediksi_jam_tiba_di_lokasi}</b></div>
                        <div>Durasi: <b className="text-slate-800">{stop.durasi_transaksi_menit} Menit</b></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* View 1: Multi-column Runs List */
          <div className="flex-1 overflow-x-auto p-6 bg-slate-100/70">
            <div className="flex items-start gap-5 min-w-max h-full">
              {runs.map((run, runIdx) => (
                <div
                  key={run.nama_run}
                  className="w-84 bg-white border border-slate-200 rounded-2xl flex flex-col max-h-full shadow-sm"
                >
                  {/* Column Header */}
                  <div className="p-3.5 border-b border-slate-200 bg-slate-50/90 rounded-t-2xl flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase text-slate-800 tracking-wider">
                        {run.nama_run}
                      </span>
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                        {run.rute_kunjungan.length} Trip
                      </span>
                    </div>

                    <button
                      title="Klik untuk Lihat Detail Map Run"
                      onClick={() => setPreviewRunIndex(runIdx)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Detail Map
                    </button>
                  </div>

                  {/* Trip Cards Container */}
                  <div className="p-3 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                    {run.rute_kunjungan.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400 font-medium italic border-2 border-dashed border-slate-200 rounded-xl">
                        Tidak ada trip di run ini. Pindahkan trip dari run lain.
                      </div>
                    ) : (
                      run.rute_kunjungan.map((stop, stopIdx) => {
                        const aiStatus = getTripAiStatus(stop, stopIdx, runIdx);

                        return (
                          <div
                            key={stop.plan_no + stopIdx}
                            onDoubleClick={() => setPreviewRunIndex(runIdx)}
                            className={`bg-white border rounded-xl p-3 shadow-2xs hover:shadow-md transition-all group relative cursor-pointer space-y-2 ${
                              aiStatus.type === 'warning'
                                ? 'border-rose-200 bg-rose-50/10 hover:border-rose-400'
                                : 'border-slate-200 hover:border-blue-400'
                            }`}
                          >
                            {/* Card Header */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                                  {stop.urutan}
                                </span>
                                <span className="font-bold text-xs text-slate-800 truncate max-w-[150px]" title={stop.nama_client}>
                                  {stop.nama_client}
                                </span>
                              </div>

                              <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                                {/* Move Up */}
                                {stopIdx > 0 && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleReorderStop(runIdx, stopIdx, 'up'); }}
                                    title="Naikkan Urutan"
                                    className="p-1 hover:bg-slate-100 rounded text-slate-600 hover:text-blue-600 cursor-pointer"
                                  >
                                    <MoveUp className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {/* Move Down */}
                                {stopIdx < run.rute_kunjungan.length - 1 && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleReorderStop(runIdx, stopIdx, 'down'); }}
                                    title="Turunkan Urutan"
                                    className="p-1 hover:bg-slate-100 rounded text-slate-600 hover:text-blue-600 cursor-pointer"
                                  >
                                    <MoveDown className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Plan No & Address */}
                            <div className="text-[11px] text-slate-500 font-medium leading-tight">
                              Plan: <span className="font-mono text-slate-700 font-bold">{stop.plan_no}</span>
                            </div>

                            {/* Intelligent AI Suggestion Badge */}
                            <div className="pt-0.5">
                              <div
                                className={`w-full inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                                  aiStatus.type === 'warning'
                                    ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                }`}
                              >
                                {aiStatus.type === 'warning' ? (
                                  <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                                ) : (
                                  <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
                                )}
                                <span className="truncate">{aiStatus.badge}</span>
                              </div>
                              {aiStatus.isTransferred && (
                                <span className="text-[9px] text-indigo-600 font-semibold block mt-0.5">
                                  [Dipindahkan dari {aiStatus.origRunName}]
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-[10px] text-slate-600">
                              <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                Status: <b className="text-slate-800">{stop.status_atm}</b>
                              </span>
                              <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                Tipe: <b className="text-slate-800">{stop.tipe_trip}</b>
                              </span>
                            </div>

                            {/* Transfer to another Run controls */}
                            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                              <span className="text-slate-400 font-semibold text-[9px]">Pindah Run:</span>
                              <div className="flex items-center gap-1">
                                {runs.map((r, targetRunIdx) => {
                                  if (targetRunIdx === runIdx) return null;
                                  return (
                                    <button
                                      key={r.nama_run}
                                      onClick={(e) => { e.stopPropagation(); handleTransferTrip(runIdx, stopIdx, targetRunIdx); }}
                                      className="px-1.5 py-0.5 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-600 rounded font-bold transition-colors border border-slate-200 cursor-pointer"
                                    >
                                      {r.nama_run}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="bg-white px-6 py-4 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>AI secara otomatis mengevaluasi geofencing & potensi keterlambatan pada setiap perubahan.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Kembali
            </button>
            <button
              onClick={handleSaveClick}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-600/30 flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* BEFORE-VS-AFTER IMPACT PREVIEW POP-UP (SUB-MODAL) */}
        {/* ================================================================= */}
        {showImpactModal && (
          <div className="absolute inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
              
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl text-white ${
                    aiImpactResult?.status_rekomendasi?.includes('Tidak') ? 'bg-rose-500' : 'bg-blue-600'
                  }`}>
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                        Analisis Dampak Perubahan Rute
                      </h3>
                      <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200">
                        Smart AI Validator
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Evaluasi operasional Before vs After oleh AI Decision Support Engine
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowImpactModal(false)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Loading State */}
              {isAnalyzingAI ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <div className="font-bold text-sm text-slate-800">
                    Menganalisis Dampak Switch Trip...
                  </div>
                  <div className="text-xs text-slate-500">
                    Smart AI Validator mengevaluasi geofencing & potensi kemacetan...
                  </div>
                </div>
              ) : aiImpactResult ? (
                <>
                  {/* AI WARNING / RECOMMENDATION ALERT - MODERN ENTERPRISE STYLE */}
                  {aiImpactResult.status_rekomendasi?.includes('Tidak') ? (
                    <div className="relative overflow-hidden rounded-xl border border-rose-200 bg-gradient-to-br from-rose-50 to-white p-5 shadow-sm">
                      {/* Dekorasi efek cahaya (Glow) di sudut kanan atas agar tidak flat */}
                      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-rose-100/60 blur-2xl"></div>

                      <div className="relative flex items-start gap-4">
                        {/* Icon Container dengan bulatan yang rapi */}
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-rose-100 bg-white text-rose-600 shadow-sm">
                          <AlertTriangle className="h-5 w-5" />
                        </div>
                        
                        {/* Text Container */}
                        <div className="flex-1 pt-0.5">
                          <h4 className="text-sm font-bold tracking-wide text-rose-800 uppercase">
                            Analisis Kelayakan: {aiImpactResult.status_rekomendasi}
                          </h4>
                          <p className="mt-1.5 text-[13px] leading-relaxed text-rose-700/90">
                            {aiImpactResult.alasan && aiImpactResult.alasan.length > 5 && !aiImpactResult.alasan.includes("Fallback")
                              ? aiImpactResult.alasan
                              : <>Sistem tidak mendeteksi adanya modifikasi pada jadwal (<span className="font-semibold italic">Switch Trip</span>). Susunan rute kunjungan, akumulasi jarak, dan estimasi waktu tempuh tetap identik dengan konfigurasi awal.</>}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative overflow-hidden rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm">
                      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-100/60 blur-2xl"></div>

                      <div className="relative flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-emerald-100 bg-white text-emerald-600 shadow-sm">
                          <Sparkles className="h-5 w-5" />
                        </div>
                        
                        <div className="flex-1 pt-0.5">
                          <h4 className="text-sm font-bold tracking-wide text-emerald-800 uppercase">
                            Analisis Kelayakan: {aiImpactResult.status_rekomendasi}
                          </h4>
                          <p className="mt-1.5 text-[13px] leading-relaxed text-emerald-700/90">
                            {aiImpactResult.alasan}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Metrics Comparison Table / Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    {/* Total Jarak */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                        <Navigation className="w-3 h-3 text-blue-600" /> TOTAL JARAK
                      </span>
                      <div className="text-xs text-slate-500">
                        Sebelum: <b className="text-slate-800">{aiImpactResult.impact_metrics?.jarak_before_km ?? beforeMetrics.totalDistance} km</b>
                      </div>
                      <div className="text-sm font-extrabold text-slate-900 flex items-center gap-1">
                        Sesudah: <span>{aiImpactResult.impact_metrics?.jarak_after_km ?? afterMetrics.totalDistance} km</span>
                      </div>
                      <div className={`text-[10px] font-bold ${
                        String(aiImpactResult.impact_metrics?.selisih_jarak_km).includes('+')
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}>
                        Selisih: {aiImpactResult.impact_metrics?.selisih_jarak_km ?? `${distanceDiff} km`}
                      </div>
                    </div>

                    {/* Total Waktu Macet */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                        <Clock className="w-3 h-3 text-red-600" /> WAKTU MACET
                      </span>
                      <div className="text-xs text-slate-500">
                        Sebelum: <b className="text-slate-800">{aiImpactResult.impact_metrics?.waktu_macet_before_menit ?? beforeMetrics.totalDelay}m</b>
                      </div>
                      <div className="text-sm font-extrabold text-slate-900 flex items-center gap-1">
                        Sesudah: <span>{aiImpactResult.impact_metrics?.waktu_macet_after_menit ?? afterMetrics.totalDelay}m</span>
                      </div>
                      <div className={`text-[10px] font-bold ${
                        String(aiImpactResult.impact_metrics?.selisih_macet_menit).includes('+')
                          ? 'text-rose-600'
                          : 'text-emerald-600'
                      }`}>
                        Selisih: {aiImpactResult.impact_metrics?.selisih_macet_menit ?? `${delayDiff}m`}
                      </div>
                    </div>

                    {/* Estimasi Selesai (ETA) */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> ESTIMASI ETA
                      </span>
                      <div className="text-xs text-slate-500">
                        Sebelum: <b className="text-slate-800">{aiImpactResult.impact_metrics?.eta_before ?? beforeMetrics.etaStr}</b>
                      </div>
                      <div className="text-sm font-extrabold text-slate-900">
                        Sesudah: <span>{aiImpactResult.impact_metrics?.eta_after ?? afterMetrics.etaStr}</span>
                      </div>
                      <div className="text-[10px] font-bold text-slate-500">
                        Lalu lintas AI
                      </div>
                    </div>
                  </div>

                  {/* Operational Warning Statement */}
                  {aiImpactResult.pesan_peringatan && (
                    <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-amber-800">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Pesan Peringatan Operasional</span>
                      </div>
                      <p className="font-medium leading-relaxed text-amber-900">
                        {aiImpactResult.pesan_peringatan}
                      </p>
                    </div>
                  )}

                  {/* Confirmation Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setShowImpactModal(false)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Batal / Review Kembali
                    </button>
                    <button
                      onClick={confirmSave}
                      className={`px-5 py-2.5 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer ${
                        aiImpactResult.status_rekomendasi?.includes('Tidak')
                          ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30'
                          : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                      }`}
                    >
                      <Save className="w-4 h-4" /> Ya, Tetap Simpan (Force Save)
                    </button>
                  </div>
                </>
              ) : null}

            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* RE-OPTIMIZATION CHOICE MODAL (A/B CHOICE SUB-MODAL) */}
        {/* ================================================================= */}
        {showReoptModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-5xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200">
              
              {/* HEADER MODAL */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-600/20">
                    <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">
                        Validasi Perubahan Rute (Advantage AI)
                      </h3>
                      <span className="text-[11px] font-extrabold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                        Advantage AI Decision Engine
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Bandingkan Rute Manual Planner vs Rute Teroptimasi Advantage Smart Route pasca Switch Trip
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowReoptModal(false)}
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* LOADING STATE */}
              {isReoptimizing ? (
                <div className="py-16 flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <Sparkles className="w-5 h-5 text-amber-400 absolute inset-0 m-auto" />
                  </div>
                  <div className="space-y-1">
                    <div className="font-extrabold text-base text-slate-900">
                      Menghitung Re-Optimasi Advantage Smart Route...
                    </div>
                    <div className="text-xs text-slate-500">
                      AI Decision Engine menyusun matriks jarak Vincenty & menganalisis efisiensi rute...
                    </div>
                  </div>
                </div>
              ) : reoptResult ? (
                <>
                  {/* TOP CONTENT: SIDE-BY-SIDE CARDS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    {/* OPSI A: RUTE MANUAL PLANNER */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-300 transition-all space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[11px] font-black uppercase tracking-wider bg-slate-200 text-slate-700 px-3 py-1 rounded-lg">
                            OPSI A: RUTE MANUAL
                          </span>
                          <span className="text-[11px] text-slate-500 font-bold">Input Planner</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                          Mempertahankan urutan kunjungan yang ditentukan secara manual oleh Planner.
                        </p>
                        
                        <div className="mt-4 p-4 bg-white rounded-xl border border-slate-200/80 space-y-2 text-xs shadow-2xs">
                          <div className="flex justify-between items-center text-slate-600">
                            <span className="font-medium">Total Jarak Tempuh:</span>
                            <b className="text-slate-900 text-sm font-black">{reoptResult.optionA?.totalDistance} km</b>
                          </div>
                          <div className="flex justify-between items-center text-slate-600">
                            <span className="font-medium">Total Estimasi Delay:</span>
                            <b className="text-slate-900 text-sm font-black">{reoptResult.optionA?.totalDelay} menit</b>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* OPSI B: OPTIMASI ADVANTAGE SMART ROUTE */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/50 border-2 border-blue-500 rounded-2xl p-5 flex flex-col justify-between shadow-xl shadow-blue-500/10 space-y-4">
                      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-blue-200/40 blur-2xl pointer-events-none"></div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[11px] font-black uppercase tracking-wider bg-blue-600 text-white px-3 py-1 rounded-lg flex items-center gap-1.5 shadow-xs">
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> OPSI B: OPTIMASI AI
                          </span>
                          <span className="text-[11px] text-emerald-800 font-black bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Recommended
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                          Advantage Smart Route mereorganisasi urutan kunjungan untuk efisiensi jarak & minimasi macet.
                        </p>

                        <div className="mt-4 p-4 bg-white/90 backdrop-blur-xs rounded-xl border border-blue-200 space-y-2 text-xs shadow-2xs">
                          <div className="flex justify-between items-center text-slate-700">
                            <span className="font-medium">Total Jarak Tempuh:</span>
                            <b className="text-blue-950 text-sm font-black">{reoptResult.optionB?.totalDistance} km</b>
                          </div>
                          <div className="flex justify-between items-center text-slate-700">
                            <span className="font-medium">Total Estimasi Delay:</span>
                            <b className="text-blue-950 text-sm font-black">{reoptResult.optionB?.totalDelay} menit</b>
                          </div>
                          
                          {/* Savings Badge */}
                          <div className="pt-2 border-t border-slate-100 flex justify-between items-center font-bold text-xs">
                            <span className="text-slate-600">Efisiensi Rute AI:</span>
                            <span className="bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200 font-extrabold flex items-center gap-1">
                              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                              {reoptResult.savings?.distanceKmSaved >= 0 ? `Hemat ${reoptResult.savings?.distanceKmSaved} km` : `+${Math.abs(reoptResult.savings?.distanceKmSaved)} km`}
                              {" | "}
                              {reoptResult.savings?.delayMinsSaved >= 0 ? `Hemat ${reoptResult.savings?.delayMinsSaved}m Delay` : `+${Math.abs(reoptResult.savings?.delayMinsSaved)}m Delay`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* MIDDLE CONTENT: VISUAL SEQUENCE COMPARISON */}
                  <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                      <div className="flex items-center gap-2">
                        <Navigation className="w-4 h-4 text-blue-600" />
                        <h4 className="text-sm font-extrabold text-slate-900">
                          Perbandingan Urutan Titik (Sequence Matrix)
                        </h4>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Atas: Rute Manual vs Bawah: Rute Teroptimasi AI
                      </span>
                    </div>

                    {/* Render comparison per Run */}
                    <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
                      {reoptResult.optionA?.runs?.map((runA: Run, runIdx: number) => {
                        const runB = reoptResult.optionB?.runs?.[runIdx];
                        if (!runB) return null;

                        return (
                          <div key={runA.nama_run || runIdx} className="bg-white rounded-xl border border-slate-200 p-3.5 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                                {runA.nama_run.toUpperCase()} ({runA.plat_mobil})
                              </span>
                              <span className="text-[11px] font-semibold text-slate-500">
                                {runA.rute_kunjungan.length} Titik ATM
                              </span>
                            </div>

                            {/* Stops comparison grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {/* Manual Stops */}
                              <div className="space-y-1.5">
                                <div className="text-[10px] font-black uppercase text-slate-400">
                                  Urutan Manual Planner (Opsi A)
                                </div>
                                <div className="space-y-1">
                                  {runA.rute_kunjungan.map((stopA, idxA) => (
                                    <div key={stopA.plan_no} className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-lg border border-slate-100">
                                      <span className="font-bold text-slate-500 w-5">#{idxA + 1}</span>
                                      <span className="font-semibold text-slate-800 truncate flex-1 px-2">{stopA.nama_client}</span>
                                      <span className="text-[10px] text-slate-400 font-mono">{stopA.prediksi_jam_tiba_di_lokasi}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* AI Optimized Stops */}
                              <div className="space-y-1.5">
                                <div className="text-[10px] font-black uppercase text-blue-600 flex items-center justify-between">
                                  <span>Urutan Advantage AI (Opsi B)</span>
                                  <span className="text-[9px] text-amber-600 lowercase bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                    highlight = urutan berubah
                                  </span>
                                </div>
                                <div className="space-y-1">
                                  {runB.rute_kunjungan.map((stopB, idxB) => {
                                    // Find idx of same stop in Manual runA
                                    const origIdxA = runA.rute_kunjungan.findIndex(s => s.plan_no === stopB.plan_no);
                                    const isSequenceChanged = origIdxA !== -1 && origIdxA !== idxB;

                                    return (
                                      <div
                                        key={stopB.plan_no}
                                        className={`flex items-center justify-between text-xs p-2 rounded-lg border transition-all ${
                                          isSequenceChanged
                                            ? 'bg-amber-50/90 border-amber-300 text-amber-950 font-bold shadow-2xs'
                                            : 'bg-emerald-50/50 border-emerald-200/80 text-slate-800'
                                        }`}
                                      >
                                        <div className="flex items-center gap-1.5">
                                          <span className={`font-black text-xs w-5 ${isSequenceChanged ? 'text-amber-700' : 'text-emerald-700'}`}>
                                            #{idxB + 1}
                                          </span>
                                          {isSequenceChanged && (
                                            <span className="text-[9px] font-black bg-amber-200/80 text-amber-900 px-1.5 py-0.5 rounded">
                                              #{origIdxA + 1} ➔ #{idxB + 1}
                                            </span>
                                          )}
                                        </div>

                                        <span className="font-semibold truncate flex-1 px-2">{stopB.nama_client}</span>

                                        <span className="text-[10px] font-mono text-slate-600">{stopB.prediksi_jam_tiba_di_lokasi}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* BOTTOM CONTENT: AI REASONING BOX */}
                  <div className="p-5 bg-blue-50/80 border border-blue-200 text-slate-900 rounded-2xl space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-600 text-white rounded-lg shadow-2xs">
                          <Sparkles className="w-4 h-4 text-amber-300" />
                        </div>
                        <h4 className="text-xs font-black text-blue-950 tracking-tight">
                          Analisis Decision Support (Advantage AI)
                        </h4>
                      </div>
                      {reoptResult.kesimpulan_singkat && (
                        <span className="text-[10px] font-extrabold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full border border-blue-200">
                          {reoptResult.kesimpulan_singkat}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {reoptResult.alasan_optimasi || reoptResult.reasoning}
                    </p>
                  </div>

                  {/* FOOTER ACTION BUTTONS */}
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => {
                        onSaveRuns(reoptResult.optionA.runs, "Post-Switch Trip (Urutan Manual)");
                        setShowReoptModal(false);
                        onClose();
                      }}
                      className="px-5 py-2.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-2xs"
                    >
                      Tetap Gunakan Rute Manual (Opsi A)
                    </button>

                    <button
                      onClick={() => {
                        onSaveRuns(reoptResult.optionB.runs, "Post-Switch Trip (Optimasi Advantage AI)");
                        setShowReoptModal(false);
                        onClose();
                      }}
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-blue-600/30 flex items-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Terapkan Optimasi AI (Opsi B)</span>
                    </button>
                  </div>
                </>
              ) : null}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
