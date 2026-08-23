import Modal from './Modal';
import { useState } from 'react';

function Dropdown({ visible, user }) {
  const [showModal, setShowModal] = useState(false);

  if (!visible) {
    return null;
  }

  if (!user) {
    return (
      <div className="mt-2.5 w-full max-w-[760px] flex justify-center items-center h-20 rounded-2xl border border-slate-300 bg-white/90 shadow-xl p-4 text-slate-600 font-medium">
        <p>Type a username and press Search to analyze</p>
      </div>
    );
  }

  return (
    <>
      <div className="mt-2.5 w-full max-w-[760px] flex justify-between items-center h-auto rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-sm shadow-xl p-4 gap-4">
        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-slate-700 shrink-0">
          <img
            className="w-full h-full object-cover"
            src={user.logo || user.avatar_url || "https://github.com/github.png"}
            alt={user.name || "avatar"}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-bold text-slate-900 text-base flex items-center gap-2">
            <span>{user.name || user.username}</span>
            <span className="text-slate-500 font-normal text-xs">@{user.username}</span>
          </div>
          {user.bio && (
            <div className="text-xs text-slate-600 truncate mt-0.5">{user.bio}</div>
          )}

          <div className="flex gap-4 text-xs text-slate-500 font-medium mt-1">
            <span>Repos: {user.public_repos ?? user.repo ?? 0}</span>
          </div>
        </div>

        <div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-gray-700  text-white font-semibold py-2 px-5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
          >
            View
          </button>
        </div>
      </div>

      {showModal && <Modal onClose={() => setShowModal(false)} user={user} />}
    </>
  );
}

export default Dropdown;