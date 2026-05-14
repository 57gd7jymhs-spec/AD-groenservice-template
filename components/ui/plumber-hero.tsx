"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { PhoneCall, MoveRight, Clock, ShieldCheck, BadgeCheck, Banknote, Wrench, Droplets, Zap } from "lucide-react"
import { Button } from "./button"

/* ─── types ─────────────────────────────────────────────────────────────── */
interface TrustItem {
  icon: React.ReactNode
  label: string
}

interface InfoCard {
  icon: React.ReactNode
  text: string
}

/* ─── constants ─────────────────────────────────────────────────────────── */
const ROTATING_WORDS = [
  "lekken",
  "verstoppingen",
  "toiletten",
  "kranen",
  "spoedproblemen",
]

const TRUST_ITEMS: TrustItem[] = [
  { icon: <Clock className="w-4 h-4" />,       label: "24/7 Spoedservice"     },
  { icon: <Zap className="w-4 h-4" />,          label: "Snelle Interventie"    },
  { icon: <BadgeCheck className="w-4 h-4" />,   label: "Erkende Loodgieters"   },
  { icon: <Banknote className="w-4 h-4" />,     label: "Transparante Prijzen"  },
]

const INFO_CARDS: InfoCard[] = [
  { icon: <Clock className="w-4 h-4 text-[#1847ED]" />,       text: "Gemiddelde responstijd: 30–60 min" },
  { icon: <ShieldCheck className="w-4 h-4 text-[#1847ED]" />, text: "Geen verborgen kosten"              },
  { icon: <Zap className="w-4 h-4 text-[#1847ED]" />,         text: "Zelfde dag geholpen"               },
]

/* ─── animation variants ─────────────────────────────────────────────────── */
const fadeUp = {
  hidden:  { opacity: 0, y: 28 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] },
  }),
}

const wordVariants = {
  enter:  { opacity: 0, y: 14, filter: "blur(4px)" },
  center: { opacity: 1, y: 0,  filter: "blur(0px)", transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] } },
  exit:   { opacity: 0, y: -14, filter: "blur(4px)", transition: { duration: 0.28, ease: [0.4, 0, 1, 1] } },
}

/* ─── subcomponents ─────────────────────────────────────────────────────── */

/** Animated scroll progress bar — always at absolute top (z-50) */
function ScrollProgressBar() {
  const { scrollYProgress } = useScroll()
  const width = useTransform(scrollYProgress, [0, 1], ["0%", "100%"])

  return (
    <motion.div
      style={{ width }}
      className="fixed top-0 left-0 h-[3px] bg-[#1847ED] z-50 will-change-transform origin-left"
    />
  )
}

