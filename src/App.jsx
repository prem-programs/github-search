import { useState } from "react";
import Search from "./components/Search";

function App() {
  const [focused, setFocused] = useState(false);

  return (
    <main className="min-h-screen w-full bg-zinc-100 flex items-center justify-center">
      <Search focused={focused} onFocusChange={setFocused} />
    </main>
  );
}

export default App;