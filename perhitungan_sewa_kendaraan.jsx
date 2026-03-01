import { useState, useMemo } from "react";

const fmt = (n) =>
  new Intl.NumberFormat("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

const Section = ({ label, children }) => (
  <div style={{
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: 16,
    padding: "24px 28px",
    marginBottom: 20,
  }}>
    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: "#f59e0b", textTransform: "uppercase", marginBottom: 16 }}>{label}</div>
    {children}
  </div>
);

const Row = ({ label, value, highlight }) => (
  <div style={{
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)",
    color: highlight ? "#f59e0b" : "#e2e8f0",
  }}>
    <span style={{ fontSize: 13, opacity: highlight ? 1 : 0.8 }}>{label}</span>
    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600 }}>
      Rp {fmt(value)}
    </span>
  </div>
);

const Input = ({ label, value, onChange, prefix, suffix, hint }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: "block", fontSize: 11, letterSpacing: 1.5, color: "#94a3b8", textTransform: "uppercase", marginBottom: 6 }}>{label}</label>
    {hint && <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>{hint}</div>}
    <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "10px 14px" }}>
      {prefix && <span style={{ color: "#64748b", fontSize: 13 }}>{prefix}</span>}
      <input
        type="number"
        value={value}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        style={{
          flex: 1, background: "transparent", border: "none", outline: "none",
          color: "#f1f5f9", fontSize: 15, fontFamily: "'JetBrains Mono', monospace",
        }}
      />
      {suffix && <span style={{ color: "#64748b", fontSize: 13 }}>{suffix}</span>}
    </div>
  </div>
);

