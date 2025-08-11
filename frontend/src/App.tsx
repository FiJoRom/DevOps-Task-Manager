// src/App.tsx
import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import TaskBoard from './components/TaskBoard'

function App() {
  const [count, setCount] = useState(0)
  const [pingResponse, setPingResponse] = useState('')

  useEffect(() => {
      fetch(`${import.meta.env.VITE_API_URL}/api/ping`)
      .then(res => res.json())
      .then(data => setPingResponse(JSON.stringify(data)))
      .catch(err => setPingResponse('Error: ' + err.message))
  }, [])

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p>Backend Ping Response: {pingResponse}</p>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>

      {/* --- Dummy Task Manager (Frontend-only, angepasst an Backend-Types) --- */}
      <hr />
      <h2 style={{ marginTop: 24 }}>Dummy Task Manager (Frontend)</h2>
      <TaskBoard />
    </>
  )
}

export default App
