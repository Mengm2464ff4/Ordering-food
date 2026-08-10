import React from 'react'

const TestDashboard = () => {
  return (
    <div style={{ padding: '20px', backgroundColor: 'white' }}>
      <h1 style={{ color: 'red', fontSize: '40px' }}>TEST PAGE</h1>
      <p style={{ fontSize: '20px' }}>If you can see this, React is working!</p>
      <button onClick={() => alert('Button clicked!')}>Click Me</button>
    </div>
  )
}

export default TestDashboard