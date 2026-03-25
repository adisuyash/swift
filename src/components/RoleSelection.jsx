import { useState } from "react";
import { createUser } from "../lib/supabase";

const ROLE_OPTIONS = [
  {
    id: "freelancer",
    title: "Freelancer",
    description: "I create invoices, get paid",
  },
  {
    id: "client",
    title: "Client",
    description: "I scan and pay invoices",
  },
];

function truncateAddress(address) {
  if (!address) {
    return "No wallet connected";
  }

  return `${address.slice(0, 10)}...${address.slice(-8)}`;
}

export default function RoleSelection({ walletAddress, onComplete }) {
  const [name, setName] = useState("");
  const [loadingRole, setLoadingRole] = useState("");
  const [error, setError] = useState("");

  async function handleRolePick(role) {
    if (!walletAddress) {
      setError("Connect your wallet before creating a profile.");
      return;
    }

    if (!name.trim()) {
      setError("Display name is required.");
      return;
    }

    setLoadingRole(role);
    setError("");

    try {
      const user = await createUser(walletAddress, name.trim(), role);
      onComplete(user);
    } catch (saveError) {
      console.error(saveError);
      setError(saveError.message || "Unable to save your profile.");
    } finally {
      setLoadingRole("");
    }
  }

  return (
    <section className="mx-auto max-w-4xl">
      <div className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <span className="inline-flex rounded-full border border-brand/20 bg-brand/10 px-4 py-2 text-sm font-medium text-brand">
              Wallet detected
            </span>
            <h2 className="mt-5 text-3xl font-bold text-white">
              Choose how you want to use Swift
            </h2>
            <p className="mt-3 text-base leading-7 text-gray-300">
              Pick your mode once and land on the right dashboard the next time
              this address reconnects.
            </p>

            <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-gray-500">
                Connected Address
              </p>
              <p className="mono mt-2 break-all text-sm text-gray-200">
                {truncateAddress(walletAddress)}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Display name
            </label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ada Lovelace"
              className="mt-3 w-full rounded-2xl border border-white/10 bg-gray-800 px-4 py-3 text-base text-white outline-none transition focus:border-brand"
            />

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {ROLE_OPTIONS.map((role) => {
                const isLoading = loadingRole === role.id;

                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleRolePick(role.id)}
                    disabled={Boolean(loadingRole)}
                    className="glass-panel rounded-[1.75rem] border border-white/10 p-5 text-left transition hover:-translate-y-0.5 hover:border-brand/35 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-white">
                        {role.title}
                      </h3>
                      <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                        {isLoading ? "Saving" : "Pick"}
                      </span>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-gray-300">
                      {role.description}
                    </p>
                  </button>
                );
              })}
            </div>

            {error ? (
              <p className="mt-4 rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {error}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
