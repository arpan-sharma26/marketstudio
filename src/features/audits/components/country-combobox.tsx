"use client";

import { useEffect, useId, useRef, useState } from "react";

import { filterCountries, type CountryOption } from "@/features/audits/countries";

interface CountryComboboxProps {
  value: string;
  onChange: (country: string) => void;
  required?: boolean;
  disabled?: boolean;
}

export function CountryCombobox({
  value,
  onChange,
  required = false,
  disabled = false,
}: CountryComboboxProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const suggestions = filterCountries(query);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery(value);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [value]);

  function selectCountry(country: CountryOption) {
    onChange(country.name);
    setQuery(country.name);
    setOpen(false);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      setOpen(true);
      return;
    }

    if (!open) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) =>
        Math.min(index + 1, Math.max(suggestions.length - 1, 0)),
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && suggestions[activeIndex]) {
      event.preventDefault();
      selectCountry(suggestions[activeIndex]);
    } else if (event.key === "Escape") {
      setOpen(false);
      setQuery(value);
    }
  }

  return (
    <div ref={rootRef} className={`relative ${open ? "z-50" : "z-auto"}`}>
      <input
        required={required}
        disabled={disabled}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          open && suggestions[activeIndex]
            ? `${listId}-${suggestions[activeIndex].code}`
            : undefined
        }
        autoComplete="off"
        value={query}
        onChange={(event) => {
          const next = event.target.value;
          setQuery(next);
          setOpen(true);
          setActiveIndex(0);
          onChange(next);
        }}
        onFocus={() => {
          setOpen(true);
          setActiveIndex(0);
        }}
        onKeyDown={handleKeyDown}
        className={inputClass}
        placeholder="Start typing a country…"
      />

      {open && suggestions.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          {suggestions.map((country, index) => {
            const active = index === activeIndex;
            return (
              <li
                key={country.code}
                id={`${listId}-${country.code}`}
                role="option"
                aria-selected={active}
                className={`cursor-pointer px-3 py-2 text-sm ${
                  active ? "bg-brand-50 text-brand-700" : "text-slate-800 hover:bg-slate-50"
                }`}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(event) => {
                  event.preventDefault();
                  selectCountry(country);
                }}
              >
                <span className="font-medium">{country.name}</span>
                <span className="ml-2 text-xs text-slate-400">{country.code}</span>
              </li>
            );
          })}
        </ul>
      ) : null}

      {open && query.trim() && suggestions.length === 0 ? (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 shadow-lg">
          No matching countries. Keep typing a full country name.
        </div>
      ) : null}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100";