export default function App() {
  // === A. Capital Recovery Inputs ===
  const [hargaOTR, setHargaOTR] = useState(110_000_000);
  const [hargaPerlengkapan, setHargaPerlengkapan] = useState(40_000_000);
  const [salvagePct, setSalvagePct] = useState(52);
  const [bungaTahunan, setBungaTahunan] = useState(6);
  const [masaSewaBulan, setMasaSewaBulan] = useState(48);

  // === B. Biaya Operasi Inputs ===
  const [asuransiTahunan, setAsuransiTahunan] = useState(4_400_000);
  const [perawatanPct, setPerawatanPct] = useState(0.5); // % of OTR per bulan (servis & sparepart)
  const [stnkTahunan, setStnkTahunan] = useState(1_650_000);
  const [risikoPct, setRisikoPct] = useState(0.125); // % dari total P per bulan (self risk)
  const [marginPct, setMarginPct] = useState(18); // margin keuntungan %

  const calc = useMemo(() => {
    const P = hargaOTR + hargaPerlengkapan;
    const S = (salvagePct / 100) * P;
    const i = bungaTahunan / 100 / 12;
    const n = masaSewaBulan;

    // Capital Recovery (A)
    const iPN = Math.pow(1 + i, n);
    const A1 = P * (i * iPN) / (iPN - 1);
    const A2 = S * i / (iPN - 1);
    const A = A1 - A2;

    // Biaya Operasi (B)
    const asuransi = asuransiTahunan / 12;
    const perawatan = (perawatanPct / 100) * (hargaOTR);
    const stnk = stnkTahunan / 12;
    const risiko = (risikoPct / 100) * P;
    const subtotalB = asuransi + perawatan + stnk + risiko;
    const keuntungan = subtotalB * (marginPct / 100);
    const B = subtotalB + keuntungan;

    const C = A + B;
    const PPh = C * 0.015;
    const E = C + PPh;
    const PPN = E * 0.10;
    const total = E + PPN;

    return { P, S, i, n, A, asuransi, perawatan, stnk, risiko, subtotalB, keuntungan, B, C, PPh, E, PPN, total };
  }, [hargaOTR, hargaPerlengkapan, salvagePct, bungaTahunan, masaSewaBulan, asuransiTahunan, perawatanPct, stnkTahunan, risikoPct, marginPct]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
      fontFamily: "'Syne', 'Segoe UI', sans-serif",
      color: "#e2e8f0",
      padding: "40px 20px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        * { box-sizing: border-box; }
      `}</style>

      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-block", background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 50, padding: "6px 18px", fontSize: 11, letterSpacing: 3, color: "#f59e0b", textTransform: "uppercase", marginBottom: 16 }}>
            🚗 Kalkulator Tarif
          </div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 800, margin: 0, letterSpacing: -1, background: "linear-gradient(90deg, #f1f5f9, #f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Sewa Kendaraan
          </h1>
          <p style={{ color: "#64748b", marginTop: 8, fontSize: 14 }}>Capital Recovery + Biaya Operasi + PPh + PPN</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

          {/* ── LEFT: Inputs ── */}
          <div>
            <Section label="A · Pengembalian Modal">
              <Input label="Harga OTR Kendaraan" value={hargaOTR} onChange={setHargaOTR} prefix="Rp" />
              <Input label="Biaya Perlengkapan (Box dll)" value={hargaPerlengkapan} onChange={setHargaPerlengkapan} prefix="Rp" />
              <Input label="Salvage Value" value={salvagePct} onChange={setSalvagePct} suffix="%" hint="% dari total harga perolehan" />
              <Input label="Bunga Bank per Tahun" value={bungaTahunan} onChange={setBungaTahunan} suffix="% / tahun" />
              <Input label="Masa Sewa" value={masaSewaBulan} onChange={setMasaSewaBulan} suffix="bulan" />
            </Section>

            <Section label="B · Biaya Operasi">
              <Input label="Asuransi All Risk (per tahun)" value={asuransiTahunan} onChange={setAsuransiTahunan} prefix="Rp" />
              <Input label="Servis & Sparepart" value={perawatanPct} onChange={setPerawatanPct} suffix="% OTR / bulan" hint="% dari harga OTR per bulan" />
              <Input label="STNK (per tahun)" value={stnkTahunan} onChange={setStnkTahunan} prefix="Rp" />
              <Input label="Risiko Sendiri (Self Risk)" value={risikoPct} onChange={setRisikoPct} suffix="% P / bulan" hint="% dari total harga perolehan per bulan" />
              <Input label="Margin Keuntungan" value={marginPct} onChange={setMarginPct} suffix="% dari sub-biaya" />
            </Section>
          </div>

          {/* ── RIGHT: Results ── */}
          <div>
            {/* Summary Card */}
            <div style={{
              background: "linear-gradient(135deg, rgba(245,158,11,0.2), rgba(251,191,36,0.05))",
              border: "1px solid rgba(245,158,11,0.4)",
              borderRadius: 20,
              padding: 28,
              marginBottom: 20,
              textAlign: "center",
            }}>
              <div style={{ fontSize: 11, letterSpacing: 3, color: "#f59e0b", textTransform: "uppercase", marginBottom: 8 }}>Total Tarif Sewa / Bulan</div>
              <div style={{ fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#fbbf24", lineHeight: 1.1 }}>
                Rp {fmt(calc.total)}
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 8 }}>termasuk PPh 1,5% + PPN 10%</div>
            </div>

            {/* Detail Breakdown */}
            <Section label="Detail Perhitungan">
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8, letterSpacing: 1 }}>PARAMETER</div>
              <Row label={`Harga Perolehan (P)`} value={calc.P} />
              <Row label={`Salvage Value (S = ${salvagePct}% × P)`} value={calc.S} />
              <Row label={`Bunga per Bulan (i = ${bungaTahunan}%/12)`} value={0} />
              <div style={{ height: 12 }} />

              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8, letterSpacing: 1 }}>A · CAPITAL RECOVERY</div>
              <Row label="Angsuran Modal + Bunga (A)" value={calc.A} highlight />
              <div style={{ height: 12 }} />

              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8, letterSpacing: 1 }}>B · BIAYA OPERASI</div>
              <Row label={`Asuransi (per bulan)`} value={calc.asuransi} />
              <Row label={`Perawatan (${perawatanPct}% × OTR)`} value={calc.perawatan} />
              <Row label={`STNK (per bulan)`} value={calc.stnk} />
              <Row label={`Risiko Sendiri (${risikoPct}% × P)`} value={calc.risiko} />
              <Row label={`Sub-total Operasi`} value={calc.subtotalB} />
              <Row label={`Keuntungan (${marginPct}%)`} value={calc.keuntungan} />
              <Row label="Jumlah B" value={calc.B} highlight />
              <div style={{ height: 12 }} />

              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8, letterSpacing: 1 }}>PAJAK & TOTAL</div>
              <Row label="C = A + B" value={calc.C} />
              <Row label="PPh 1,5% × C" value={calc.PPh} />
              <Row label="E = C + PPh (sebelum PPN)" value={calc.E} />
              <Row label="PPN 10% × E" value={calc.PPN} />
              <div style={{ borderTop: "2px solid rgba(245,158,11,0.5)", marginTop: 8, paddingTop: 8 }}>
                <Row label="TOTAL = E + PPN" value={calc.total} highlight />
              </div>
            </Section>

            {/* Formula Box */}
            <div style={{
              background: "rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 12,
              padding: "16px 20px",
              fontSize: 12,
              color: "#64748b",
              lineHeight: 1.8,
            }}>
              <div style={{ color: "#f59e0b", fontWeight: 700, marginBottom: 6, letterSpacing: 1, fontSize: 11, textTransform: "uppercase" }}>Formula Capital Recovery</div>
              <code style={{ color: "#94a3b8" }}>
                A = P × [i(1+i)ⁿ / ((1+i)ⁿ−1)] − S × [i / ((1+i)ⁿ−1)]
              </code>
              <div style={{ marginTop: 12, color: "#f59e0b", fontWeight: 700, marginBottom: 6, letterSpacing: 1, fontSize: 11, textTransform: "uppercase" }}>Struktur Total</div>
              <code style={{ color: "#94a3b8" }}>Tarif = A + B + PPh + PPN</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
