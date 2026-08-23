import { motion } from "motion/react";
import Dropdown from "./dropdown";
import { useRef, useState } from "react";
import Loader from "./loader";


function Search({ focused, onFocusChange }) {
  const [user, setUser] = useState(null);
  const wrapperRef = useRef(null);
  const [Value, setValue] = useState('');
  const [loading, setLoading] = useState(false)

  const handleBlur = (e) => {
    const next = e.relatedTarget;
    if (next && wrapperRef.current?.contains(next)) {
      return;
    }
  };

  const SubmitHandler = async (e) => {
    e.preventDefault();
    if (!Value.trim()) return;

    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8000/github/${encodeURIComponent(Value.trim())}`);
      
      if (!res.ok) {
        setUser({
          username: Value.trim(),
          name: Value.trim(),
          logo: `https://github.com/${Value.trim()}.png`,
          bio: `Software Engineer specializing in modern web & cloud systems.`,
          location: "Pune , Maharashtra",
          public_repos: 0,
          profile_url: `https://github.com/${Value.trim()}`,
          last_Activity: "Just now",
        });
      } else {
        const data = await res.json();
        setUser({
          username: data.username,
          name: data.name || data.username,
          logo: data.logo,
          bio: data.bio || "Software Engineer",
          location: data.location || "San Francisco, CA",
          public_repos: data.public_repos ?? data.repo ?? 0,
          profile_url: data.profile_url || `https://github.com/${data.username}`,
          last_Activity: data.last_Activity,
        });
      }

      setValue("");
    } catch (error) {
      console.error(error);
      // Fallback preview
      setUser({
        username: Value.trim() || "alexdev",
        name: Value.trim() || "Alex Rivera",
        logo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
        bio: "Senior Backend Engineer building distributed systems, LLM pipelines, and high-performance microservices.",
        location: "San Francisco, CA",
        public_repos: 42,
        profile_url: `https://github.com/${Value.trim() || "alexdev"}`,
        last_Activity: "4 days ago",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='rounded-3xl w-full flex justify-center'>
      <motion.div
        ref={wrapperRef}
        className='relative inline-block rounded-3xl'
        animate={{
          y: focused ? -160 : 0,
          width: focused ? 760 : 560,
          boxShadow: focused ? '0 0 0 1px rgba(255,255,255,0.25), 0 20px 60px rgba(0,0,0,0.45)' : '0 10px 35px rgba(0,0,0,0.35)',
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
      >
        <form onSubmit={SubmitHandler} className="rounded-3xl border-0 p-3">
          <label htmlFor="username">
            <div className="border border-slate-300 rounded-3xl flex items-center justify-center p-2 bg-white/80 backdrop-blur-sm shadow-inner">
              <input
                id="username"
                type="text"
                placeholder="Enter username"
                onFocus={() => onFocusChange(true)}
                onBlur={handleBlur}
                value={Value}
                onChange={(e) => setValue(e.target.value)}
                className="font-bold text-3xl focus:outline-0 w-full h-15 border-0 rounded-2xl flex-1 bg-transparent text-slate-900 focus:bg-white "
              />

              <button
                type="submit"
                onMouseDown={() => onFocusChange(true)}
                className='ml-2 w-15 h-15 border-0 bg-slate-900 text-white rounded-2xl hover:bg-slate-700 transition-colors duration-200 shadow-lg relative'
              >
                {loading ? (<Loader />) : (<span>&gt;</span>)}

              </button>
            </div>
          </label>
        </form>
        <div className='absolute inset-x-0 top-full mt-2'>
          <Dropdown visible={focused} user={user} />
        </div>
      </motion.div>
    </div>
  );
}
export default Search