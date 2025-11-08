import React, { useState, useRef, useEffect } from 'react'
import { stripePromise } from '../stripe-config'

export function RulesAndFormModal({ open, onClose, onSubmit }) {
  const [accepted, setAccepted] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (!open) {
      setAccepted(false)
      setShowForm(false)
    }
  }, [open])

  function handleContinue() {
    if (accepted) setShowForm(true)
  }

  return (
    <div className={`modal ${open ? 'open' : ''}`} role="dialog" aria-modal="true">
      <div className="modal-sheet">
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        {!showForm ? (
          <div className="rules">
            <h3>Rules & Regulations</h3>
            <div className="rules-body">
              <p>Please read the rules carefully before registering:</p>
              <ul>
                <li>Be respectful to other attendees.</li>
                <li>Arrive on time and follow event instructions.</li>
                <li>Participants must be at least 13 years old.</li>
                <li>Payment must be completed to confirm registration.</li>
              </ul>
            </div>
            <label className="rules-accept"><input type="checkbox" checked={accepted} onChange={(e)=>setAccepted(e.target.checked)} /> I accept the rules and regulations</label>
            <div style={{marginTop:16}}>
              <button className="register" onClick={handleContinue} disabled={!accepted}>Continue to form</button>
            </div>
          </div>
        ) : (
          <RegistrationForm onCancel={onClose} onSubmit={onSubmit} />
        )}
      </div>
    </div>
  )
}

