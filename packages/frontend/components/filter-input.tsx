"use client";

import type { ItemOfSet, SetState } from "@/lib/types";
import { useMemo, useState } from "react";
import { ListFilter, Package } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput
} from "@/components/ui/input-group";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type FiltersType = Record<string, Set<string>>;

export type FilterDefs<F extends FiltersType> = {
  id: keyof F
  name: string
  values: {
    name: string
    value: string
  }[]
}[];

interface FilterTag {
  filterId: string
  name: string
  value: string
}

export function useFilterInput<F extends FiltersType>(defs: FilterDefs<F>) {
  const initialFilters = defs.reduce(
    (filters, current) => {
      (filters as any)[current.id] = new Set();
      return filters;
    },
    {} as F
  ) as F;

  const [searchValue, setSearchValue] = useState("");
  const [filters, setFilters] = useState<F>(initialFilters);
  return { defs, searchValue, setSearchValue, filters, setFilters };
}

export function FilterInput<F extends FiltersType>({
  defs,
  searchValue,
  setSearchValue,
  filters,
  setFilters,
  placeholder,
  className
}: {
  defs: FilterDefs<F>
  searchValue: string
  setSearchValue: SetState<string>
  filters: F
  setFilters: SetState<F>
  placeholder?: string
  className?: string
}) {
  function addFilter<I extends keyof F>(id: I, value: ItemOfSet<F[I]>) {
    setFilters((prev) => {
      const next = { ...prev, [id]: new Set(prev[id]) } as F;
      next[id].add(value);
      return next;
    });
  }

  function removeFilter<I extends keyof F>(id: I, value: ItemOfSet<F[I]>) {
    setFilters((prev) => {
      const next = { ...prev, [id]: new Set(prev[id]) } as F;
      next[id].delete(value);
      return next;
    });
  }

  const filterTags = useMemo(() => {
    const tags: FilterTag[] = [];
    
    const nameMap: Map<string, string> = new Map();
    for(const def of defs) {
      for(const { name, value } of def.values) {
        nameMap.set(value, name);
      }
    }

    for(const [id, values] of Object.entries(filters)) {
      for(const value of values) {
        tags.push({
          filterId: id,
          name: nameMap.get(value),
          value
        });
      }
    }
    return tags;
  }, [defs, filters]);

  return (
    <div className={cn("flex gap-2", className)}>
      {defs.map((filter, i) => (
        <DropdownMenu key={i}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <ListFilter />
              {filter.name}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {filter.values.map((item, i) => (
              <DropdownMenuCheckboxItem
                checked={filters[filter.id].has(item.value)}
                onCheckedChange={(checked) => {
                  checked
                  ? addFilter(filter.id, item.value as any)
                  : removeFilter(filter.id, item.value as any);
                }}
                key={i}>
                {item.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ))}
      <InputGroup>
        <InputGroupAddon>
          <Package />
        </InputGroupAddon>
        {filterTags.length > 0 && (
          <InputGroupAddon>
            {filterTags.map((tag, i) => (
              <Badge variant="outline" key={i}>
                {tag.name}
              </Badge>
            ))}
          </InputGroupAddon>
        )}
        <InputGroupInput
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder={placeholder}/>
      </InputGroup>
    </div>
  );
}
