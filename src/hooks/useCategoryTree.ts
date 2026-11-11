"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import api from "@/lib/authAxios";
import { getErrorMessage } from "@/lib/errors";
import type { Category } from "@/types/commerce";

export type FlatCategory = Category & { depth: number; path: string };

/** Depth-first list with indentation depth and a "Men › T-shirts" path. */
export function flattenTree(nodes: Category[], depth = 0, prefix = ""): FlatCategory[] {
  return nodes.flatMap((c) => {
    const path = prefix ? `${prefix} › ${c.name}` : c.name;
    return [{ ...c, depth, path }, ...flattenTree(c.children ?? [], depth + 1, path)];
  });
}

/** Ids of a node and everything under it (to stop moving a category into itself). */
export function subtreeIds(node: Category): string[] {
  return [node.id, ...(node.children ?? []).flatMap(subtreeIds)];
}

/** `GET /categories` (public) for admin screens: always fresh, with reload. */
export function useCategoryTree() {
  const [tree, setTree] = useState<Category[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get<Category[]>("/categories");
      setTree(res.data);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load categories."));
      setTree((t) => t ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const flat = useMemo(() => flattenTree(tree ?? []), [tree]);
  return { tree, flat, error, loading, reload };
}
