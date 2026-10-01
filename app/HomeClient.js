"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight, CalendarDays, Check, ExternalLink, Heart, Loader2,
  LockKeyhole, MessageCircle, Newspaper, Plus, Quote, Share2, ShieldCheck,
} from "lucide-react";
import { saveFundraiserReminder } from "@/lib/apis/SorteoActions";
import supportersData from "@/lib/data/supporters.json";
import { HOME_COPY } from "@/lib/homeTranslations";

const GOFUNDME_URL = "https://gofund.me/6a6cdc572";
const MAXIMUM_REMINDER_DATE = "2027-12-31";

function getTodayInSantoDomingo() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Santo_Domingo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

  return `${values.year}-${values.month}-${values.day}`;
}

function DonateButton({ label, className = "", compact = false }) {
  return (
    <a href={GOFUNDME_URL} target="_blank" rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-[#f5c451] font-black text-[#112b25] shadow-[0_14px_40px_rgba(245,196,81,.22)] transition hover:-translate-y-0.5 hover:bg-[#ffd777] focus:outline-none focus:ring-4 focus:ring-[#f5c451]/30 ${compact ? "px-5 py-3 text-sm" : "px-7 py-4 text-base sm:px-9"} ${className}`}>
      {label} <ArrowRight className="h-5 w-5" aria-hidden="true" />
    </a>
  );
}

function SectionHeading({ eyebrow, title, subtitle }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {eyebrow && <p className="mb-3 text-xs font-black uppercase tracking-[0.24em] text-blue-400">{eyebrow}</p>}
      <h2 className="text-balance text-3xl font-black tracking-[-0.045em] text-white sm:text-5xl">{title}</h2>
      {subtitle && <p className="mt-4 text-lg leading-8 text-blue-100/60">{subtitle}</p>}
    </div>
  );
}

