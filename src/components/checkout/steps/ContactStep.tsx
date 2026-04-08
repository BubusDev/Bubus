"use client";

type ContactStepProps = {
  email: string;
  isLoggedIn: boolean;
  onNext: (email: string) => void;
};

export function ContactStep({ email, isLoggedIn, onNext }: ContactStepProps) {
  return (
    <div className="max-w-[540px] mx-auto">
      <h2 className="text-lg font-semibold text-[#1a1a1a] mb-1">
        Kapcsolatfelvételi adatok
      </h2>
      <p className="text-sm text-[#666] mb-6">
        {isLoggedIn
          ? "A rendelés visszaigazolása erre az e-mail-címre érkezik."
          : "Adja meg e-mail-címét. Fiók nélkül is vásárolhat."}
      </p>

      {isLoggedIn ? (
        <>
          <div className="w-full border border-[#d0ccc8] px-4 py-3 text-sm text-[#1a1a1a] bg-[#faf9f7] mb-4 select-none">
            {email}
          </div>
          <button
            type="button"
            onClick={() => onNext(email)}
            className="w-full bg-[#1a1a1a] text-white py-3.5 text-sm font-medium hover:bg-[#333] transition"
          >
            Folytatás
          </button>
        </>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            const value = (data.get("email") as string).trim();
            if (value) onNext(value);
          }}
        >
          <input
            type="email"
            name="email"
            defaultValue={email}
            required
            placeholder="E-mail-cím *"
            className="w-full border border-[#d0ccc8] px-4 py-3 text-sm text-[#1a1a1a] outline-none focus:border-[#1a1a1a] transition mb-4"
          />
          <button
            type="submit"
            className="w-full bg-[#1a1a1a] text-white py-3.5 text-sm font-medium hover:bg-[#333] transition"
          >
            Folytatás
          </button>
        </form>
      )}
    </div>
  );
}
