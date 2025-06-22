import Chat from "./components/Chat";

export default function Home() {
  return (
    <main className="flex flex-col h-screen bg-gray-50">
      <header className="p-4 border-b bg-white">
        <h1 className="text-xl font-bold text-center text-gray-900">
          Mini Model Playground
        </h1>
      </header>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto h-full">
          <Chat />
        </div>
      </div>
    </main>
  )
}