export function RegistrationForm({ onCancel, onSubmit }) {
  const [values, setValues] = useState({ firstName:'', middleName:'', lastName:'', email:'', dob:'', address:'' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState('idle') // idle, processing, succeeded, error
  const [paymentMethod, setPaymentMethod] = useState('card') // card, upi, phonepay
  const [upiId, setUpiId] = useState('')
  const [paymentIntent, setPaymentIntent] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const stripe = useRef(null)
  const elements = useRef(null)

  useEffect(() => {
    async function initializeStripe() {
      stripe.current = await stripePromise;
    }
    initializeStripe();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target
    setValues(v=> ({...v, [name]: value}))
  }

  function validate() {
    const errs = {}
    if (!values.firstName.trim()) errs.firstName = 'First name is required'
    if (!values.lastName.trim()) errs.lastName = 'Last name is required'
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email)) errs.email = 'Valid email required'
    if (!values.dob) errs.dob = 'Date of birth required'
    else {
      const dob = new Date(values.dob)
      const age = Math.floor((Date.now() - dob.getTime()) / (365.25*24*60*60*1000))
      if (age < 13) errs.dob = 'You must be at least 13 years old'
    }
    if (!values.address.trim()) errs.address = 'Address required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function validatePayment() {
    if (paymentMethod === 'upi' && !upiId.includes('@')) {
      setErrorMessage('Please enter a valid UPI ID (e.g., name@upi)')
      return false
    }
    return true
  }

  async function createPaymentIntent() {
    try {
      // In a real app, this would be an API call to your server to create a PaymentIntent
      // For demo, we'll simulate a successful response
      const mockResponse = {
        clientSecret: 'pi_3OCg7d2eZvKYlo2C1ggu4YOW_secret_mock',
        amount: 2500  // $25.00
      };
      setPaymentIntent(mockResponse);
      return mockResponse;
    } catch (err) {
      setErrorMessage('Failed to initialize payment. Please try again.');
      return null;
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate() || !validatePayment()) return

    setSubmitting(true)
    setPaymentStatus('processing')
    setErrorMessage('')
    
    try {
      switch (paymentMethod) {
        case 'card':
          // Create PaymentIntent first
          const paymentIntentResponse = await createPaymentIntent();
          if (!paymentIntentResponse) {
            throw new Error('Could not create payment intent');
          }
          // Simulate card processing
          await new Promise(r => setTimeout(r, 1500));
          break;

        case 'upi':
          // Simulate UPI payment verification
          await new Promise(r => setTimeout(r, 2000));
          if (!upiId.includes('@')) {
            throw new Error('Invalid UPI ID format');
          }
          break;

        case 'phonepay':
          // Simulate PhonePe QR scan and payment
          await new Promise(r => setTimeout(r, 2000));
          break;
      }
      
      // Simulate successful payment for all methods
      setPaymentStatus('succeeded')
      onSubmit && onSubmit({
        ...values, 
        paymentConfirmed: true,
        paymentMethod,
        ...(paymentMethod === 'upi' ? { upiId } : {})
      })
      
    } catch (err) {
      setPaymentStatus('error')
      setErrorMessage(err.message || 'Payment failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="reg-form" onSubmit={handleSubmit}>
      <h3>Registration Form</h3>
      <div className="form-row">
        <label>First name<div className="field"><input name="firstName" value={values.firstName} onChange={handleChange} /></div>{errors.firstName && <div className="error">{errors.firstName}</div>}</label>
        <label>Middle name<div className="field"><input name="middleName" value={values.middleName} onChange={handleChange} /></div></label>
        <label>Last name<div className="field"><input name="lastName" value={values.lastName} onChange={handleChange} /></div>{errors.lastName && <div className="error">{errors.lastName}</div>}</label>
      </div>
      <label>Email<div className="field"><input name="email" value={values.email} onChange={handleChange} /></div>{errors.email && <div className="error">{errors.email}</div>}</label>
      <label>Date of birth<div className="field"><input type="date" name="dob" value={values.dob} onChange={handleChange} /></div>{errors.dob && <div className="error">{errors.dob}</div>}</label>
      <label>Address<div className="field"><textarea name="address" value={values.address} onChange={handleChange} /></div>{errors.address && <div className="error">{errors.address}</div>}</label>
      
      <div className="payment-section">
        <h4>Payment - $25.00</h4>
        {paymentStatus === 'succeeded' ? (
          <div className="payment-success">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
            Payment successful!
          </div>
        ) : (
          <>
            <div className="payment-methods">
              <button
                type="button"
                className={`method-btn ${paymentMethod === 'card' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('card')}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="5" width="20" height="14" rx="2"/>
                  <path d="M2 10h20"/>
                </svg>
                Credit/Debit Card
              </button>
              <button
                type="button"
                className={`method-btn ${paymentMethod === 'upi' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('upi')}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 22h20L12 2z"/>
                  <path d="M12 22L2 2h20L12 22z"/>
                </svg>
                UPI
              </button>
              <button
                type="button"
                className={`method-btn ${paymentMethod === 'phonepay' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('phonepay')}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="5" y="2" width="14" height="20" rx="2"/>
                  <circle cx="12" cy="18" r="1"/>
                </svg>
                PhonePe
              </button>
            </div>

            <div className="payment-form">
              {paymentMethod === 'card' && (
                <div className="demo-card-input">
                  <div className="card-number">4242 4242 4242 4242</div>
                  <div className="card-details">
                    <span>12/25</span>
                    <span>123</span>
                  </div>
                </div>
              )}
              
              {paymentMethod === 'upi' && (
                <div className="upi-input">
                  <input
                    type="text"
                    placeholder="Enter your UPI ID (e.g., name@upi)"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="upi-field"
                  />
                  <div className="upi-info">
                    Popular UPI apps:
                    <div className="upi-apps">
                      <button type="button" className="upi-app-btn">Google Pay</button>
                      <button type="button" className="upi-app-btn">BHIM</button>
                      <button type="button" className="upi-app-btn">Paytm</button>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'phonepay' && (
                <div className="phonepay-section">
                  <div className="qr-placeholder">
                    <svg viewBox="0 0 100 100" width="160" height="160">
                      <rect x="10" y="10" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="2"/>
                      <rect x="25" y="25" width="50" height="50" fill="none" stroke="currentColor" strokeWidth="2"/>
                      <rect x="40" y="40" width="20" height="20" fill="currentColor"/>
                    </svg>
                    <div className="qr-label">Scan with PhonePe</div>
                  </div>
                  <button type="button" className="btn-link">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M8 17.7c-3.1-1.2-5-4.2-5-7.7 0-4.4 3.6-8 8-8s8 3.6 8 8c0 3.5-1.9 6.5-5 7.7"/>
                      <path d="M12 14v8"/>
                    </svg>
                    Open in PhonePe
                  </button>
                </div>
              )}
              
              {errorMessage && <div className="error">{errorMessage}</div>}
            </div>
          </>
        )}
      </div>

      <div className="form-actions">
        <button type="button" className="btn-muted" onClick={onCancel}>Cancel</button>
        <button type="submit" className="register" disabled={submitting || paymentStatus === 'succeeded'}>
          {submitting ? 'Processing payment...' : 
           paymentStatus === 'succeeded' ? 'Payment Complete' :
           paymentMethod === 'upi' ? 'Pay $25.00 with UPI' :
           paymentMethod === 'phonepay' ? 'Pay $25.00 with PhonePe' :
           'Pay $25.00 with Card'}
        </button>
      </div>
    </form>
  )
}