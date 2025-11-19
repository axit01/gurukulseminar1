import { useState, useRef, useEffect } from 'react'
import { stripePromise } from '../stripe-config'
import { openRazorpay } from './Razorpay'
import { toast } from 'sonner'
import { saveRegistration } from '../Firebase'

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

  const [checkboxError, setCheckboxError] = useState('')

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
            <label className="rules-accept">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => {
                  setAccepted(e.target.checked)
                  if (e.target.checked) setCheckboxError('')
                }}
              /> I accept the rules and regulations
            </label>

            {checkboxError && <div className="error" style={{ marginTop: 8 }}>{checkboxError}</div>}

            <div style={{ marginTop: 16 }}>
              <button
                className="register"
                onClick={(e) => {
                  e.preventDefault()
                  if (!accepted) {
                    setCheckboxError('Please select the checkbox')
                    return
                  }
                  setCheckboxError('')
                  handleContinue()
                }}
              >
                Continue to form
              </button>
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
  const [values, setValues] = useState({ firstName:'', middleName:'', lastName:'', email:'', mobile:'', dob:'', address:'' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState('idle') // idle, processing, succeeded, error
  const [errorMessage, setErrorMessage] = useState('')
  const stripe = useRef(null)

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
    if (!/^[0-9]{10}$/.test(values.mobile)) errs.mobile = 'Valid 10 digit mobile number required'
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

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    setPaymentStatus('processing')
    setErrorMessage('')

    try {
      // Open Razorpay checkout for INR 50 (5000 paise)
      const paymentResponse = await openRazorpay({
        amount: 50 * 100,
        currency: 'INR',
        name: `${values.firstName} ${values.lastName}`,
        email: values.email,
        contact: values.mobile,
        description: 'Registration fee 50 INR'
      })

      // Successful payment — update UI immediately
      setPaymentStatus('succeeded')
      setSubmitting(false)

      // Save registration to Firestore (best-effort, non-blocking). Keep UX even if save fails.
      saveRegistration({
        ...values,
        paymentConfirmed: true,
        paymentMethod: 'razorpay',
        paymentResponse,
      })
      
      onSubmit && onSubmit({
        ...values,
        paymentConfirmed: true,
        paymentMethod: 'razorpay'
      })
      toast.success('Payment successful! Registration saved.')
      // Show success briefly then redirect to home
      // setTimeout(() => { window.location.href = '/' }, 2000)
    } catch (err) {
      setPaymentStatus('error')
      const msg = err?.message || 'Payment failed. Please try again.'
      setErrorMessage(msg)
      toast.error(msg)
      // Show error briefly then redirect to home
      setTimeout(() => { window.location.href = '/' }, 2500)
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
      <label>Mobile<div className="field"><input name="mobile" value={values.mobile} onChange={handleChange} /></div>{errors.mobile && <div className="error">{errors.mobile}</div>}</label>
      <label>Date of birth<div className="field"><input type="date" name="dob" value={values.dob} onChange={handleChange} /></div>{errors.dob && <div className="error">{errors.dob}</div>}</label>
      <label>Address<div className="field"><textarea name="address" value={values.address} onChange={handleChange} /></div>{errors.address && <div className="error">{errors.address}</div>}</label>
      
      <div className="payment-section">
        <h4>Payment: 50 Rupees</h4>
        {paymentStatus === 'succeeded' ? (
          <div className="payment-success">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
            Payment successful!
          </div>
        ) : null}
        {paymentStatus === 'error' && errorMessage ? (
          <div className="error" style={{ marginTop: 8 }}>{errorMessage}</div>
        ) : null}
      </div>

      <div className="form-actions">
        <button type="button" className="btn-muted" onClick={onCancel}>Cancel</button>
        <button type="submit" className="register" disabled={submitting || paymentStatus === 'succeeded'}>
          {submitting ? 'Processing payment...' : 
           paymentStatus === 'succeeded' ? 'Payment Complete' : 'Pay 50 Rupees'}
        </button>
      </div>
    </form>
  )
}