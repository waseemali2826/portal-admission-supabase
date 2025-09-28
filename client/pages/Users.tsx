import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";

export type UserStatus = "active" | "suspended";
export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  status: UserStatus;
}

const ROLES = ["Admin", "Manager", "Instructor", "Counselor"];

export default function Users() {
  const [users, setUsers] = useState<UserItem[]>([
    { id: "u-1", name: "Admin User", email: "admin@example.com", role: "Admin", status: "active" },
    { id: "u-2", name: "Staff A", email: "staff@example.com", role: "Manager", status: "suspended" },
  ]);
  const [selectedId, setSelectedId] = useState<string>(users[0]?.id || "");

  const selected = useMemo(() => users.find((u) => u.id === selectedId) || users[0], [users, selectedId]);
  const active = users.filter((u) => u.status === "active");
  const suspended = users.filter((u) => u.status === "suspended");

  const addUser = (u: Omit<UserItem, "id">) => {
    const id = `u-${Date.now()}`;
    setUsers((prev) => [...prev, { ...u, id }]);
    toast({ title: "User created", description: `${u.name} (${u.role}) added.` });
  };

  const updateUser = (id: string, patch: Partial<UserItem>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
    toast({ title: "User updated" });
  };

  const setStatus = (id: string, status: UserStatus) => updateUser(id, { status });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">User Management</h1>

      <Tabs defaultValue="create">
        <TabsList className="flex flex-wrap gap-1">
          <TabsTrigger value="create">Create New User</TabsTrigger>
          <TabsTrigger value="manage">Manage Current User</TabsTrigger>
          <TabsTrigger value="active">Active Users</TabsTrigger>
          <TabsTrigger value="suspended">Suspended Users</TabsTrigger>
          <TabsTrigger value="all">All Users</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New User</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="grid gap-4 sm:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const data = Object.fromEntries(new FormData(e.currentTarget).entries());
                  addUser({
                    name: String(data.name),
                    email: String(data.email),
                    role: String(data.role),
                    phone: String(data.phone || ""),
                    status: "active",
                  });
                  (e.currentTarget as HTMLFormElement).reset();
                }}
              >
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required />
                </div>
                <div className="space-y-1.5">
                  <Label>Role</Label>
                  <Select name="role" defaultValue={ROLES[0]}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Contact Number</Label>
                  <Input id="phone" name="phone" placeholder="03xx-xxxxxxx" />
                </div>
                <div className="sm:col-span-2 flex justify-end gap-2">
                  <Button type="reset" variant="outline">Reset</Button>
                  <Button type="submit">Create User</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Manage Current User</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-w-xs">
                <Label>Select User</Label>
                <Select value={selected?.id} onValueChange={setSelectedId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {users.map((u) => (
                        <SelectItem key={u.id} value={u.id}>{u.name} ({u.role})</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {selected && (
                <form
                  className="grid gap-4 sm:grid-cols-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
                    updateUser(selected.id, {
                      name: String(data.name),
                      email: String(data.email),
                      role: String(data.role),
                      phone: String(data.phone || ""),
                    });
                  }}
                >
                  <div className="space-y-1.5">
                    <Label htmlFor="m-name">Full Name</Label>
                    <Input id="m-name" name="name" defaultValue={selected.name} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="m-email">Email</Label>
                    <Input id="m-email" name="email" type="email" defaultValue={selected.email} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Role</Label>
                    <Select name="role" defaultValue={selected.role}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="m-phone">Contact Number</Label>
                    <Input id="m-phone" name="phone" defaultValue={selected.phone} />
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-2">
                    <Badge variant={selected.status === "active" ? "default" : "secondary"}>
                      {selected.status === "active" ? "Active" : "Suspended"}
                    </Badge>
                    <div className="ml-auto flex gap-2">
                      {selected.status === "active" ? (
                        <Button type="button" variant="outline" onClick={() => setStatus(selected.id, "suspended")}>Suspend</Button>
                      ) : (
                        <Button type="button" onClick={() => setStatus(selected.id, "active")}>Activate</Button>
                      )}
                      <Button type="button" variant="outline" onClick={() => {
                        const pwd = Math.random().toString(36).slice(2, 10);
                        toast({ title: "Password reset", description: `Temporary password: ${pwd}` });
                      }}>Reset Password</Button>
                      <Button type="submit">Save Changes</Button>
                    </div>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {active.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.role}</TableCell>
                      <TableCell><Badge>Active</Badge></TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button size="sm" variant="outline" onClick={() => updateUser(u.id, { role: ROLES[(ROLES.indexOf(u.role) + 1) % ROLES.length] })}>Edit Role</Button>
                        <Button size="sm" onClick={() => setStatus(u.id, "suspended")}>Suspend</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!active.length && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">No active users.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suspended" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Suspended Users</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suspended.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.role}</TableCell>
                      <TableCell><Badge variant="secondary">Suspended</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" onClick={() => setStatus(u.id, "active")}>Activate</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!suspended.length && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">No suspended users.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.role}</TableCell>
                      <TableCell>{u.status === "active" ? <Badge>Active</Badge> : <Badge variant="secondary">Suspended</Badge>}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
