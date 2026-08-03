
function Dropdown({ visible, user }) {
  if (!visible) {
    return null;
  }

  if (!user) {
    return (
      <div className="mt-2.5 w-190 flex justify-evenly items-center h-22 rounded-3xl border border-slate-300 bg-white/90 shadow-xl p-4">
        <p>User Not Found</p>
      </div>
    );
  }

  return (
    <div className="mt-2.5 w-190 flex justify-evenly items-center h-22 rounded-3xl border border-slate-300 bg-white/90 shadow-xl p-4">
      <div className="w-15 h-15 rounded-4xl border-2 border-black">
        <a href={user.profile}><img className="w-14 h-14 rounded-4xl content-fit" src={user.logo} alt="logo" /></a>
      </div>
      <div className="w-140 h-19">
        <div className="w-auto">{user.name} @{user.username}</div>
        <div className="w-auto">{user.bio}</div>

        <div className="flex">
          <div><a href={user.reposL}>📦 {user.repo}</a></div>
          <div><a href={user.furl}> 👥 {user.followers}</a></div>
        </div>
      </div>
    </div>
  );
}

export default Dropdown