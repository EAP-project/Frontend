"use client";

import React from "react";

type SkeletonProps = React.HTMLAttributes<HTMLDivElement> & {
  /** number of lines to show when using line variant */
  lines?: number;
  variant?: "rect" | "circle" | "line";
};

export function Skeleton({ lines = 1, variant = "line", className = "", ...rest }: SkeletonProps) {
  if (variant === "circle") {
    return (
      <div
        className={`animate-pulse rounded-full bg-gray-200/70 dark:bg-gray-700/60 ${className}`}
        {...rest}
      />
    );
  }

  if (variant === "rect") {
    return (
      <div
        className={`animate-pulse rounded-md bg-gray-200/70 dark:bg-gray-700/60 ${className}`}
        {...rest}
      />
    );
  }

  // default: line(s)
  return (
    <div className={`space-y-2 ${className}`} {...rest}>
      {Array.from({ length: Math.max(1, lines) }).map((_, i) => (
        <div
          key={i}
          className="h-3 rounded bg-gray-200/70 dark:bg-gray-700/60 w-full"
        />
      ))}
    </div>
  );
}

export default Skeleton;
