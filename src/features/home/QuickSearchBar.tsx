import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

export function QuickSearchBar() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    if (query.length < 2) return;
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <form onSubmit={submit} className="relative">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-faint" />
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="ጥቅስ፣ ትርጓሜ ወይም ቅዱስ ፈልግ..."
        className="
          w-full rounded-xl border border-surface-border bg-surface-raised/20
          py-3 pl-11 pr-4
          font-amharic text-[15px] text-text-primary placeholder:text-text-faint
          transition-colors
          focus:border-gold-500/40 focus:bg-surface-raised/40 focus:outline-none
        "
      />
    </form>
  );
}
