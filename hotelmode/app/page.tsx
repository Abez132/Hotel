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
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" required />
      <input name="age" placeholder="Age" required />
      <input name="email" placeholder="Email" required />
      <button type="submit">Save</button>
    </form>
  );
}
