import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, ReferenceLine,
} from 'recharts'

// ─────────────────────────────────────────────
// Static Dataset
// ─────────────────────────────────────────────
const bivariateData = [
  { feature: 'Age', noDiabetes: 40.36, diabetes: 60.91 },
  { feature: 'BMI', noDiabetes: 26.72, diabetes: 31.05 },
  { feature: 'HbA1c', noDiabetes: 5.40, diabetes: 6.84 },
  { feature: 'Glucose', noDiabetes: 132.82, diabetes: 186.08 },
]

const correlationData = [
  { feature: 'blood_glucose_level', correlation: 0.392 },
  { feature: 'HbA1c_level', correlation: 0.392 },
  { feature: 'age', correlation: 0.263 },
  { feature: 'bmi', correlation: 0.211 },
  { feature: 'hypertension', correlation: 0.195 },
  { feature: 'heart_disease', correlation: 0.170 },
  { feature: 'smoking_former', correlation: 0.095 },
  { feature: 'gender', correlation: 0.039 },
  { feature: 'smoking_unknown', correlation: -0.110 },
]

const classBalance = [
  { name: 'No Diabetes', value: 91.1, count: 86603 },
  { name: 'Diabetes', value: 8.9, count: 8500 },
]

const ageDistribution = [
  { range: '1–10', count: 1200 },
  { range: '11–20', count: 3400 },
  { range: '21–30', count: 8200 },
  { range: '31–40', count: 12400 },
  { range: '41–50', count: 14800 },
  { range: '51–60', count: 13200 },
  { range: '61–70', count: 10800 },
  { range: '71–80', count: 6200 },
]

const bmiDistribution = [
  { range: '13–18', count: 800 },
  { range: '18–22', count: 4200 },
  { range: '22–25', count: 11000 },
  { range: '25–28', count: 28000 },
  { range: '28–32', count: 24000 },
  { range: '32–36', count: 12000 },
  { range: '36–40', count: 5000 },
]

const smokingData = [
  { category: 'Unknown', count: 35816 },
  { category: 'Never', count: 35095 },
  { category: 'Former', count: 9352 },
  { category: 'Current', count: 9286 },
  { category: 'Not Current', count: 6447 },
  { category: 'Ever', count: 4004 },
]

const genderData = [
  { name: 'Female', value: 55434 },
  { name: 'Male', value: 38817 },
  { name: 'Other', value: 852 },
]

const hypertensionData = [
  { group: 'No Hypertension', diabetic: 9, healthy: 91 },
  { group: 'Hypertension', diabetic: 28, healthy: 72 },
]

const heartDiseaseData = [
  { group: 'No Heart Disease', diabetic: 9, healthy: 91 },
  { group: 'Heart Disease', diabetic: 32, healthy: 68 },
]

// ─────────────────────────────────────────────
// Design tokens
// ─────────────────────────────────────────────
const TEAL = '#0D9488'
const RED = '#EF4444'
const GREY = '#6B7280'
const GRID = '#1E2D2D'
const SURFACE = '#111918'
const MUTED = '#9CA3AF'
const GENDER_COLORS = ['#0D9488', '#6B7280', '#374151']

const tooltipStyle = {
  backgroundColor: SURFACE,
  border: `1px solid ${TEAL}`,
  borderRadius: 4,
  fontFamily: "'DM Mono', monospace",
  fontSize: 12,
  color: '#F0FDF4',
}

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, fill }) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 35;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill={fill}
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={14}
      fontFamily="DM Mono, monospace"
    >
      {`${name} ${(percent * 100).toFixed(1)}%`}
    </text>
  );
};

