import React, { useEffect, useState, useRef } from 'react'
import './App.css'
import brandLogo from './assets/brand-logo.svg'
import heroImage from './assets/hero-image.svg'
import avatar1 from './assets/avatar-1.svg'
import avatar2 from './assets/avatar-2.svg'
import avatar3 from './assets/avatar-3.svg'
import { RulesAndFormModal } from './components/RegistrationForm'

function Header({ onRegister }) {
  const [open, setOpen] = useState(false)

  function handleRegisterClick(e) {
    e.preventDefault()
    // only scroll to register section; do not auto-increment
    const el = document.getElementById('register')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
    setOpen(false)
  }

  function handleNav(e, id) {
    e.preventDefault()
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
    setOpen(false)
  }

  return (
    <header className={`site-header ${open ? 'open' : ''}`}>
      <div className="brand">
        <img src={brandLogo} alt="brand" className="brand-logo" />
      </div>

      <nav className="nav">
        <a href="#home" className="nav-link" onClick={(e)=>handleNav(e,'home')}>Home</a>
        <a href="#about" className="nav-link" onClick={(e)=>handleNav(e,'about')}>About us</a>
        <a href="#register" className="nav-link register-link" onClick={handleRegisterClick}>Register</a>
      </nav>

      <button className="menu-btn" aria-label="menu" onClick={() => setOpen((v) => !v)}>
        <svg width="26" height="18" viewBox="0 0 26 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="26" height="3" rx="1.5" fill="#C23B3B"/>
          <rect y="7.5" width="26" height="3" rx="1.5" fill="#C23B3B"/>
          <rect y="15" width="26" height="3" rx="1.5" fill="#C23B3B"/>
        </svg>
        <span className="menu-label">menu</span>
      </button>
    </header>
  )
}

function Hero() {
  return (
    <section id="home" className="hero">
      <div className="hero-media">
        <img src={heroImage} alt="hero" />
      </div>
      <div className="hero-title">Glimpse of Youth seminar 1.0</div>
      <div className="dots">
        <span />
        <span />
        <span />
      </div>
    </section>
  )
}

function Quote() {
  return (
    <section className="quote">
      <p className="quote-text">Good habits formed at youth make all the difference.</p>
      <p className="quote-author">Aristotle</p>
    </section>
  )
}

function About({ onOpenForm }) {
  return (
    <section id="about" className="about">
      <h3>About youth seminar</h3>
      <p className="about-desc">Join us for an engaging set of talks, workshops and networking for youth leaders.</p>
      <div id="register" className="register-wrap">
        <button className="register" onClick={onOpenForm}>Register</button>
      </div>
    </section>
  )
}

