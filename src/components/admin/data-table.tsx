"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface Column<T> {
  key: string;
  header: string;
  cell: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  isLoading,
  emptyMessage = "No data found",
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="rounded-md border border-border-default">
        <Table>
          <TableHeader>
            <TableRow className="border-border-default bg-surface-muted">
              {columns.map((column) => (
                <TableHead key={column.key} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i} className="border-border-default">
                {columns.map((column) => (
                  <TableCell key={column.key}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-md border border-border-default">
        <Table>
          <TableHeader>
            <TableRow className="border-border-default bg-surface-muted">
              {columns.map((column) => (
                <TableHead key={column.key} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-text-muted"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border-default overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border-default bg-surface-muted hover:bg-surface-muted">
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={`text-text-secondary ${column.className || ""}`}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow
              key={item.id}
              className={`border-border-default ${
                index % 2 === 1 ? "bg-surface-muted/50" : ""
              }`}
            >
              {columns.map((column) => (
                <TableCell key={column.key} className={column.className}>
                  {column.cell(item)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
