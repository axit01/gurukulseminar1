import React from 'react'

// Opens Razorpay checkout. Returns a Promise which resolves with the handler payload
// on success, or rejects with an error on failure / dismissal.
export function openRazorpay({ amount, currency = 'INR', name, email, contact, description }) {
  return new Promise((resolve, reject) => {
    const key = import.meta.env.VITE_RAZORPAY_KEY_ID || ''
    if (!key) {
      reject(new Error('Razorpay key is not configured (VITE_RAZORPAY_KEY_ID).'))
      return
    }

    // Load script if not already present
    const existing = document.getElementById('razorpay-sdk')
    function _open() {
      const options = {
        key,
        amount: amount, // in paise
        currency,
        name: name || 'Event registration',
        description: description || 'Registration fee',
        prefill: {
          name,
          email,
          contact
        },
        notes: {},
        handler: function (response) {
          // response contains razorpay_payment_id, razorpay_order_id, razorpay_signature (if order used)
          resolve(response)
        },
        modal: {
          ondismiss: function () {
            reject(new Error('Payment was cancelled'))
          }
        }
      }

      try {
        const rzp = new window.Razorpay(options)
        rzp.open()
      } catch (err) {
        reject(err)
      }
    }

    if (existing) {
      _open()
      return
    }

    const script = document.createElement('script')
    script.id = 'razorpay-sdk'
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => _open()
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK'))
    document.body.appendChild(script)
  })
}

export default openRazorpay