/** Floating rounded navbar */
function FloatingNav() {
  const [scrolled, setScrolled] = useState(false)
  const [navColor, setNavColor] = useState<"transparent" | "glass">("transparent")

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 60)
      setNavColor(y > 60 ? "glass" : "transparent")
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      className={[
        "fixed top-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-5xl",
        "flex items-center justify-between px-4 sm:px-6 py-3",
        "rounded-2xl border transition-all duration-300",
        scrolled
          ? "bg-white/90 backdrop-blur-xl border-slate-200/80 shadow-lg shadow-slate-900/10"
          : "bg-white/70 backdrop-blur-md border-white/60 shadow-md shadow-slate-900/5",
      ].join(" ")}
      aria-label="Hoofdnavigatie"
    >
      {/* Logo */}
      <a href="/" className="flex items-center gap-2 font-bold text-[#0D1E5C] text-lg tracking-tight select-none">
        <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#1847ED] text-white">
          <Droplets className="w-4 h-4" />
        </span>
        <span className="hidden sm:block">Dropwork</span>
      </a>

      {/* Links — hidden on mobile */}
      <ul className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
        {["Diensten", "Reviews", "Over ons"].map((item) => (
          <li key={item}>
            <a
              href={`#${item.toLowerCase().replace(" ", "-")}`}
              className="hover:text-[#1847ED] transition-colors duration-150"
            >
              {item}
            </a>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <a
        href="tel:+3250000000"
        className={[
          "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200",
          scrolled
            ? "bg-[#1847ED] text-white shadow-md shadow-blue-500/30 hover:bg-[#1238C7] hover:-translate-y-0.5"
            : "bg-[#0D1E5C] text-white hover:bg-[#1847ED] hover:-translate-y-0.5",
        ].join(" ")}
        aria-label="Bel ons nu"
      >
        <PhoneCall className="w-4 h-4" />
        <span className="hidden sm:block">+32 500 00 00</span>
        <span className="sm:hidden">Bel</span>
      </a>
    </motion.nav>
  )
}

/** Animated rotating word in headline */
function RotatingWord() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % ROTATING_WORDS.length)
    }, 2000)
    return () => clearInterval(id)
  }, [])

  return (
    <span className="relative inline-block min-w-[220px] sm:min-w-[280px] text-left">
      <AnimatePresence mode="wait">
        <motion.span
          key={ROTATING_WORDS[index]}
          variants={wordVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="block text-[#1847ED]"
        >
          {ROTATING_WORDS[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

/** Desktop floating info card */
function InfoCard() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 32, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
      className="hidden xl:flex flex-col gap-3 bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-900/8 p-5 w-64"
    >
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
        Onze belofte
      </p>
      {INFO_CARDS.map(({ icon, text }, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
            {icon}
          </div>
          <span className="text-sm font-medium text-slate-700 leading-tight">{text}</span>
        </div>
      ))}
    </motion.div>
  )
}

/* ─── main component ─────────────────────────────────────────────────────── */
export function PlumberHero() {
  return (
    <>
      <ScrollProgressBar />
      <FloatingNav />

      <section
        id="hero"
        aria-label="Hero sectie"
        className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[#F7F8FC] pt-28 pb-16 px-4 sm:px-6"
      >
        {/* ── Background accents ──────────────────────────────────────── */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Soft blue orb top-right */}
          <div className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full bg-[#1847ED]/6 blur-3xl" />
          {/* Softer orb bottom-left */}
          <div className="absolute -bottom-24 -left-24 w-[360px] h-[360px] rounded-full bg-sky-400/8 blur-3xl" />
          {/* Subtle grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(#1847ED 1px, transparent 1px), linear-gradient(90deg, #1847ED 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* ── Content ────────────────────────────────────────────────── */}
        <div className="relative z-10 w-full max-w-5xl mx-auto">
          <div className="flex items-center justify-between gap-12">

            {/* Left column */}
            <div className="flex-1 min-w-0">

              {/* Trust badge */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={0.1}
                className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-1.5 mb-8 shadow-sm"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-sm font-medium text-slate-700">
                  Nu beschikbaar — 24/7 spoedservice
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={0.2}
                className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] text-[#0D1E5C] mb-4"
              >
                Problemen met
                <br />
                <RotatingWord />
              </motion.h1>

              {/* Supporting text */}
              <motion.p
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={0.35}
                className="text-lg sm:text-xl text-slate-500 leading-relaxed max-w-xl mb-10"
              >
                Snelle en betrouwbare loodgieter voor herstellingen, ontstoppingen en
                installaties. Transparante prijzen, propere afwerking en snelle service
                bij u in de buurt.
              </motion.p>

              {/* CTA buttons */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={0.45}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-12"
              >
                {/* Primary */}
                <a
                  href="tel:+3250000000"
                  className="group inline-flex items-center justify-center gap-3 bg-[#1847ED] text-white font-bold text-lg px-8 py-4 rounded-xl shadow-xl shadow-blue-500/30 hover:bg-[#1238C7] hover:-translate-y-0.5 hover:shadow-blue-500/40 transition-all duration-200 active:translate-y-0"
                  aria-label="Bel ons nu op +32 500 00 00"
                >
                  <PhoneCall className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" />
                  Bel Nu
                  <span className="hidden sm:block text-sm font-normal opacity-80">+32 500 00 00</span>
                </a>

                {/* Secondary */}
                <a
                  href="#contact"
                  className="group inline-flex items-center justify-center gap-2 border-2 border-slate-200 text-slate-700 font-semibold text-base px-7 py-4 rounded-xl hover:border-[#1847ED] hover:text-[#1847ED] hover:-translate-y-0.5 transition-all duration-200 bg-white"
                >
                  Vraag Service Aan
                  <MoveRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                </a>
              </motion.div>

              {/* Trust indicators */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={0.55}
                className="flex flex-wrap gap-x-6 gap-y-3"
              >
                {TRUST_ITEMS.map(({ icon, label }, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-sm font-medium text-slate-500"
                  >
                    <span className="text-[#1847ED]">{icon}</span>
                    {label}
                  </div>
                ))}
              </motion.div>

            </div>

            {/* Right column — floating info card (desktop only) */}
            <InfoCard />

          </div>
        </div>

        {/* ── Bottom stat strip ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-5xl mx-auto mt-16 pt-8 border-t border-slate-200"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { value: "45 min", label: "Gem. aankomsttijd" },
              { value: "4.800+", label: "Voltooide klussen" },
              { value: "15 jr",  label: "Ervaring"          },
              { value: "100%",   label: "Tevredenheid"       },
            ].map(({ value, label }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.2 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col"
              >
                <span className="text-3xl font-extrabold text-[#0D1E5C] tracking-tight">
                  {value}
                </span>
                <span className="text-sm text-slate-400 mt-0.5">{label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
    </>
  )
}

export default PlumberHero
