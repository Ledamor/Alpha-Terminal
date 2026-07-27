import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-8">
        <h1 className="text-6xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          Alpha Terminal
        </h1>
        <p className="text-xl text-gray-400">
          Professional scalable monorepo architecture.
        </p>
        
        <div className="flex gap-4 justify-center">
          <button 
            onClick={() => setCount((c) => c + 1)}
            className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors font-semibold"
          >
            Count is {count}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 text-left mt-12">
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h3 className="text-lg font-semibold text-blue-400 mb-2">Web App</h3>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>React 19 & Vite</li>
              <li>Tailwind v4</li>
              <li>TanStack Router & Query</li>
              <li>shadcn/ui ready</li>
            </ul>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h3 className="text-lg font-semibold text-emerald-400 mb-2">API Service</h3>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>NestJS</li>
              <li>Prisma & Postgres</li>
              <li>Redis & BullMQ</li>
              <li>Socket.IO ready</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
