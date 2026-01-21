import { Suspense } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { getUsers } from "@/lib/actions/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UsersTable } from "./users-table";

interface UsersContentProps {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}

async function UsersContent({ searchParams }: UsersContentProps) {
  const params = await searchParams;
  const { users, pagination } = await getUsers({
    search: params.search,
    status: params.status as "active" | "suspended" | "blocked" | undefined,
    page: params.page ? parseInt(params.page) : 1,
  });

  return (
    <Card className="border-border-default bg-surface">
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <CardTitle className="text-text-primary">All Users</CardTitle>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <Input
              placeholder="Search users..."
              className="w-full sm:w-48 md:w-64 border-border-default bg-surface pl-9"
            />
          </div>
          <Link href="/admin/users/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary-hover">
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <UsersTable users={users} />
        
        {pagination.totalPages > 1 && (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-text-muted">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
              {pagination.total} users
            </p>
            <div className="flex gap-2">
              {pagination.page > 1 && (
                <Link href={`/admin/users?page=${pagination.page - 1}`}>
                  <Button variant="outline" size="sm">
                    Previous
                  </Button>
                </Link>
              )}
              {pagination.page < pagination.totalPages && (
                <Link href={`/admin/users?page=${pagination.page + 1}`}>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function UsersSkeleton() {
  return (
    <Card className="border-border-default bg-surface">
      <CardHeader>
        <Skeleton className="h-6 w-24" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Users</h1>
        <p className="text-text-muted">Manage platform users and their accounts</p>
      </div>

      <Suspense fallback={<UsersSkeleton />}>
        <UsersContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
