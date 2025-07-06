// src/pages/payment.jsx
import React from 'react'
import './../css/payment.css'

function Payment() {
  return (
    <div className="payment-container">
      <h1 className="payment-title">Payment</h1>

      <div className="payment-form">
            <label>Enter Email ID:</label>
            <input type="email" placeholder="Email address" className="payment-input" />

        <div className="card-info">
          <label>Card information</label>
          <input type="text" placeholder="MM / MM  CVC" className="payment-input" />
        </div>
        <label>Name on the Card</label>
        <input type="text" placeholder="Name on card" className="payment-input" />

        <button className="pay-button">Pay $7.99</button>

        <p className="agreement-text">
          By providing your card information, you agree to our<br />
          <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
        </p>
      </div>

      <div className="summary-box">
        <div className="summary-item">
          <span>AI Interview</span>
          <span>$7.99</span>
        </div>
        <div className="summary-item total">
          <strong>Total</strong>
          <strong>$7.99</strong>
        </div>
      </div>
    </div>
  )
}

export default Payment
