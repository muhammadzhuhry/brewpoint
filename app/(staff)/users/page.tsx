"use client";

import { useState } from "react";
import { Plus, Search, Pencil, Power } from "lucide-react";

import type { User } from "@/lib/types";
import { MOCK_USERS } from "@/lib/mock-users";
import type { UserFormValues } from "@/lib/validators/user";
import { getTileColor, getInitials } from "@/lib/avatar-color";
import { cn } from "@/lib/utils";

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
import { PageHeader } from "@/components/shared/page-header";
import { UserFormDialog } from "@/components/users/user-form-dialog";
import { DeactivateUserDialog } from "@/components/users/deactivate-user-dialog";
import { ResetPasswordDialog } from "@/components/users/reset-password-dialog";
import { UserDetailSheet } from "@/components/users/user-detail-sheet";

function getTodayLabel() {
  return new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export default function UsersPage() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [nextId, setNextId] = useState(users.length + 1);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>("All roles");

  const [modal, setModal] = useState<{
    mode: "add" | "edit";
    user: User | null;
  } | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<User | null>(null);
  const [resetTarget, setResetTarget] = useState<User | null>(null);
  const [detailTarget, setDetailTarget] = useState<User | null>(null);

  const filtered = users.filter((u) => {
    const matchesRole = roleFilter === "All roles" || u.role === roleFilter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      q === "" ||
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q);
    return matchesRole && matchesSearch;
  });

  const openAddModal = () => setModal({ mode: "add", user: null });
  const openEditModal = (user: User) => setModal({ mode: "edit", user });
  const closeModal = () => setModal(null);

  const handleFormSubmit = (values: UserFormValues) => {
    if (modal?.mode === "edit" && modal.user) {
      const id = modal.user.id;
      setUsers(
        users.map((u) =>
          u.id === id
            ? {
                ...u,
                name: values.name.trim(),
                username: values.username.trim(),
                role: values.role,
              }
            : u,
        ),
      );
    } else {
      setUsers([
        {
          id: nextId,
          name: values.name.trim(),
          username: values.username.trim(),
          role: values.role,
          active: true,
          joined: getTodayLabel(),
          last: "—",
        },
        ...users,
      ]);
      setNextId(nextId + 1);
    }
    closeModal();
  };

  const confirmDeactivate = () => {
    const id = deactivateTarget?.id;
    setUsers(users.map((u) => (u.id === id ? { ...u, active: !u.active } : u)));
    setDeactivateTarget(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Staff"
        count={`${users.length} ${users.length === 1 ? "member" : "members"}`}
        action={
          <Button onClick={openAddModal}>
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
                onClick={() => setDetailTarget(user)}
                className={cn(
                  "h-16 cursor-pointer",
                  !user.active && "opacity-70",
                )}
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
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(user);
                      }}
                      className="flex size-8 items-center justify-center rounded-lg border border-border bg-card"
                    >
                      <Pencil className="size-[15px] text-muted-foreground" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeactivateTarget(user);
                      }}
                      className="flex size-8 items-center justify-center rounded-lg border border-border bg-card"
                    >
                      <Power className="size-[15px] text-destructive" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <UserFormDialog
        open={modal !== null}
        onOpenChange={(open) => !open && closeModal()}
        mode={modal?.mode ?? "add"}
        user={modal?.user ?? null}
        existingUsernames={users
          .filter((u) => u.id !== modal?.user?.id)
          .map((u) => u.username)}
        onSubmit={handleFormSubmit}
      />

      <DeactivateUserDialog
        user={deactivateTarget}
        onOpenChange={(open) => !open && setDeactivateTarget(null)}
        onConfirm={confirmDeactivate}
      />

      <ResetPasswordDialog
        user={resetTarget}
        onOpenChange={(open) => !open && setResetTarget(null)}
      />

      <UserDetailSheet
        user={detailTarget}
        onOpenChange={(open) => !open && setDetailTarget(null)}
        onEdit={(user) => {
          setDetailTarget(null);
          openEditModal(user);
        }}
        onResetPassword={(user) => {
          setDetailTarget(null);
          setResetTarget(user);
        }}
      />
    </div>
  );
}
