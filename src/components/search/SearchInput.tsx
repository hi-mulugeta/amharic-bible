import { useEffect, useRef, useState, type FormEvent } from "react";
import { Search, X } from "lucide-react";
import { useSuggest } from "@/api/queries/search";
import { useDebounced } from "@/lib/useDebounced";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { SuggestionList } from "./SuggestionList";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSubmit?: (v: string) => void;
  autoFocus?: boolean;
  placeholder?: string;
  className?: string;
};

export function SearchInput({
  value,
  onChange,
  onSubmit,
  autoFocus,
  placeholder = "ጥቅስ፣ ትርጓሜ ወይም ቅዱስ ፈልግ...",
  className,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();

  const debounced = useDebounced(value, 200);
  const { data: suggest } = useSuggest(debounced, {
    enabled: focused && debounced.trim().length >= 1,
  });

  // Auto-focus when requested
  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed.length < 2) return;
    setShowSuggestions(false);
    inputRef.current?.blur();
    onSubmit?.(trimmed);
  };

  const clear = () => {
    onChange("");
    inputRef.current?.focus();
  };

  const onPickSuggestion = (slug: string, type: string) => {
    setShowSuggestions(false);
    switch (type) {
      case "book":
        navigate(`/bible/${slug}/1`);
        break;
      case "author":
        navigate(`/authors/${slug}`);
        break;
      case "topic":
        navigate(`/topics/${slug}`);
        break;
      case "tag":
        navigate(`/tags/${slug}`);
        break;
      default:
        navigate(`/search?q=${encodeURIComponent(slug)}`);
    }
  };

  const showList =
    focused &&
    showSuggestions &&
    value.trim().length >= 1 &&
    (suggest?.suggestions?.length ?? 0) > 0;

  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-faint" />

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => {
          setFocused(true);
          setShowSuggestions(true);
        }}
        onBlur={() => {
          // Delay so a click on a suggestion registers before we hide
          setTimeout(() => {
            setFocused(false);
            setShowSuggestions(false);
          }, 150);
        }}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        className={cn(
          "w-full rounded-xl border border-surface-border bg-surface-raised/20",
          "py-3 pl-11 pr-11",
          "font-amharic text-[15px] text-text-primary placeholder:text-text-faint",
          "transition-colors",
          "focus:border-gold-500/40 focus:bg-surface-raised/40 focus:outline-none",
        )}
      />

      {value.length > 0 && (
        <button
          type="button"
          onClick={clear}
          aria-label="አጽዳ"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-text-faint transition-colors hover:bg-surface-raised hover:text-text-muted"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {showList && (
        <SuggestionList
          suggestions={suggest?.suggestions ?? []}
          onPick={onPickSuggestion}
        />
      )}
    </form>
  );
}
