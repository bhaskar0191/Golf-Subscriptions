import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

type Course = { name: string; location: string; par: number }

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'
const STANDARD_PARS = [4, 4, 3, 5, 4, 4, 3, 5, 4, 4, 4, 3, 5, 4, 4, 3, 5, 4]

type Step = 'course' | 'scorecard' | 'review' | 'saved'

interface HoleData {
    hole: number
    par: number
    score: number
    putts: number
    fairway: boolean | null
    gir: boolean
}

export default function ScoreEntry() {
    const navigate = useNavigate()
    const [step, setStep] = useState<Step>('course')
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
    const [courseName, setCourseName] = useState('')
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
    const [holes, setHoles] = useState<HoleData[]>(
        STANDARD_PARS.map((par, i) => ({
            hole: i + 1, par, score: par, putts: 2,
            fairway: par !== 3 ? true : null,
            gir: true,
        }))
    )
    const [activeHole, setActiveHole] = useState(0)
    const [format, setFormat] = useState<'stableford' | 'gross' | 'net'>('gross')
    const [stablefordPoints, setStablefordPoints] = useState('')
    const [notes, setNotes] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [saveError, setSaveError] = useState<string | null>(null)
    const [savedMessage, setSavedMessage] = useState('')

    const totalScore = holes.reduce((s, h) => s + h.score, 0)
    const totalPar = holes.reduce((s, h) => s + h.par, 0)
    const totalPutts = holes.reduce((s, h) => s + h.putts, 0)
    const totalGIR = holes.filter(h => h.gir).length
    const diff = totalScore - totalPar

    function chooseCourse() {
        const name = courseName.trim()
        if (!name) return
        setSelectedCourse({ name, location: 'Custom course', par: totalPar })
        setStep('scorecard')
    }

    async function saveRound() {
        const token = localStorage.getItem('token') ?? localStorage.getItem('authToken')
        if (!token) {
            setSaveError('Sign in before saving a round.')
            return
        }
        if (!selectedCourse) {
            setSaveError('Choose a course before saving.')
            return
        }

        setIsSaving(true)
        setSaveError(null)
        try {
            const response = await fetch(`${API_URL}/scores`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseName: selectedCourse.name,
                    score: totalScore,
                    stablefordPoints: stablefordPoints ? Number(stablefordPoints) : null,
                    format,
                    holes: holes.length,
                    roundDate: date,
                    notes,
                }),
            })
            const data = await response.json() as { message?: string }
            if (!response.ok) throw new Error(data.message ?? 'Could not save round')
            setSavedMessage(data.message ?? 'Score added successfully')
            setStep('saved')
        } catch (error) {
            setSaveError(error instanceof Error ? error.message : 'Could not save round')
        } finally {
            setIsSaving(false)
        }
    }

    function updateHole(index: number, field: keyof HoleData, value: number | boolean | null) {
        setHoles(prev => prev.map((h, i) => i === index ? { ...h, [field]: value } : h))
    }

    function scoreColor(score: number, par: number) {
        const d = score - par
        if (d <= -2) return '#60A5FA'
        if (d === -1) return '#4ADE80'
        if (d === 0) return '#A3A89E'
        if (d === 1) return '#F59E0B'
        return '#F87171'
    }

    function scoreLabel(score: number, par: number) {
        const d = score - par
        if (d <= -2) return 'Eagle'
        if (d === -1) return 'Birdie'
        if (d === 0) return 'Par'
        if (d === 1) return 'Bogey'
        if (d === 2) return 'Double'
        return `+${d}`
    }

    return (
        <div className="min-h-screen" style={{ background: '#0A0C09' }}>
            <Navbar mode="member" />

            <div className="max-w-3xl mx-auto px-6 pt-24 pb-16">

                {/* ── PROGRESS INDICATOR ── */}
                <div className="flex items-center gap-3 mb-10">
                    {(['course', 'scorecard', 'review', 'saved'] as Step[]).map((s, i) => (
                        <div key={s} className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono-data transition-all duration-300"
                                    style={{
                                        background: step === s ? '#4ADE80' : ['course', 'scorecard', 'review', 'saved'].indexOf(step) > i ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.06)',
                                        color: step === s ? '#0A0C09' : ['course', 'scorecard', 'review', 'saved'].indexOf(step) > i ? '#4ADE80' : '#6B7280',
                                    }}
                                >
                                    {['course', 'scorecard', 'review', 'saved'].indexOf(step) > i ? '✓' : i + 1}
                                </div>
                                <span className="text-xs font-medium capitalize hidden md:block" style={{ color: step === s ? '#F5F5F0' : '#6B7280' }}>{s}</span>
                            </div>
                            {i < 3 && <div className="w-8 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />}
                        </div>
                    ))}
                </div>

                {/* ── STEP: COURSE ── */}
                {step === 'course' && (
                    <div>
                        <h1 className="font-display font-bold mb-2" style={{ fontSize: '2rem', letterSpacing: '-0.02em', color: '#F5F5F0' }}>Select your course</h1>
                        <p className="text-sm mb-8" style={{ color: '#6B7280' }}>Choose the course you played today.</p>

                        <div className="mb-6">
                            <label className="text-xs font-mono-data mb-2 block" style={{ color: '#6B7280', letterSpacing: '0.06em' }}>DATE PLAYED</label>
                            <input
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl text-sm font-mono-data"
                                style={{ background: '#111410', border: '1px solid rgba(255,255,255,0.1)', color: '#F5F5F0', outline: 'none' }}
                            />
                        </div>

                        <div className="text-xs font-mono-data mb-3" style={{ color: '#6B7280', letterSpacing: '0.06em' }}>COURSE NAME</div>
                        <input
                            aria-label="Course name"
                            value={courseName}
                            onChange={e => setCourseName(e.target.value)}
                            placeholder="e.g. Royal Birkdale"
                            className="w-full px-4 py-3 rounded-xl text-sm mb-8"
                            style={{ background: '#111410', border: '1px solid rgba(255,255,255,0.1)', color: '#F5F5F0', outline: 'none' }}
                        />

                        <button
                            disabled={!selectedCourse}
                            onClick={chooseCourse}
                            className="w-full py-3.5 rounded-full font-semibold text-sm transition-all duration-200"
                            style={{
                                background: courseName.trim() ? '#4ADE80' : 'rgba(255,255,255,0.06)',
                                color: courseName.trim() ? '#0A0C09' : '#6B7280',
                                cursor: courseName.trim() ? 'pointer' : 'not-allowed',
                            }}
                            disabled={!courseName.trim()}
                        >
                            Continue to scorecard →
                        </button>
                    </div>
                )}

                {/* ── STEP: SCORECARD ── */}
                {step === 'scorecard' && (
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h1 className="font-display font-bold" style={{ fontSize: '2rem', letterSpacing: '-0.02em', color: '#F5F5F0' }}>Enter your scores</h1>
                            <button onClick={() => setStep('course')} className="text-xs" style={{ color: '#6B7280' }}>← Back</button>
                        </div>
                        <p className="text-sm mb-6" style={{ color: '#6B7280' }}>{selectedCourse?.name} · {date}</p>

                        {/* Running total */}
                        <div className="flex items-center gap-4 p-4 rounded-xl mb-6" style={{ background: '#111410', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div className="text-center">
                                <div className="font-display font-bold text-3xl" style={{ color: '#F5F5F0', letterSpacing: '-0.03em' }}>{totalScore}</div>
                                <div className="text-xs font-mono-data" style={{ color: '#6B7280' }}>TOTAL</div>
                            </div>
                            <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.08)' }} />
                            <div className="text-center">
                                <div className="font-mono-data font-bold text-xl" style={{ color: diff <= 0 ? '#4ADE80' : '#F59E0B' }}>{diff > 0 ? '+' : ''}{diff}</div>
                                <div className="text-xs font-mono-data" style={{ color: '#6B7280' }}>vs PAR</div>
                            </div>
                            <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.08)' }} />
                            <div className="text-center">
                                <div className="font-mono-data font-bold text-xl" style={{ color: '#A3A89E' }}>{totalPutts}</div>
                                <div className="text-xs font-mono-data" style={{ color: '#6B7280' }}>PUTTS</div>
                            </div>
                            <div className="ml-auto text-xs font-mono-data" style={{ color: '#6B7280' }}>
                                Hole {activeHole + 1} / 18
                            </div>
                        </div>

                        {/* Hole navigation */}
                        <div className="grid grid-cols-9 gap-1 mb-6">
                            {holes.map((h, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveHole(i)}
                                    className="rounded-lg py-2 text-xs font-mono-data font-bold transition-all duration-150"
                                    style={{
                                        background: activeHole === i ? '#4ADE80' : 'rgba(255,255,255,0.04)',
                                        color: activeHole === i ? '#0A0C09' : scoreColor(h.score, h.par),
                                        border: activeHole === i ? 'none' : '1px solid rgba(255,255,255,0.06)',
                                    }}
                                >
                                    {h.score}
                                </button>
                            ))}
                        </div>

                        {/* Active hole detail */}
                        {(() => {
                            const h = holes[activeHole]
                            return (
                                <div className="p-6 rounded-2xl mb-6" style={{ background: '#111410', border: '1px solid rgba(255,255,255,0.06)' }}>
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <div className="text-xs font-mono-data mb-1" style={{ color: '#6B7280' }}>HOLE {h.hole} · PAR {h.par}</div>
                                            <div className="font-display font-bold text-lg" style={{ color: scoreColor(h.score, h.par) }}>{scoreLabel(h.score, h.par)}</div>
                                        </div>
                                        <div className="font-display font-bold text-5xl" style={{ color: scoreColor(h.score, h.par), letterSpacing: '-0.04em' }}>{h.score}</div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 mb-6">
                                        {/* Score */}
                                        <div>
                                            <div className="text-xs font-mono-data mb-3" style={{ color: '#6B7280', letterSpacing: '0.06em' }}>SCORE</div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => updateHole(activeHole, 'score', Math.max(1, h.score - 1))}
                                                    className="w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-150"
                                                    style={{ background: 'rgba(255,255,255,0.06)', color: '#F5F5F0', border: '1px solid rgba(255,255,255,0.08)' }}
                                                >−</button>
                                                <div className="font-display font-bold text-2xl w-8 text-center" style={{ color: '#F5F5F0' }}>{h.score}</div>
                                                <button
                                                    onClick={() => updateHole(activeHole, 'score', Math.min(12, h.score + 1))}
                                                    className="w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-150"
                                                    style={{ background: 'rgba(255,255,255,0.06)', color: '#F5F5F0', border: '1px solid rgba(255,255,255,0.08)' }}
                                                >+</button>
                                            </div>
                                        </div>

                                        {/* Putts */}
                                        <div>
                                            <div className="text-xs font-mono-data mb-3" style={{ color: '#6B7280', letterSpacing: '0.06em' }}>PUTTS</div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => updateHole(activeHole, 'putts', Math.max(0, h.putts - 1))}
                                                    className="w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold"
                                                    style={{ background: 'rgba(255,255,255,0.06)', color: '#F5F5F0', border: '1px solid rgba(255,255,255,0.08)' }}
                                                >−</button>
                                                <div className="font-display font-bold text-2xl w-8 text-center" style={{ color: '#F5F5F0' }}>{h.putts}</div>
                                                <button
                                                    onClick={() => updateHole(activeHole, 'putts', Math.min(6, h.putts + 1))}
                                                    className="w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold"
                                                    style={{ background: 'rgba(255,255,255,0.06)', color: '#F5F5F0', border: '1px solid rgba(255,255,255,0.08)' }}
                                                >+</button>
                                            </div>
                                        </div>

                                        {/* GIR */}
                                        <div>
                                            <div className="text-xs font-mono-data mb-3" style={{ color: '#6B7280', letterSpacing: '0.06em' }}>GREENS</div>
                                            <button
                                                onClick={() => updateHole(activeHole, 'gir', !h.gir)}
                                                className="w-full py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                                                style={{
                                                    background: h.gir ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.04)',
                                                    color: h.gir ? '#4ADE80' : '#6B7280',
                                                    border: h.gir ? '1px solid rgba(74,222,128,0.3)' : '1px solid rgba(255,255,255,0.06)',
                                                }}
                                            >
                                                {h.gir ? 'GIR ✓' : 'Missed'}
                                            </button>
                                        </div>
                                    </div>

                                    {h.par !== 3 && (
                                        <div>
                                            <div className="text-xs font-mono-data mb-2" style={{ color: '#6B7280', letterSpacing: '0.06em' }}>FAIRWAY</div>
                                            <div className="flex gap-2">
                                                {[true, false].map(val => (
                                                    <button
                                                        key={String(val)}
                                                        onClick={() => updateHole(activeHole, 'fairway', val)}
                                                        className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                                                        style={{
                                                            background: h.fairway === val ? (val ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)') : 'rgba(255,255,255,0.04)',
                                                            color: h.fairway === val ? (val ? '#4ADE80' : '#F87171') : '#6B7280',
                                                            border: h.fairway === val ? `1px solid ${val ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}` : '1px solid rgba(255,255,255,0.06)',
                                                        }}
                                                    >
                                                        {val ? 'Hit ✓' : 'Missed'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-3 mt-6">
                                        <button
                                            disabled={activeHole === 0}
                                            onClick={() => setActiveHole(p => p - 1)}
                                            className="flex-1 py-2.5 rounded-full text-sm font-medium transition-all duration-200"
                                            style={{ background: 'rgba(255,255,255,0.06)', color: '#A3A89E', border: '1px solid rgba(255,255,255,0.08)', opacity: activeHole === 0 ? 0.3 : 1 }}
                                        >← Prev</button>
                                        {activeHole < 17 ? (
                                            <button
                                                onClick={() => setActiveHole(p => p + 1)}
                                                className="flex-1 py-2.5 rounded-full text-sm font-medium transition-all duration-200"
                                                style={{ background: '#4ADE80', color: '#0A0C09' }}
                                            >Next →</button>
                                        ) : (
                                            <button
                                                onClick={() => setStep('review')}
                                                className="flex-1 py-2.5 rounded-full text-sm font-semibold transition-all duration-200"
                                                style={{ background: '#4ADE80', color: '#0A0C09' }}
                                            >Review round →</button>
                                        )}
                                    </div>
                                </div>
                            )
                        })()}

                        <button
                            onClick={() => setStep('review')}
                            className="w-full py-3 rounded-full text-sm font-semibold transition-all duration-200"
                            style={{ background: '#4ADE80', color: '#0A0C09' }}
                        >
                            Review & save round →
                        </button>
                    </div>
                )}

                {/* ── STEP: REVIEW ── */}
                {step === 'review' && (
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h1 className="font-display font-bold" style={{ fontSize: '2rem', letterSpacing: '-0.02em', color: '#F5F5F0' }}>Review your round</h1>
                            <button onClick={() => setStep('scorecard')} className="text-xs" style={{ color: '#6B7280' }}>← Edit</button>
                        </div>
                        <p className="text-sm mb-8" style={{ color: '#6B7280' }}>{selectedCourse?.name} · {date}</p>

                        {/* Summary stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                            {[
                                { label: 'Score', value: String(totalScore), color: '#F5F5F0' },
                                { label: 'vs Par', value: `${diff > 0 ? '+' : ''}${diff}`, color: diff <= 0 ? '#4ADE80' : '#F59E0B' },
                                { label: 'Putts', value: String(totalPutts), color: '#A3A89E' },
                                { label: 'GIR', value: `${totalGIR}/18`, color: '#60A5FA' },
                            ].map(s => (
                                <div key={s.label} className="p-4 rounded-xl text-center" style={{ background: '#111410', border: '1px solid rgba(255,255,255,0.06)' }}>
                                    <div className="font-display font-bold text-2xl mb-1" style={{ color: s.color }}>{s.value}</div>
                                    <div className="text-xs font-mono-data" style={{ color: '#6B7280' }}>{s.label}</div>
                                </div>
                            ))}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 mb-8">
                            <label className="text-xs font-mono-data" style={{ color: '#6B7280' }}>
                                SCORE FORMAT
                                <select value={format} onChange={e => setFormat(e.target.value as typeof format)} className="mt-2 w-full rounded-xl px-4 py-3 text-sm" style={{ background: '#111410', border: '1px solid rgba(255,255,255,0.1)', color: '#F5F5F0' }}>
                                    <option value="gross">Gross</option>
                                    <option value="net">Net</option>
                                    <option value="stableford">Stableford</option>
                                </select>
                            </label>
                            <label className="text-xs font-mono-data" style={{ color: '#6B7280' }}>
                                STABLEFORD POINTS (OPTIONAL)
                                <input value={stablefordPoints} onChange={e => setStablefordPoints(e.target.value)} min="0" type="number" placeholder="e.g. 36" className="mt-2 w-full rounded-xl px-4 py-3 text-sm" style={{ background: '#111410', border: '1px solid rgba(255,255,255,0.1)', color: '#F5F5F0', outline: 'none' }} />
                            </label>
                            <label className="text-xs font-mono-data md:col-span-2" style={{ color: '#6B7280' }}>
                                NOTES (OPTIONAL)
                                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add a note about this round" className="mt-2 min-h-24 w-full rounded-xl px-4 py-3 text-sm" style={{ background: '#111410', border: '1px solid rgba(255,255,255,0.1)', color: '#F5F5F0', outline: 'none' }} />
                            </label>
                        </div>

                        {/* Hole grid */}
                        <div className="rounded-2xl overflow-hidden mb-8" style={{ background: '#111410', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div className="px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                <span className="text-xs font-mono-data" style={{ color: '#6B7280', letterSpacing: '0.06em' }}>HOLE BY HOLE</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-max">
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                            <th className="text-left px-4 py-2 text-xs font-mono-data" style={{ color: '#6B7280' }}>HOLE</th>
                                            {holes.map(h => (
                                                <th key={h.hole} className="px-2 py-2 text-xs font-mono-data text-center" style={{ color: '#6B7280' }}>{h.hole}</th>
                                            ))}
                                            <th className="px-4 py-2 text-xs font-mono-data text-center" style={{ color: '#6B7280' }}>TOT</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                            <td className="px-4 py-2 text-xs font-mono-data" style={{ color: '#6B7280' }}>PAR</td>
                                            {holes.map(h => <td key={h.hole} className="px-2 py-2 text-xs font-mono-data text-center" style={{ color: '#6B7280' }}>{h.par}</td>)}
                                            <td className="px-4 py-2 text-xs font-mono-data text-center font-bold" style={{ color: '#A3A89E' }}>{totalPar}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-2 text-xs font-mono-data" style={{ color: '#6B7280' }}>SCORE</td>
                                            {holes.map(h => (
                                                <td key={h.hole} className="px-2 py-2 text-xs font-mono-data text-center font-bold" style={{ color: scoreColor(h.score, h.par) }}>{h.score}</td>
                                            ))}
                                            <td className="px-4 py-2 text-sm font-mono-data text-center font-bold" style={{ color: diff <= 0 ? '#4ADE80' : '#F59E0B' }}>{totalScore}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="p-5 rounded-2xl mb-8" style={{ background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.15)' }}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-semibold mb-1" style={{ color: '#F5F5F0' }}>Ready to save</div>
                                    <div className="text-xs" style={{ color: '#6B7280' }}>Your score will be stored in your account history.</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-display font-bold text-2xl" style={{ color: '#4ADE80' }}>{format}</div>
                                    <div className="text-xs" style={{ color: '#4ADE80' }}>{holes.length} holes</div>
                                </div>
                            </div>
                        </div>

                        {saveError && <div className="mb-4 rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200" role="alert">{saveError}</div>}

                        <div className="flex gap-3">
                            <button
                                onClick={() => setStep('scorecard')}
                                className="flex-1 py-3 rounded-full text-sm font-medium"
                                style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#A3A89E' }}
                            >
                                Edit scores
                            </button>
                            <button
                                onClick={() => void saveRound()}
                                disabled={isSaving}
                                className="flex-1 py-3 rounded-full text-sm font-semibold transition-all duration-200"
                                style={{ background: '#4ADE80', color: '#0A0C09' }}
                                onMouseEnter={e => (e.currentTarget.style.background = '#22C55E')}
                                onMouseLeave={e => (e.currentTarget.style.background = '#4ADE80')}
                            >
                                {isSaving ? 'Saving...' : 'Save round ✓'}
                            </button>
                        </div>
                    </div>
                )}

                {/* ── STEP: SAVED ── */}
                {step === 'saved' && (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(74,222,128,0.12)', border: '2px solid rgba(74,222,128,0.4)' }}>
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                                <path d="M6 16L13 23L26 10" stroke="#4ADE80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h2 className="font-display font-bold text-3xl mb-2" style={{ color: '#F5F5F0', letterSpacing: '-0.02em' }}>Round saved.</h2>
                        <p className="text-base mb-2" style={{ color: '#6B7280' }}>
                            {selectedCourse?.name}
                        </p>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-10" style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}>
                            <span className="font-mono-data font-bold text-lg" style={{ color: diff <= 0 ? '#4ADE80' : '#F59E0B' }}>{diff > 0 ? '+' : ''}{diff}</span>
                            <span className="text-sm" style={{ color: '#6B7280' }}>handicap updating to 9.4</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto mb-10">
                            <div className="p-4 rounded-xl" style={{ background: '#111410', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <div className="font-display font-bold text-2xl mb-0.5" style={{ color: '#F5F5F0' }}>{totalScore}</div>
                                <div className="text-xs font-mono-data" style={{ color: '#6B7280' }}>gross score</div>
                            </div>
                            <div className="p-4 rounded-xl" style={{ background: '#111410', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <div className="font-display font-bold text-2xl mb-0.5" style={{ color: '#A3A89E' }}>{totalPutts}</div>
                                <div className="text-xs font-mono-data" style={{ color: '#6B7280' }}>total putts</div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={() => { setStep('course'); setSelectedCourse(null) }}
                                className="px-6 py-3 rounded-full text-sm font-medium"
                                style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#A3A89E' }}
                            >
                                Log another round
                            </button>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200"
                                style={{ background: '#4ADE80', color: '#0A0C09' }}
                            >
                                Back to dashboard →
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
