"use client";

export default function Home() {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formDataObj = new FormData(form);

    const formData = {
      name: String(formDataObj.get("name") ?? ""),
      age: String(formDataObj.get("age") ?? ""),
      email: String(formDataObj.get("email") ?? ""),
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
        alert(errorMessage);
        return;
      }

      if (payload?.data) {
        alert(
          `Saved: ${payload.data.name}, ${payload.data.age}, ${payload.data.email}`,
        );
      } else {
        alert("Saved!");
      }
      form.reset();
    } catch {
      alert("Network error while saving data.");
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-8 sm:py-12">
      <div className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-[#ffd447]/55 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute -right-12 top-1/3 h-64 w-64 rounded-full bg-[#ff7f50]/40 blur-3xl animate-float-delayed" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-[#7ad8ff]/35 blur-3xl animate-float-slow" />

      <section className="mx-auto w-full max-w-3xl animate-rise-in rounded-3xl border border-white/40 bg-white/85 p-6 shadow-[0_20px_60px_rgba(10,36,64,0.25)] backdrop-blur md:p-10">
        <p className="tracking-[0.2em] text-xs font-semibold uppercase text-[#205c78]">
          Hotel Transnvenia
        </p>
        <h1 className="mt-2 text-balance text-3xl font-extrabold leading-tight text-[#0f2f45] sm:text-4xl">
          Quick Guest Entry
        </h1>
        <p className="mt-2 max-w-xl text-sm text-[#2f5269] sm:text-base">
          Capture essential guest details with a clean, fast check-in form.
        </p>

        <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-[#17445f]">
              Full Name
            </span>
            <input
              name="name"
              placeholder="Dracula"
              required
              className="h-12 rounded-xl border border-[#bfd4df] bg-white px-4 text-[#0f2f45] outline-none transition focus:border-[#ff7f50] focus:ring-4 focus:ring-[#ff7f50]/20"
            />
          </label>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-[#17445f]">
                Package
              </span>
              <select
                name="goods"
                required
                className="h-12 rounded-xl border border-[#bfd4df] bg-white px-4 text-[#0f2f45] outline-none transition focus:border-[#ffd447] focus:ring-4 focus:ring-[#ffd447]/25"
              >
                <option value="beer">Beer</option>
                <option value="room">Room</option>
                <option value="tegabino">Tegabino</option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-[#17445f]">
                Age (preset)
              </span>
              <select
                name="age"
                className="h-12 rounded-xl border border-[#bfd4df] bg-white px-4 text-[#0f2f45] outline-none transition focus:border-[#7ad8ff] focus:ring-4 focus:ring-[#7ad8ff]/30"
              >
                {[...Array(50)].map((_, i) => (
                  <option key={i} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-[#17445f]">
                Age (manual)
              </span>
              <input
                name="age"
                placeholder="Enter age"
                required
                className="h-12 rounded-xl border border-[#bfd4df] bg-white px-4 text-[#0f2f45] outline-none transition focus:border-[#5e8cf0] focus:ring-4 focus:ring-[#5e8cf0]/20"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-[#17445f]">
                Email
              </span>
              <input
                name="email"
                type="email"
                placeholder="guest@hotel.com"
                className="h-12 rounded-xl border border-[#bfd4df] bg-white px-4 text-[#0f2f45] outline-none transition focus:border-[#ff7f50] focus:ring-4 focus:ring-[#ff7f50]/20"
              />
            </label>
          </div>

          <button
            type="submit"
            className="mt-2 inline-flex h-12 items-center justify-center rounded-xl bg-[#0f2f45] px-6 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(15,47,69,0.3)] transition hover:-translate-y-0.5 hover:bg-[#174b69] focus:outline-none focus:ring-4 focus:ring-[#174b69]/30"
          >
            Save Entry
          </button>
        </form>
      </section>
    </main>
  );
}