// ─────────────────────────────────────────────
// Reusable animation wrapper
// ─────────────────────────────────────────────
function FadeSection({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

// ─────────────────────────────────────────────
// Chart card wrapper
// ─────────────────────────────────────────────
function ChartCard({ title, insight, children }) {
  return (
    <div className="bg-surface border border-white/[0.06] p-6">
      <p className="font-mono-dm text-[10px] tracking-[0.2em] text-textMuted uppercase mb-4">
        {title}
      </p>
      {children}
      {insight && (
        <p className="font-mono-dm text-[11px] text-textMuted mt-3 leading-relaxed">
          {insight}
        </p>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Metric card
// ─────────────────────────────────────────────
function MetricCard({ value, label, sub }) {
  return (
    <div className="bg-surface border border-white/[0.06] p-6 flex flex-col gap-1">
      <span className="font-mono-dm text-3xl font-500 text-text tabular-nums">{value}</span>
      <span className="font-grotesk text-xs text-primary tracking-wider uppercase">{label}</span>
      {sub && <span className="font-mono-dm text-[10px] text-textMuted">{sub}</span>}
    </div>
  )
}

// ─────────────────────────────────────────────
// Bivariate insight row
// ─────────────────────────────────────────────
function InsightDiff({ feature, noDiabetes, diabetes, unit = '' }) {
  const diff = (diabetes - noDiabetes).toFixed(2)
  return (
    <div className="border border-white/[0.06] bg-surface p-4 flex flex-col gap-1">
      <span className="font-mono-dm text-[10px] tracking-widest text-textMuted uppercase">{feature}</span>
      <div className="flex items-end gap-3 mt-1">
        <span className="font-mono-dm text-xl text-red-400 tabular-nums">{diabetes}{unit}</span>
        <span className="font-mono-dm text-xs text-textMuted pb-0.5">vs {noDiabetes}{unit}</span>
      </div>
      <span className="font-mono-dm text-[10px] text-primary">↑ +{diff}{unit} in diabetic patients</span>
    </div>
  )
}

// ─────────────────────────────────────────────
// Section label
// ─────────────────────────────────────────────
function SectionLabel({ index, title }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <span className="font-mono-dm text-[10px] text-primary tracking-[0.25em]">
        {String(index).padStart(2, '0')}
      </span>
      <h2 className="font-grotesk font-600 text-text text-xl">{title}</h2>
      <div className="flex-1 h-px bg-white/[0.06]" />
    </div>
  )
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
export default function DataAnalysis() {
  return (
    <div className="min-h-screen bg-background px-8 lg:px-16 py-12">

      {/* ── Section 1: Header ── */}
      <FadeSection delay={0}>
        <span className="font-mono-dm text-[10px] tracking-[0.25em] text-primary uppercase">
          05 / Data Analysis
        </span>
        <h1
          className="font-grotesk font-600 text-text mt-3 leading-tight"
          style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
        >
          Data Analysis
        </h1>
        <p className="font-grotesk text-textMuted text-sm mt-2 font-300">
          Exploratory analysis of 95,103 patient records
        </p>
        <div className="mt-6 h-px bg-primary/30" />
      </FadeSection>

      <div className="mt-16 flex flex-col gap-20">

        {/* ── Section 2: Overview Cards ── */}
        <FadeSection delay={0.05}>
          <SectionLabel index={1} title="Dataset Overview" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard value="95,103" label="Total Patients" sub="After deduplication" />
            <MetricCard value="8.9%" label="Diabetes Prevalence" sub="8,500 positive cases" />
            <MetricCard value="9" label="Original Features" sub="Raw dataset columns" />
            <MetricCard value="14" label="Features After Encoding" sub="Post one-hot encoding" />
          </div>
        </FadeSection>

        {/* ── Section 3: Class Balance ── */}
        <FadeSection delay={0.1}>
          <SectionLabel index={2} title="Class Balance" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Donut chart */}
            <ChartCard title="Diabetes Class Distribution">
              <div style={{ padding: '0 20px' }}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart margin={{ top: 30, right: 40, bottom: 30, left: 40 }}>
                    <Pie
                      data={classBalance}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      label={renderCustomLabel}
                      labelLine={{ stroke: '#1E2D2D', strokeWidth: 1 }}
                    >
                      <Cell fill={TEAL} />
                      <Cell fill={RED} />
                    </Pie>
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(val, name, props) =>
                        [`${val}% (${props.payload.count.toLocaleString()} patients)`, name]
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* Editorial text */}
            <div className="flex flex-col gap-5">
              <h3 className="font-grotesk font-600 text-text text-2xl">Severe Class Imbalance</h3>
              <div className="h-px bg-white/[0.06]" />
              <p className="font-grotesk text-textMuted text-sm leading-relaxed">
                The dataset exhibits a <span className="text-red-400 font-500">91.1% / 8.9%</span> split — meaning only 1 in 11 patients is diabetic. This creates a significant class imbalance that naive models exploit by simply predicting "No Diabetes" for everyone, achieving a misleading 91% accuracy.
              </p>
              <p className="font-grotesk text-textMuted text-sm leading-relaxed">
                To correct this, <span className="text-primary font-500">SMOTE (Synthetic Minority Over-sampling Technique)</span> was applied during training. SMOTE generates synthetic minority-class samples by interpolating between real diabetic patients, giving the model balanced exposure to both classes.
              </p>
              <p className="font-grotesk text-textMuted text-sm leading-relaxed">
                Without this correction, the model's recall on diabetic patients would collapse — the most critical failure mode in a medical prediction system where false negatives are dangerous.
              </p>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="font-mono-dm text-xs text-textMuted">No Diabetes — 86,603</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="font-mono-dm text-xs text-textMuted">Diabetes — 8,500</span>
                </div>
              </div>
            </div>
          </div>
        </FadeSection>

        {/* ── Section 4: Univariate ── */}
        <FadeSection delay={0.1}>
          <SectionLabel index={3} title="Feature Distributions" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Age */}
            <ChartCard
              title="Age Distribution"
              insight="Patient ages peak in the 41–50 range (14,800), reflecting a middle-aged cohort. The distribution is roughly bell-shaped with a slight right tail."
            >
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={ageDistribution} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                  <XAxis dataKey="range" tick={{ fill: GREY, fontSize: 10, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: GREY, fontSize: 10, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill={TEAL} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* BMI */}
            <ChartCard
              title="BMI Distribution"
              insight="BMI is concentrated in the overweight range (25–32). The mean BMI is 27.3 — above the 'normal' threshold of 25, indicating a prevalent overweight population."
            >
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={bmiDistribution} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                  <XAxis dataKey="range" tick={{ fill: GREY, fontSize: 10, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: GREY, fontSize: 10, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill={TEAL} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Gender */}
            <ChartCard
              title="Gender Distribution"
              insight="Females represent 58.3% of the dataset (55,434 patients), with males at 40.8%. The 'Other' category accounts for only 0.9% of records."
            >
              <ResponsiveContainer width="100%" height={280}>
                <PieChart margin={{ top: 30, right: 40, bottom: 30, left: 40 }}>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    paddingAngle={3}
                    label={renderCustomLabel}
                    labelLine={{ stroke: '#1E2D2D', strokeWidth: 1 }}
                  >
                    {genderData.map((_, i) => (
                      <Cell key={i} fill={GENDER_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [v.toLocaleString(), 'Patients']} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Smoking */}
            <ChartCard
              title="Smoking History"
              insight="'Unknown' and 'Never' dominate at 70%+ combined. Active smokers ('Current') represent ~9.8%, similar in count to former smokers — both are established diabetes risk factors."
            >
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={smokingData} layout="vertical" barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
                  <XAxis type="number" tick={{ fill: GREY, fontSize: 10, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="category" type="category" tick={{ fill: GREY, fontSize: 10, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill={TEAL} radius={[0, 2, 2, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </FadeSection>

        {/* ── Section 5: Bivariate ── */}
        <FadeSection delay={0.1}>
          <SectionLabel index={4} title="Feature vs Diabetes Status" />
          <ChartCard
            title="Mean Values — Diabetic vs Non-Diabetic"
            insight="Diabetic patients consistently show elevated values across all four biomarkers. Glucose and HbA1c show the largest relative differences, confirming their clinical significance."
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bivariateData} barSize={28} barGap={6}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                <XAxis dataKey="feature" tick={{ fill: GREY, fontSize: 11, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: GREY, fontSize: 10, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} width={45} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend
                  wrapperStyle={{ fontFamily: 'DM Mono', fontSize: 11, color: MUTED, paddingTop: 16 }}
                />
                <Bar dataKey="noDiabetes" name="No Diabetes" fill={TEAL} radius={[2, 2, 0, 0]} />
                <Bar dataKey="diabetes" name="Diabetes" fill={RED} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <InsightDiff feature="Age" noDiabetes={40.36} diabetes={60.91} unit=" yrs" />
            <InsightDiff feature="BMI" noDiabetes={26.72} diabetes={31.05} unit="" />
            <InsightDiff feature="HbA1c %" noDiabetes={5.40} diabetes={6.84} unit="%" />
            <InsightDiff feature="Glucose" noDiabetes={132.82} diabetes={186.08} unit=" mg/dL" />
          </div>
        </FadeSection>

        {/* ── Section 6: Correlation ── */}
        <FadeSection delay={0.1}>
          <SectionLabel index={5} title="Feature Correlation with Diabetes" />
          <ChartCard
            title="Pearson Correlation — Feature vs Diabetes Label"
            insight="Blood glucose and HbA1c are the strongest predictors (r=0.392 each), followed by age (0.263) and BMI (0.211). The 'smoking_unknown' category shows a slight negative correlation, likely a data artifact from missing information."
          >
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={[...correlationData].reverse()}
                layout="vertical"
                barSize={18}
                margin={{ left: 20, right: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
                <XAxis
                  type="number"
                  domain={[-0.15, 0.45]}
                  tick={{ fill: GREY, fontSize: 10, fontFamily: 'DM Mono' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  dataKey="feature"
                  type="category"
                  tick={{ fill: GREY, fontSize: 10, fontFamily: 'DM Mono' }}
                  axisLine={false}
                  tickLine={false}
                  width={130}
                />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [v.toFixed(3), 'Correlation']} />
                <ReferenceLine x={0} stroke={GREY} strokeOpacity={0.4} />
                <Bar dataKey="correlation" radius={[0, 2, 2, 0]}>
                  {correlationData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.correlation >= 0 ? TEAL : '#3B82F6'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </FadeSection>

        {/* ── Section 7: Risk Factor Analysis ── */}
        <FadeSection delay={0.1}>
          <SectionLabel index={6} title="Binary Risk Factors" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <ChartCard
              title="Hypertension vs Diabetes Rate"
              insight="Patients with hypertension are 3× more likely to be diabetic (28% vs 9%), making it one of the strongest binary risk indicators in the dataset."
            >
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={hypertensionData} barSize={48}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                  <XAxis dataKey="group" tick={{ fill: GREY, fontSize: 10, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
                  <YAxis unit="%" tick={{ fill: GREY, fontSize: 10, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} width={35} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`]} />
                  <Legend wrapperStyle={{ fontFamily: 'DM Mono', fontSize: 11, color: MUTED }} />
                  <Bar dataKey="healthy" name="No Diabetes" stackId="a" fill={TEAL} />
                  <Bar dataKey="diabetic" name="Diabetes" stackId="a" fill={RED} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Heart Disease vs Diabetes Rate"
              insight="Heart disease patients show a 32% diabetes rate — more than 3.5× the baseline rate. The comorbidity of cardiovascular disease and diabetes is a well-established clinical pattern."
            >
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={heartDiseaseData} barSize={48}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                  <XAxis dataKey="group" tick={{ fill: GREY, fontSize: 10, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
                  <YAxis unit="%" tick={{ fill: GREY, fontSize: 10, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} width={35} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`]} />
                  <Legend wrapperStyle={{ fontFamily: 'DM Mono', fontSize: 11, color: MUTED }} />
                  <Bar dataKey="healthy" name="No Diabetes" stackId="a" fill={TEAL} />
                  <Bar dataKey="diabetic" name="Diabetes" stackId="a" fill={RED} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </FadeSection>

      </div>
    </div>
  )
}
