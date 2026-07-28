"use client";

import { useEffect, useId, useRef, useState } from "react";

import { filterCities, type CityOption } from "@/features/audits/cities";

interface CityComboboxProps {
  value: string;
  country: string;
  onChange: (city: string) => void;
  required?: boolean;
  disabled?: boolean;
}

export function CityCombobox({
  value,
  country,
  onChange,
  required = false,
  disabled = false,
}: CityComboboxProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const suggestions = filterCities(query, country);

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

  function selectCity(city: CityOption) {
    onChange(city.label);
    setQuery(city.label);
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
      selectCity(suggestions[activeIndex]);
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
            ? `${listId}-${suggestions[activeIndex].label}`
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
        placeholder={
          country
            ? `Type a city in ${country}…`
            : "Select a country first, then type a city…"
        }
      />

      {open && suggestions.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          {suggestions.map((city, index) => {
            const active = index === activeIndex;
            return (
              <li
                key={city.label}
                id={`${listId}-${city.label}`}
                role="option"
                aria-selected={active}
                className={`cursor-pointer px-3 py-2 text-sm ${
                  active ? "bg-brand-50 text-brand-700" : "text-slate-800 hover:bg-slate-50"
                }`}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(event) => {
                  event.preventDefault();
                  selectCity(city);
                }}
              >
                {city.label}
              </li>
            );
          })}
        </ul>
      ) : null}

      {open && !query.trim() && country && suggestions.length === 0 ? (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 shadow-lg">
          Start typing to search cities in {country}.
        </div>
      ) : null}

      {open && query.trim() && suggestions.length === 0 ? (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 shadow-lg">
          No saved cities matched. You can still type any city name.
        </div>
      ) : null}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100";