function StatsCard({ value, targetDate }) {
  const [display, setDisplay] = useState(0)
  const startRef = useRef(null)

  // registration count animation (left side)
  useEffect(() => {
    const start = performance.now()
    const from = display
    const to = value
    const duration = 900

    function tick(now) {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - (1 - t) * (1 - t)
      const current = Math.round(from + (to - from) * eased)
      setDisplay(current)
      if (t < 1) startRef.current = requestAnimationFrame(tick)
    }

    if (startRef.current) cancelAnimationFrame(startRef.current)
    startRef.current = requestAnimationFrame(tick)

    return () => {
      if (startRef.current) cancelAnimationFrame(startRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  // countdown to targetDate (right side)
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 })

  useEffect(() => {
    if (!targetDate) return
    const target = new Date(targetDate).getTime()
    function update() {
      const now = Date.now()
      const diff = Math.max(0, target - now)
      const secsTotal = Math.floor(diff / 1000)
      const days = Math.floor(secsTotal / 86400)
      const hours = Math.floor((secsTotal % 86400) / 3600)
      const mins = Math.floor((secsTotal % 3600) / 60)
      const secs = secsTotal % 60
      setTimeLeft({ days, hours, mins, secs })
    }

    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [targetDate])

  function two(n) { return String(n).padStart(2, '0') }

  return (
    <section className="stats-card" aria-live="polite">
      <div className="stats-left">
        <div className="stats-title">Total registered</div>
        <div className="stats-number">{display}<span className="plus">+</span></div>
      </div>
      <div className="divider" />
      <div className="stats-right">
        <div className="stats-title">Time Left</div>
        <div className="stats-sub" aria-hidden={false}>
          {timeLeft.days > 0 ? (
            <div className="time-large">{timeLeft.days}d</div>
          ) : null}
          <div className="time-row">{two(timeLeft.hours)}:{two(timeLeft.mins)}:{two(timeLeft.secs)}</div>
        </div>
      </div>
    </section>
  )
}

function Speakers() {
  const people = [
    { id: 1, name: 'Aisha Khan', img: avatar1 },
    { id: 2, name: 'David Lee', img: avatar2 },
    { id: 3, name: 'Maria Gomez', img: avatar3 },
  ]

  return (
    <section className="speakers">
      <h4>Our Speakers</h4>
      <div className="speaker-list">
        {people.map((p) => (
          <div key={p.id} className="speaker-card">
            <img src={p.img} alt={p.name} className="speaker-thumb" />
            <div className="speaker-name">{p.name}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

function Footer() {
  const socials = [
    { id: 'twitter', href: 'https://twitter.com', label: 'Twitter', svg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 5.92c-.66.3-1.37.52-2.12.61.76-.46 1.34-1.18 1.61-2.04-.71.42-1.5.72-2.34.88A3.6 3.6 0 0 0 11.5 9.5c0 .28.03.56.09.82-3-.15-5.67-1.6-7.46-3.8-.31.53-.49 1.15-.49 1.8 0 1.24.63 2.33 1.6 2.97-.59-.02-1.15-.18-1.64-.45v.05c0 1.73 1.22 3.17 2.84 3.5-.3.08-.61.12-.94.12-.23 0-.45-.02-.67-.06.45 1.42 1.76 2.46 3.32 2.49A7.24 7.24 0 0 1 3 19.54 10.2 10.2 0 0 0 8.63 21c6.53 0 10.1-5.92 10.1-11.05v-.5A7.4 7.4 0 0 0 22 5.92z" fill="#111"/></svg>
    ) },
    { id: 'facebook', href: 'https://facebook.com', label: 'Facebook', svg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.99 3.66 9.12 8.44 9.88v-6.99H8.9v-2.9h1.54V9.41c0-1.52.9-2.36 2.28-2.36.66 0 1.35.12 1.35.12v1.49h-.76c-.75 0-.98.47-.98.95v1.15h1.67l-.27 2.9h-1.4v6.99C18.34 21.12 22 16.99 22 12z" fill="#111"/></svg>
    ) },
    { id: 'instagram', href: 'https://instagram.com', label: 'Instagram', svg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 6.2A4.8 4.8 0 1 0 16.8 13 4.8 4.8 0 0 0 12 8.2zm6.5-.8a1.2 1.2 0 1 0 1.2 1.2 1.2 1.2 0 0 0-1.2-1.2z" fill="#111"/></svg>
    ) },
    { id: 'linkedin', href: 'https://linkedin.com', label: 'LinkedIn', svg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 3A2 2 0 0 1 21 5v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zM8.5 17H6V10h2.5v7zM7.3 8.7A1.3 1.3 0 1 0 6 7.4 1.3 1.3 0 0 0 7.3 8.7zM18 17h-2.4v-3.8c0-.9-.3-1.5-1.1-1.5-.6 0-.9.4-1 1v4.3H10V10h2.3v1c.3-.6 1-1.3 2.4-1.3 1.5 0 2.6 1 2.6 3.3V17z" fill="#111"/></svg>
    ) }
  ]

  return (
    <footer className="site-footer">
      <p>For more detail follow our social media</p>
      <div className="social-list" role="navigation" aria-label="social links">
        {socials.map(s => (
          <a key={s.id} className="social-btn" href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
            <span className="sr-only">{s.label}</span>
            {s.svg}
          </a>
        ))}
      </div>
    </footer>
  )
}

export default function App() {
  const [registered, setRegistered] = useState(120)
  const [showReg, setShowReg] = useState(false)

  function handleRegister() {
    setRegistered((s) => s + 1)
  }

  function handleOpenForm() { setShowReg(true) }
  function handleCloseForm() { setShowReg(false) }
  function handleFormSubmit(values) {
    // here you could send values to server; we increment count and close modal
    setRegistered(s=>s+1)
    setShowReg(false)
    // optionally: store submission in localStorage or show toast
  }

  return (
    <div className="app-root white-theme">
      <Header onRegister={handleRegister} />
      <main>
        <Hero />
        <Quote />
        <About onOpenForm={handleOpenForm} />
        <StatsCard value={registered} targetDate={'2026-11-01T00:00:00'} />
        <Speakers />
      </main>
      <Footer />
      <RulesAndFormModal open={showReg} onClose={handleCloseForm} onSubmit={handleFormSubmit} />
    </div>
  )
}
