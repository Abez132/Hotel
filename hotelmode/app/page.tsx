"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [isDark, setIsDark] = useState(true);
  const [popup, setPopup] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDark(true);
      return;
    }
    if (savedTheme === "light") {
      setIsDark(false);
      return;
    }
    setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    if (!popup) return;
    const timer = setTimeout(() => setPopup(null), 9000);
    return () => clearTimeout(timer);
  }, [popup]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formDataObj = new FormData(form);

    const formData = {
      fs: String(formDataObj.get("fs") ?? ""),
      goods: String(formDataObj.get("goods") ?? ""),
      amount: String(formDataObj.get("amount") ?? ""),
    };

    try {
      const response = await fetch("/api/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMessage =
          typeof payload?.error === "string"
            ? payload.error
            : typeof payload?.message === "string"
              ? payload.message
              : "Failed to save data.";
        setPopup({ type: "error", message: errorMessage });
        return;
      }

      if (payload?.data) {
        setPopup({
          type: "success",
          message: `Saved: ${payload.data.fs}, ${payload.data.goods}, ${payload.data.amount}`,
        });
      } else {
        setPopup({ type: "success", message: "Saved!" });
      }
    } catch {
      setPopup({ type: "error", message: "Network error while saving data." });
    }
  };

  return (
    <main
      className={`relative min-h-screen overflow-hidden px-4 py-8 transition-colors duration-300 sm:px-8 sm:py-12 ${
        isDark
          ? "bg-linear-to-b from-[#071018] via-[#0b1d2a] to-[#132635]"
          : "bg-linear-to-b from-[#f8fcff] via-[#fffaf1] to-[#eef8ff]"
      }`}
    >
      <button
        type="button"
        onClick={() => setIsDark((prev) => !prev)}
        className={`absolute right-4 top-4 z-40 rounded-xl border px-4 py-2 text-sm font-semibold transition sm:right-8 sm:top-8 ${
          isDark
            ? "border-[#2d5268] bg-[#0f2433] text-[#e5f3ff] hover:bg-[#163447]"
            : "border-[#bfd4df] bg-white/90 text-[#0f2f45] hover:bg-white"
        }`}
      >
        {isDark ? "Light Mode" : "Dark Mode"}
      </button>

      {popup ? (
        <div
          className={`fixed left-1/2 top-5 z-50 w-[min(92vw,28rem)] -translate-x-1/2 animate-rise-in rounded-2xl border p-3 shadow-[0_12px_40px_rgba(10,36,64,0.25)] backdrop-blur ${
            isDark
              ? "border-[#2d5268]/80 bg-[#0f2433]/90"
              : "border-white/50 bg-white/95"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`mt-1 h-2.5 w-2.5 rounded-full ${
                popup.type === "success" ? "bg-emerald-500" : "bg-rose-500"
              }`}
            />
            <p
              className={`flex-1 text-sm font-medium ${
                isDark ? "text-[#d4ebff]" : "text-[#123b53]"
              }`}
            >
              {popup.message}
            </p>
            <button
              type="button"
              aria-label="Close popup"
              onClick={() => setPopup(null)}
              className={`rounded-md px-2 py-1 text-xs font-semibold transition ${
                isDark
                  ? "text-[#9ac7e6] hover:bg-[#18384d]"
                  : "text-[#205c78] hover:bg-[#e7f2f8]"
              }`}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}

      <div
        className={`pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full blur-3xl animate-float-slow ${
          isDark ? "bg-[#1f4f6d]/40" : "bg-[#ffd447]/55"
        }`}
      />
      <div
        className={`pointer-events-none absolute -right-12 top-1/3 h-64 w-64 rounded-full blur-3xl animate-float-delayed ${
          isDark ? "bg-[#2f7aa8]/35" : "bg-[#ff7f50]/40"
        }`}
      />
      <div
        className={`pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full blur-3xl animate-float-slow ${
          isDark ? "bg-[#3ca7a5]/25" : "bg-[#7ad8ff]/35"
        }`}
      />

      <section
        className={`mx-auto w-full max-w-3xl animate-rise-in rounded-3xl border p-6 shadow-[0_20px_60px_rgba(10,36,64,0.25)] backdrop-blur md:p-10 ${
          isDark
            ? "border-[#2d5268]/80 bg-[#0c1f2d]/85"
            : "border-white/40 bg-white/85"
        }`}
      >
        <p
          className={`tracking-[0.2em] text-xs font-semibold uppercase ${
            isDark ? "text-[#8fc2e2]" : "text-[#205c78]"
          }`}
        >
          Hotel Transnvenia
        </p>
        <h1
          className={`mt-2 text-balance text-3xl font-extrabold leading-tight sm:text-4xl ${
            isDark ? "text-[#e6f3ff]" : "text-[#0f2f45]"
          }`}
        >
          Quick Guest Entry
        </h1>
        <p
          className={`mt-2 max-w-xl text-sm sm:text-base ${
            isDark ? "text-[#9fc7df]" : "text-[#2f5269]"
          }`}
        >
          Capture essential guest details with a clean, fast check-in form.
        </p>

        <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
          <label className="grid gap-2">
            <span
              className={`text-sm font-semibold ${
                isDark ? "text-[#c2dff1]" : "text-[#17445f]"
              }`}
            >
              Fs
            </span>
            <input
              name="fs"
              required
              className={`h-12 rounded-xl border px-4 outline-none transition focus:ring-4 focus:ring-[#ff7f50]/20 ${
                isDark
                  ? "border-[#35556a] bg-[#102736] text-[#e6f3ff] focus:border-[#ff9b7a]"
                  : "border-[#bfd4df] bg-white text-[#0f2f45] focus:border-[#ff7f50]"
              }`}
            />
          </label>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2">
              <span
                className={`text-sm font-semibold ${
                  isDark ? "text-[#c2dff1]" : "text-[#17445f]"
                }`}
              >
                Package
              </span>
              <select
                name="goods"
                required
                className={`h-12 rounded-xl border px-4 outline-none transition focus:ring-4 focus:ring-[#ffd447]/25 ${
                  isDark
                    ? "border-[#35556a] bg-[#102736] text-[#e6f3ff] focus:border-[#ffd447]"
                    : "border-[#bfd4df] bg-white text-[#0f2f45] focus:border-[#ffd447]"
                }`}
              >
                <option value="beer">Beer</option>
                <option value="room-standard">Room big</option>
                <option value="Double bed">Double bed</option>
                <option value="room-deluxe">Room small</option>
                <option value="AWASH WINE BIG">AWASH WINE BIG</option>
                <option value="Kamila win big">Kamila win big</option>
                <option value="Guder wine small">Guder wine small</option>
                <option value="tegabino">Tegabino</option>
                <option value="Areqe double">Areqe double</option>
                <option value="draft single">draft single</option>
                <option value="Tibs">Tibs</option>
                <option value="Dabo">Dabo</option>
                <option value="yesom ferfer">yesom ferfer</option>
                <option value="water one liter">Water one liter</option>
                <option value="water half">Water half</option>
                <option value="Soft drink ">Soft drink</option>
                <option value="Sofi">Sofi</option>
                <option value="Bedele Spe">Bedele Spe</option>
                <option value="Habesha areke">Habesha areke</option>
                <option value="dulet">dulet</option>
                <option value="negus">negus</option>
                <option value="heinken">heinken</option>
                <option value="Arada">Arada</option>
                <option value="Ambo wuha">Ambo wuha</option>
                <option value="beyaynet">beyaynet</option>
                <option value="Draft jambo">Draft jambo</option>
                <option value="Yejebena buna">Yejebena buna</option>
                <option value="tea">Tea</option>
                <option value="water two liter">water two liter</option>
                <option value="Gomen">Gomen</option>
                <option value="afagn">afagn</option>
                <option value="Shero feses">shero feses</option>
                <option value="Tomato Salad">tomato salad</option>
                <option value="Pasta besigo">pasta besigo</option>
              </select>
            </label>

            <label className="grid gap-2">
              <span
                className={`text-sm font-semibold ${
                  isDark ? "text-[#c2dff1]" : "text-[#17445f]"
                }`}
              >
                Amount
              </span>
              <select
                name="amount"
                className={`h-12 rounded-xl border px-4 outline-none transition focus:ring-4 focus:ring-[#7ad8ff]/30 ${
                  isDark
                    ? "border-[#35556a] bg-[#102736] text-[#e6f3ff] focus:border-[#7ad8ff]"
                    : "border-[#bfd4df] bg-white text-[#0f2f45] focus:border-[#7ad8ff]"
                }`}
              >
                {[...Array(50)].map((_, i) => (
                  <option key={i} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button
            type="submit"
            className={`mt-2 inline-flex h-12 items-center justify-center rounded-xl px-6 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(15,47,69,0.3)] transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 ${
              isDark
                ? "bg-[#1b5f86] hover:bg-[#2578a7] focus:ring-[#2578a7]/30"
                : "bg-[#0f2f45] hover:bg-[#174b69] focus:ring-[#174b69]/30"
            }`}
          >
            Save Entry
          </button>
        </form>
      </section>
    </main>
  );
}
