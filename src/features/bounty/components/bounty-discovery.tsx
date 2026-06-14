"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { SelectInput, TextInput } from "@/components/ui/form-field";
import type { BountyCategory, BountyStatus } from "@/domain/bounty/schemas";
import type { BountyDto } from "@/services/bounty/bounty-repository";
import { BountyCard } from "@/features/bounty/components/bounty-card";

export type DiscoveryBounty = BountyDto & { readonly innovationTitle?: string };

type BountyDiscoveryProps = {
  readonly bounties: readonly DiscoveryBounty[];
};

type SortKey = "newest" | "highest" | "closing";

const categoryOptions: ReadonlyArray<{ readonly value: "all" | BountyCategory; readonly label: string }> = [
  { value: "all", label: "All categories" },
  { value: "development", label: "Development" },
  { value: "design", label: "Design" },
  { value: "research", label: "Research" },
  { value: "marketing", label: "Marketing" },
  { value: "business", label: "Business" },
  { value: "other", label: "Other" },
];

const statusOptions: ReadonlyArray<{ readonly value: "all" | BountyStatus; readonly label: string }> = [
  { value: "all", label: "Open & in review" },
  { value: "open", label: "Open" },
  { value: "in_review", label: "In review" },
];

function deadlineSortValue(deadline?: string) {
  if (!deadline) {
    return Number.POSITIVE_INFINITY;
  }

  const time = new Date(deadline).getTime();
  return Number.isNaN(time) ? Number.POSITIVE_INFINITY : time;
}

export function BountyDiscovery({ bounties }: BountyDiscoveryProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | BountyCategory>("all");
  const [status, setStatus] = useState<"all" | BountyStatus>("all");
  const [minReward, setMinReward] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");

  const results = useMemo(() => {
    const min = Number(minReward);
    const q = query.trim().toLowerCase();

    const filtered = bounties.filter((bounty) => {
      if (category !== "all" && bounty.category !== category) {
        return false;
      }

      if (status !== "all" && bounty.status !== status) {
        return false;
      }

      if (Number.isFinite(min) && min > 0 && bounty.rewardAmount < min) {
        return false;
      }

      if (q && !`${bounty.title} ${bounty.description} ${bounty.innovationTitle ?? ""}`.toLowerCase().includes(q)) {
        return false;
      }

      return true;
    });

    const sorted = [...filtered];

    if (sort === "highest") {
      sorted.sort((a, b) => b.rewardAmount - a.rewardAmount);
    } else if (sort === "closing") {
      sorted.sort((a, b) => deadlineSortValue(a.deadline) - deadlineSortValue(b.deadline));
    } else {
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return sorted;
  }, [bounties, category, status, minReward, query, sort]);

  return (
    <div className="grid gap-4">
      <div className="glass-panel grid gap-3 rounded-card p-4 lg:grid-cols-[1.4fr_1fr_1fr_0.8fr_1fr]">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" aria-hidden />
          <TextInput
            className="h-10 pl-9"
            placeholder="Search bounties…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <SelectInput value={category} onChange={(event) => setCategory(event.target.value as "all" | BountyCategory)}>
          {categoryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectInput>
        <SelectInput value={status} onChange={(event) => setStatus(event.target.value as "all" | BountyStatus)}>
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectInput>
        <TextInput
          inputMode="decimal"
          placeholder="Min reward"
          value={minReward}
          onChange={(event) => setMinReward(event.target.value)}
        />
        <SelectInput value={sort} onChange={(event) => setSort(event.target.value as SortKey)}>
          <option value="newest">Newest</option>
          <option value="highest">Highest reward</option>
          <option value="closing">Closing soon</option>
        </SelectInput>
      </div>

      <p className="text-sm text-text-muted">
        {results.length} bount{results.length === 1 ? "y" : "ies"} matching
      </p>

      {results.length === 0 ? (
        <div className="glass-panel rounded-card p-8 text-center text-sm text-text-secondary">
          No bounties match these filters yet.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {results.map((bounty) => (
            <BountyCard
              key={bounty.id}
              bounty={bounty}
              href={`/innovation/${bounty.innovationId}/bounties/${bounty.id}`}
              innovationTitle={bounty.innovationTitle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
