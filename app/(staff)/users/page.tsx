"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Plus, Search, Pencil, Power } from "lucide-react";

import { MOCK_USERS } from "@/lib/mock-users";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { getTileColor } from "@/lib/avatar-color";
import { PageHeader } from "@/components/shared/page-header";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function UsersPage() {
  const [users] = useState(MOCK_USERS);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>("All roles");

  const filtered = users.filter((u) => {
    const matchesRole = roleFilter === "All roles" || u.role === roleFilter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      q === "" ||
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q);
    return matchesRole && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Staff"
        count={`${users.length} ${users.length === 1 ? "member" : "members"}`}
        action={
          <Button>
            <Plus className="size-4" /> Add staff
          </Button>
        }
      />

      <div className="flex items-center gap-3">
        <div className="relative w-72">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search staff…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All roles">All roles</SelectItem>
            <SelectItem value="Admin">Admin</SelectItem>
            <SelectItem value="Cashier">Cashier</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Staff member</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((user) => (
              <TableRow
                key={user.id}
                className={cn("h-16", !user.active && "opacity-70")}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div
                      className="flex size-10 shrink-0 items-center justify-center rounded-full font-display text-[13px] font-semibold"
                      style={{
                        backgroundColor: getTileColor(user.name)[0],
                        color: getTileColor(user.name)[1],
                      }}
                    >
                      {getInitials(user.name)}
                    </div>
                    <span className="font-medium">{user.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  @{user.username}
                </TableCell>
                <TableCell>
                  <Badge variant={user.role === "Admin" ? "secondary" : "info"}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <StatusBadge status={user.active ? "active" : "inactive"} />
                </TableCell>
                <TableCell className="text-muted-foreground tabular-nums">
                  {user.last}
                </TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex gap-1.5">
                    <button className="flex size-8 items-center justify-center rounded-lg border border-border bg-card">
                      <Pencil className="size-[15px] text-muted-foreground" />
                    </button>
                    <button className="flex size-8 items-center justify-center rounded-lg border border-border bg-card">
                      <Power className="size-[15px] text-destructive" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