export default function HomeClient({ campaignProgress, locale = "es" }) {
  const copy = HOME_COPY[locale] || HOME_COPY.es;
  const supporters = supportersData;
  const raisedPercentage = Math.round(campaignProgress.totalPercentage);
  const remainingPercentage = 100 - raisedPercentage;
  const minimumDate = useMemo(() => getTodayInSantoDomingo(), []);
  const [minimumYear, minimumMonth, minimumDay] = minimumDate.split("-").map(Number);
  const [visibleCount, setVisibleCount] = useState(7);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [reminderYear, setReminderYear] = useState(String(minimumYear));
  const [reminderMonth, setReminderMonth] = useState("");
  const [reminderDay, setReminderDay] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formState, setFormState] = useState({ type: "idle", message: "" });
  const [pressImageMissing, setPressImageMissing] = useState(false);
  const [acceptanceImageMissing, setAcceptanceImageMissing] = useState(false);

  const reminderDate = reminderYear && reminderMonth && reminderDay
    ? `${reminderYear}-${reminderMonth.padStart(2, "0")}-${reminderDay.padStart(2, "0")}`
    : "";
  const daysInSelectedMonth = reminderYear && reminderMonth
    ? new Date(Number(reminderYear), Number(reminderMonth), 0).getDate()
    : 0;

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const handleReminderSubmit = async (event) => {
    event.preventDefault();
    setFormState({ type: "idle", message: "" });
    if (!name.trim() || !phone.trim() || !reminderDate) {
      setFormState({ type: "error", message: copy.requiredError });
      return;
    }
    if (
      reminderDate < minimumDate
      || reminderDate > MAXIMUM_REMINDER_DATE
      || !/^(2026|2027)-\d{2}-\d{2}$/.test(reminderDate)
    ) {
      setFormState({ type: "error", message: copy.dateError });
      return;
    }
    setSubmitting(true);
    try {
      await saveFundraiserReminder({ name: name.trim(), phone: phone.trim(), reminderDate });
      setName(""); setPhone(""); setReminderYear(String(minimumYear)); setReminderMonth(""); setReminderDay("");
      setFormState({ type: "success", message: copy.reminderSuccess });
    } catch (error) {
      console.error(error);
      setFormState({ type: "error", message: copy.reminderError });
    } finally { setSubmitting(false); }
  };

  const handleShare = async () => {
    const shareData = {
      title: copy.shareTitle,
      text: copy.shareText,
      url: window.location.href,
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(window.location.href);
        setFormState({ type: "success", message: copy.copied });
      }
    } catch (error) {
      if (error?.name !== "AbortError") console.error(error);
    }
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0a192f] text-white selection:bg-[#f5c451] selection:text-[#0a192f]">
      <nav className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8">
          <a href="#inicio" className="flex items-center gap-3 font-black tracking-tight text-white">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[#f5c451] text-[#112b25]">M</span>
            <span>Michael Eusebio</span>
          </a>
          <DonateButton label={copy.donate} compact className="hidden sm:inline-flex" />
        </div>
      </nav>

      <header id="inicio" className="relative isolate bg-[#0a192f] px-5 pb-20 pt-32 text-white sm:px-8 sm:pb-28 sm:pt-40">
        <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
          <div className="absolute -left-32 -top-36 h-[34rem] w-[34rem] rounded-full bg-blue-600/20 blur-[130px]" />
          <div className="absolute -right-24 top-10 h-[30rem] w-[30rem] rounded-full bg-blue-400/10 blur-[120px]" />
          <div className="absolute bottom-0 left-0 h-40 w-full bg-gradient-to-t from-black/10 to-transparent" />
        </div>
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.18fr_.82fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-bold text-[#f7d98e]">
              <Heart className="h-4 w-4" fill="currentColor" aria-hidden="true" /> {copy.heroEyebrow}
            </div>
            <h1 className="max-w-4xl text-balance text-4xl font-black leading-[1.04] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              {copy.heroBefore}<span className="text-[#f5c451]">{copy.heroVision}</span>{copy.heroAfter}
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-white/72 sm:text-xl sm:leading-9">
              {copy.heroDescription}
            </p>
            <div className="mt-9 flex flex-col items-start gap-3">
              <DonateButton label={copy.donate} />
              <p className="pl-2 text-sm text-white/60">{copy.heroMicrocopy}</p>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="absolute -inset-5 rotate-3 rounded-[2.25rem] border border-[#f5c451]/30" aria-hidden="true" />
            <img src="/EXCELENTE FOTO MÍA.png" alt={copy.heroAlt} className="relative aspect-[4/5] w-full rounded-[2rem] object-cover object-top shadow-2xl" />
            <div className="absolute -bottom-6 -left-4 max-w-[15rem] rounded-2xl bg-[#f5c451] p-5 text-[#112b25] shadow-xl sm:-left-8">
              <p className="text-3xl font-black">57%</p><p className="mt-1 text-sm font-bold leading-5">{copy.raised}</p>
            </div>
          </div>
        </div>
      </header>

      <div aria-hidden="true" className="relative h-4 md:h-6 bg-[#081426]">
        <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-blue-400/10 to-transparent" />
      </div>

      {/* CAMPAIGN PROGRESS */}
      <section className="relative px-6 pt-[72px] pb-20" aria-labelledby="campaign-progress-title">
        <div className="max-w-[1120px] mx-auto rounded-3xl border border-white/10 bg-white/[0.05] p-6 md:p-8 shadow-2xl shadow-blue-950/30">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-400">{copy.progressEyebrow}</p>
              <h2 id="campaign-progress-title" className="mt-2 text-2xl md:text-3xl font-black text-white">
                {copy.progressTitle.replace('{percentage}', raisedPercentage)}
              </h2>
            </div>
            <div className="sm:text-right">
              <p className="text-4xl md:text-5xl font-black tabular-nums text-blue-200">
                {remainingPercentage}%
              </p>
              <p className="mt-1 text-xs font-black uppercase tracking-widest text-white/40">
                {copy.progressRemaining}
              </p>
            </div>
          </div>

          <div
            className="mt-6 h-5 overflow-hidden rounded-full border border-white/10 bg-slate-950/70 p-1"
            role="progressbar"
            aria-label={copy.progressAria}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={raisedPercentage}
          >
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${Math.min(raisedPercentage, 100)}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="h-full rounded-full bg-amber-400 shadow-[0_0_24px_rgba(251,191,36,0.35)]"
            />
          </div>
          <div className="mt-3 flex justify-between text-xs font-bold text-white/40">
            <span>{copy.progressStart}</span>
            <span>{copy.progressGoal}</span>
          </div>
        </div>
      </section>

      <section className="bg-[#050b16] px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <SectionHeading eyebrow={copy.aboutEyebrow} title={copy.aboutTitle} />
          <div className="mt-10 overflow-hidden rounded-[2rem] bg-black shadow-2xl">
            <video className="aspect-video w-full" controls preload="metadata" playsInline><source src="/blind_coder_viral.mp4" type="video/mp4" />{copy.videoFallback}</video>
          </div>
          <div className="mt-8 text-center"><DonateButton label={copy.donate} /></div>
        </div>
      </section>

      <section className="bg-[#071120] px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow={copy.supportersEyebrow} title={copy.supportersTitle} subtitle={copy.supportersSubtitle} />
          {supporters.length > 0 ? (
            <div className="relative mt-12 group">
              <div className="no-scrollbar flex snap-x gap-6 overflow-x-auto pb-8">
                {supporters.slice(0, visibleCount).map((supporter, index) => (
                  <motion.article
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={`${supporter.owner_name}-${index}`}
                    className="group/card flex min-w-[300px] snap-center flex-col gap-4 rounded-[2.5rem] border border-white/10 bg-white/5 p-8 transition-all hover:border-blue-500/30 md:min-w-[400px]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold tracking-tight text-white">{supporter.owner_name || copy.supporterFallback}</span>
                      <Quote className="h-5 w-5 text-blue-500/30 transition-colors group-hover/card:text-blue-400" />
                    </div>
                    <p className="text-lg italic leading-relaxed text-blue-100/70">“{locale === 'en' ? (supporter.support_reason_en || supporter.support_reason) : supporter.support_reason}”</p>
                  </motion.article>
                ))}

                {visibleCount < supporters.length && (
                  <div className="flex min-w-[200px] items-center px-4">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((previous) => previous + 7)}
                      className="flex h-full max-h-[100px] w-full flex-col items-center justify-center gap-3 rounded-[2rem] border border-blue-500/20 bg-blue-600/10 text-[10px] font-black uppercase tracking-widest text-blue-400 transition-all hover:bg-blue-600/20"
                    >
                      <Plus className="h-5 w-5" />
                      {copy.showMore}
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-center gap-2" aria-hidden="true">
                <div className="h-1 w-12 rounded-full bg-blue-600" />
                <div className="h-1 w-4 rounded-full bg-white/10" />
                <div className="h-1 w-4 rounded-full bg-white/10" />
              </div>
            </div>
          ) : (
            <p className="mx-auto mt-12 max-w-xl rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-blue-100/60">{copy.noMessages}</p>
          )}
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#050b16] px-5 py-20 sm:px-8 sm:py-28">
        <div className="pointer-events-none absolute right-[-10rem] top-0 h-96 w-96 rounded-full bg-blue-600/10 blur-[110px]" aria-hidden="true" />
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-3 shadow-xl">
            {pressImageMissing ? <div className="grid aspect-[4/3] place-items-center rounded-[1.4rem] bg-slate-900 p-8 text-center"><div><Newspaper className="mx-auto h-12 w-12 text-blue-400" aria-hidden="true" /><p className="mt-4 font-bold text-blue-100/60">{copy.pressPlaceholder}</p></div></div>
            : <img src="/news_article_aboutme.jpg" alt={copy.pressAlt} className="aspect-[4/3] w-full rounded-[1.4rem] object-cover object-top" onError={() => setPressImageMissing(true)} />}
          </div>
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-[0.24em] text-blue-400">{copy.pressEyebrow}</p><h2 className="text-4xl font-black tracking-[-0.045em] text-white sm:text-5xl">{copy.pressTitle}</h2>
            <p className="mt-5 text-lg leading-8 text-blue-100/60">{copy.pressDescription}</p>
            <a href="https://elnacional.com.do/opinion/michael-eusebio-talento-ia_575906.html" target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 font-black text-blue-400 underline decoration-2 underline-offset-4 transition hover:text-white">{copy.pressLink} <ExternalLink className="h-4 w-4" aria-hidden="true" /></a>
            <div className="mt-8"><DonateButton label={copy.donate} /></div>
          </div>
        </div>
      </section>

      <section id="recordatorio" className="relative overflow-hidden bg-[#0a192f] px-5 py-20 text-white sm:px-8 sm:py-28">
        <div className="pointer-events-none absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-blue-600/15 blur-[120px]" aria-hidden="true" />
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
          <div><p className="mb-3 text-xs font-black uppercase tracking-[0.24em] text-[#f5c451]">{copy.reminderEyebrow}</p><h2 className="text-balance text-4xl font-black tracking-[-0.045em] sm:text-5xl">{copy.reminderTitle}</h2><p className="mt-5 text-lg leading-8 text-white/65">{copy.reminderDescription}</p></div>
          <div className="relative rounded-[2rem] border border-white/10 bg-[#0b1f3a] p-6 text-white shadow-2xl sm:p-9">
            <form onSubmit={handleReminderSubmit} className="grid gap-5 sm:grid-cols-2">
              <label className="block"><span className="mb-2 block text-sm font-black">{copy.nameLabel}</span><input type="text" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" placeholder={copy.namePlaceholder} className="w-full rounded-xl border border-white/10 bg-[#071526] px-4 py-3.5 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/15" required /></label>
              <label className="block"><span className="mb-2 block text-sm font-black">{copy.phoneLabel}</span><input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" inputMode="tel" placeholder={copy.phonePlaceholder} className="w-full rounded-xl border border-white/10 bg-[#071526] px-4 py-3.5 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/15" required /></label>
              <fieldset className="sm:col-span-2">
                <legend className="mb-2 flex items-center gap-2 text-sm font-black"><CalendarDays className="h-5 w-5 text-slate-400" aria-hidden="true" />{copy.dateLabel}</legend>
                <div className="grid grid-cols-3 gap-3">
                  <label className="block"><span className="sr-only">{copy.monthLabel}</span><select value={reminderMonth} onChange={(event) => { setReminderMonth(event.target.value); setReminderDay(""); }} aria-label={copy.monthLabel} className="w-full rounded-xl border border-white/10 bg-[#071526] px-3 py-3.5 text-white outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/15" required><option value="">{copy.monthLabel}</option>{copy.months.map((month, index) => { const monthNumber = index + 1; const isPastMonth = Number(reminderYear) === minimumYear && monthNumber < minimumMonth; return <option key={month} value={String(monthNumber)} disabled={isPastMonth}>{month}</option>; })}</select></label>
                  <label className="block"><span className="sr-only">{copy.dayLabel}</span><select value={reminderDay} onChange={(event) => setReminderDay(event.target.value)} aria-label={copy.dayLabel} disabled={!reminderMonth} className="w-full rounded-xl border border-white/10 bg-[#071526] px-3 py-3.5 text-white outline-none transition disabled:cursor-not-allowed disabled:opacity-50 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/15" required><option value="">{copy.dayLabel}</option>{Array.from({ length: daysInSelectedMonth }, (_, index) => index + 1).map((day) => { const isPastDay = Number(reminderYear) === minimumYear && Number(reminderMonth) === minimumMonth && day < minimumDay; return <option key={day} value={String(day)} disabled={isPastDay}>{day}</option>; })}</select></label>
                  <label className="block"><span className="sr-only">{copy.yearLabel}</span><select value={reminderYear} onChange={(event) => { setReminderYear(event.target.value); setReminderMonth(""); setReminderDay(""); }} aria-label={copy.yearLabel} className="w-full rounded-xl border border-white/10 bg-[#071526] px-3 py-3.5 text-white outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/15" required>{[2026, 2027].filter((year) => year >= minimumYear).map((year) => <option key={year} value={String(year)}>{year}</option>)}</select></label>
                </div>
              </fieldset>
              {formState.message && <p className={`sm:col-span-2 text-sm font-bold ${formState.type === "error" ? "text-red-700" : "text-emerald-700"}`} role="status">{formState.message}</p>}
              <button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#f5c451] px-6 py-4 font-black transition hover:bg-[#ffd777] disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2">{submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <MessageCircle className="h-5 w-5" />}{submitting ? copy.saving : copy.remindMe}</button>
            </form>
            <div className="mt-7 border-t border-white/10 pt-6 text-center"><p className="text-sm text-blue-100/60">{copy.sharePrompt}</p><button type="button" onClick={handleShare} className="mt-4 inline-flex items-center gap-2 rounded-full border-2 border-blue-400 px-6 py-3 text-sm font-black text-blue-300 transition hover:bg-blue-600 hover:text-white"><Share2 className="h-4 w-4" aria-hidden="true" /> {copy.shareButton}</button></div>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <SectionHeading eyebrow={copy.transparencyEyebrow} title={copy.transparencyTitle} subtitle={copy.transparencySubtitle} />
          <div className="mt-12 grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-sm">
              {acceptanceImageMissing ? (
                <div className="grid min-h-[25rem] place-items-center p-8 text-center">
                  <div><ShieldCheck className="mx-auto h-14 w-14 text-blue-400" aria-hidden="true" /><h3 className="mt-5 text-xl font-black text-white">{copy.acceptanceTitle}</h3><p className="mt-2 max-w-sm text-blue-100/60">{copy.acceptancePlaceholder}</p></div>
                </div>
              ) : (
                <img src="/carta_colorado.jpg" alt={copy.acceptanceAlt} className="min-h-[25rem] w-full object-cover object-top" onError={() => setAcceptanceImageMissing(true)} />
              )}
            </div>
            <div className="space-y-4">
              {copy.faq.map(({ q, a }, index) => {
                const Icon = [Check, LockKeyhole, Heart][index];
                return <article key={q} className="flex gap-5 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-7"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-blue-500/15 text-blue-400"><Icon className="h-5 w-5" aria-hidden="true" /></span><div><h3 className="text-lg font-black text-white">{q}</h3><p className="mt-2 leading-7 text-blue-100/60">{a}</p></div></article>;
              })}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#050b16] px-5 pb-28 pt-12 text-center sm:px-8 sm:pb-12">
        <p className="text-sm text-blue-100/60">{copy.contact}</p><a href="mailto:michaeleusebiodelorbe@gmail.com" className="mt-2 inline-block font-black text-white underline decoration-[#f5c451] decoration-4 underline-offset-4">michaeleusebiodelorbe@gmail.com</a><p className="mt-8 text-xs text-slate-600">© 2026 Michael Eusebio · Menos Millas Universitarias</p>
      </footer>
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#0a192f]/95 p-3 shadow-[0_-8px_30px_rgba(0,0,0,.3)] backdrop-blur sm:hidden"><DonateButton label={copy.donate} compact className="w-full" /></div>
    </main>
  );
}
