import { useState } from "react";
import { Toaster } from "react-hot-toast";
import { Dashboard } from "./components/Dashboard";
import { SessionSetup } from "./components/SessionSetup";

function App() {
  const [activeSession, setActiveSession] = useState(null);

  return (
    <>
      <Toaster position="top-right" />
      {!activeSession ? (
        <SessionSetup onSessionCreated={setActiveSession} />
      ) : (
        <Dashboard session={activeSession} />
      )}
    </>
  );
}

export default App;
