"use client";

import React from "react";
import {
  type SearchQuery,
  type SearchGroup,
  type SearchCondition,
  SUPPORTED_FIELDS,
  OPERATORS_BY_FIELD,
  createEmptyGroup,
  createEmptyCondition,
} from "@/lib/desktop/search/query-builder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchBuilderProps {
  query: SearchQuery;
  onChange: (next: SearchQuery) => void;
}

const updateQuery = (
  query: SearchQuery,
  updater: (groups: SearchGroup[]) => SearchGroup[]
): SearchQuery => ({
  ...query,
  groups: updater(query.groups),
});

const updateCondition = (
  condition: SearchCondition,
  updates: Partial<SearchCondition>
): SearchCondition => ({
  ...condition,
  ...updates,
});

const betweenValue = (value: SearchCondition["value"], index: 0 | 1) => {
  if (Array.isArray(value)) {
    return value[index] ?? "";
  }
  if (typeof value === "object" && value !== null) {
    return index === 0 ? value.from ?? "" : value.to ?? "";
  }
  return "";
};

const setBetweenValue = (value: SearchCondition["value"], index: 0 | 1, next: string) => {
  if (Array.isArray(value)) {
    const copy = [...value];
    copy[index] = next;
    return copy as SearchCondition["value"];
  }

  if (typeof value === "object" && value !== null) {
    return {
      ...value,
      [index === 0 ? "from" : "to"]: next,
    };
  }

  return index === 0 ? [next, ""] : ["", next];
};

export const SearchBuilder: React.FC<SearchBuilderProps> = ({ query, onChange }) => {
  const handleUpdateGroup = (groupId: string, updater: (group: SearchGroup) => SearchGroup) => {
    onChange(
      updateQuery(query, (groups) =>
        groups.map((group) => (group.id === groupId ? updater(group) : group))
      )
    );
  };

  const handleAddCondition = (groupId: string) => {
    handleUpdateGroup(groupId, (group) => ({
      ...group,
      conditions: [...group.conditions, createEmptyCondition()],
    }));
  };

  const handleRemoveCondition = (groupId: string, conditionId: string) => {
    handleUpdateGroup(groupId, (group) => ({
      ...group,
      conditions: group.conditions.filter((condition) => condition.id !== conditionId),
    }));
  };

  const handleAddGroup = () => {
    onChange(
      updateQuery(query, (groups) => [
        ...groups,
        {
          ...createEmptyGroup(),
          combinator: "AND",
        },
      ])
    );
  };

  const handleRemoveGroup = (groupId: string) => {
    onChange(updateQuery(query, (groups) => groups.filter((group) => group.id !== groupId)));
  };

  const handleUpdateCondition = (
    groupId: string,
    conditionId: string,
    updates: Partial<SearchCondition>
  ) => {
    handleUpdateGroup(groupId, (group) => ({
      ...group,
      conditions: group.conditions.map((condition) =>
        condition.id === conditionId ? updateCondition(condition, updates) : condition
      ),
    }));
  };

  const handleCombinatorChange = (groupId: string, value: "AND" | "OR") => {
    handleUpdateGroup(groupId, (group) => ({
      ...group,
      combinator: value,
    }));
  };

  return (
    <div className="space-y-4">
      {query.groups.map((group, groupIndex) => (
        <div key={group.id} className="rounded-2xl border bg-muted/40 p-4">
          <header className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                Group {groupIndex + 1}
              </span>
              <select
                className="rounded-md border bg-background px-2 py-1 text-xs font-semibold uppercase"
                value={group.combinator}
                onChange={(event) =>
                  handleCombinatorChange(group.id, event.target.value as "AND" | "OR")
                }
              >
                <option value="AND">AND</option>
                <option value="OR">OR</option>
              </select>
              <span className="text-xs text-muted-foreground">between conditions</span>
            </div>
            {query.groups.length > 1 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleRemoveGroup(group.id)}
                className="text-destructive hover:text-destructive"
              >
                Remove Group
              </Button>
            )}
          </header>

          <div className="space-y-3">
            {group.conditions.map((condition) => {
              const operators = OPERATORS_BY_FIELD[condition.field] ?? ["contains"];
              const valueInput =
                condition.operator === "between" ? (
                  <div className="grid gap-2 md:grid-cols-2">
                    <Input
                      placeholder="From"
                      value={betweenValue(condition.value, 0 as const)}
                      onChange={(event) =>
                        handleUpdateCondition(group.id, condition.id, {
                          value: setBetweenValue(condition.value, 0, event.target.value),
                        })
                      }
                    />
                    <Input
                      placeholder="To"
                      value={betweenValue(condition.value, 1 as const)}
                      onChange={(event) =>
                        handleUpdateCondition(group.id, condition.id, {
                          value: setBetweenValue(condition.value, 1, event.target.value),
                        })
                      }
                    />
                  </div>
                ) : (
                  <Input
                    placeholder="Value"
                    value={
                      Array.isArray(condition.value)
                        ? condition.value.join(", ")
                        : typeof condition.value === "object" && condition.value !== null
                          ? ""
                          : (condition.value as string | number | undefined) ?? ""
                    }
                    onChange={(event) =>
                      handleUpdateCondition(group.id, condition.id, {
                        value: operators.includes("in")
                          ? event.target.value.split(",").map((item) => item.trim())
                          : event.target.value,
                      })
                    }
                  />
                );

              return (
                <div
                  key={condition.id}
                  className="flex flex-col gap-3 rounded-xl border bg-background/70 p-3 md:flex-row md:items-center"
                >
                  <select
                    className="rounded-md border bg-muted/40 px-3 py-2 text-sm font-medium"
                    value={condition.field}
                    onChange={(event) =>
                      handleUpdateCondition(group.id, condition.id, {
                        field: event.target.value as (typeof condition.field),
                        operator: OPERATORS_BY_FIELD[event.target.value as keyof typeof OPERATORS_BY_FIELD]?.[0] ?? "contains",
                        value: "",
                      })
                    }
                  >
                    {SUPPORTED_FIELDS.map((field) => (
                      <option key={field.value} value={field.value}>
                        {field.label}
                      </option>
                    ))}
                  </select>
                  <select
                    className="rounded-md border bg-muted/30 px-3 py-2 text-sm"
                    value={condition.operator}
                    onChange={(event) =>
                      handleUpdateCondition(group.id, condition.id, {
                        operator: event.target.value as SearchCondition["operator"],
                        value: "",
                      })
                    }
                  >
                    {operators.map((operator) => (
                      <option key={operator} value={operator}>
                        {operator}
                      </option>
                    ))}
                  </select>

                  <div className={cn("flex-1", condition.operator === "between" && "w-full")}>
                    {valueInput}
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveCondition(group.id, condition.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    Remove
                  </Button>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => handleAddCondition(group.id)}>
              Add Condition
            </Button>
          </div>
        </div>
      ))}

      <div className="flex flex-wrap gap-2">
        <Button onClick={handleAddGroup} size="sm" variant="outline">
          Add Group
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onChange({ ...query, groups: [createEmptyGroup()] })}
        >
          Reset Builder
        </Button>
      </div>
    </div>
  );
};


