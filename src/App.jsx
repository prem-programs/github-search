import { useState } from "react";
import Search from "./components/Search";

function App() {
  const [focused, setFocused] = useState(false);


  

  return (
    <>
      <Search focused={focused} onFocusChange={setFocused}/>
    </>
  )
}

export default App