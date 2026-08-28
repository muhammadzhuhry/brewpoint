"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Power } from "lucide-react";
import { toast } from "sonner";

import type { User } from "@/lib/types";
import type { UserFormValues } from "@/lib/validators/user";
import { useUsers } from "@/hooks/use-users";
import { apiPost, apiPut, apiPatch } from "@/lib/api-client";
import { ApiError } from "@/lib/api-error";
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

export default function UsersPage() {
  const queryClient = useQueryClient();

  const { data } = useUsers();
  const users = data ?? [];

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All roles");

  const [modal, setModal] = useState<{
    mode: "add" | "edit";
    user: User | null;
  } | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<User | null>(null);
  const [resetTarget, setResetTarget] = useState<User | null>(null);
  const [detailTarget, setDetailTarget] = useState<User | null>(null);

  const filtered = users.filter((u) => {
    const matchesRole =
      roleFilter === "All roles" || u.role === roleFilter.toLowerCase();
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

  const createMutation = useMutation({
    mutationFn: (body: {
      username: string;
      password: string;
      name: string;
      role: "admin" | "cashier";
    }) => apiPost<User>("/users", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      closeModal();
      toast.success("Staff member added");
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Failed to add staff member",
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: { username: string; name: string; role: "admin" | "cashier" };
    }) => apiPut<User>(`/users/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      closeModal();
      toast.success("Staff member updated");
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Failed to update staff member",
      );
    },
  });

  const setActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiPatch<User>(`/users/${id}`, { isActive }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setDeactivateTarget(null);
      toast.success(
        variables.isActive
          ? "Staff member reactivated"
          : "Staff member deactivated",
      );
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : "Failed to update status",
      );
    },
  });

  const handleFormSubmit = (values: UserFormValues) => {
    const role = values.role.toLowerCase() as "admin" | "cashier";
    if (modal?.mode === "edit" && modal.user) {
      updateMutation.mutate({
        id: modal.user.id,
        body: {
          username: values.username.trim(),
          name: values.name.trim(),
          role,
        },
      });
    } else {
      createMutation.mutate({
        username: values.username.trim(),
        password: values.password ?? "",
        name: values.name.trim(),
        role,
      });
    }
  };

  const confirmDeactivate = () => {
    if (deactivateTarget) {
      setActiveMutation.mutate({
        id: deactivateTarget.id,
        isActive: !deactivateTarget.isActive,
      });
    }
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

        <Select
          value={roleFilter}
          onValueChange={(value) => value && setRoleFilter(value)}
        >
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
                  !user.isActive && "opacity-70",
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
                  <Badge variant={user.role === "admin" ? "secondary" : "info"}>
                    {user.role === "admin" ? "Admin" : "Cashier"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <StatusBadge status={user.isActive ? "active" : "inactive"} />
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
