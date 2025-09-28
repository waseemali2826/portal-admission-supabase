import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";

export type CampusStatus = "active" | "suspended";
export interface Campus {
  id: string;
  name: string;
  code: string;
  city: string;
  address?: string;
  status: CampusStatus;
}

const CITIES = ["Faisalabad", "Lahore", "Islamabad"];

export default function Campuses() {
  const [campuses, setCampuses] = useState<Campus[]>([
    {
      id: "c-1",
      name: "Main Campus",
      code: "MAIN",
      city: "Faisalabad",
      address: "Canal Road",
      status: "active",
    },
    {
      id: "c-2",
      name: "North Campus",
      code: "NTH",
      city: "Lahore",
      address: "DHA",
      status: "suspended",
    },
  ]);
  const [selectedId, setSelectedId] = useState<string>(campuses[0]?.id || "");

  const selected = useMemo(
    () => campuses.find((c) => c.id === selectedId) || campuses[0],
    [campuses, selectedId],
  );
  const suspended = campuses.filter((c) => c.status === "suspended");

  const addCampus = (c: Omit<Campus, "id">) => {
    const id = `c-${Date.now()}`;
    setCampuses((prev) => [...prev, { ...c, id }]);
    toast({
      title: "Campus added",
      description: `${c.name} (${c.code}) created.`,
    });
  };

  const updateCampus = (id: string, patch: Partial<Campus>) => {
    setCampuses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    );
    toast({ title: "Campus updated" });
  };

  const setStatus = (id: string, status: CampusStatus) =>
    updateCampus(id, { status });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Campus Management</h1>

      <Tabs defaultValue="add">
        <TabsList>
          <TabsTrigger value="add">Add New Campus</TabsTrigger>
          <TabsTrigger value="manage">Manage Current Campus</TabsTrigger>
          <TabsTrigger value="suspended">Suspended</TabsTrigger>
          <TabsTrigger value="all">All Campuses</TabsTrigger>
        </TabsList>

        <TabsContent value="add" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New Campus</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="grid gap-4 sm:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const data = Object.fromEntries(
                    new FormData(e.currentTarget).entries(),
                  );
                  addCampus({
                    name: String(data.name),
                    code: String(data.code).toUpperCase(),
                    city: String(data.city),
                    address: String(data.address || ""),
                    status: "active",
                  });
                  (e.currentTarget as HTMLFormElement).reset();
                }}
              >
                <div className="space-y-1.5">
                  <Label htmlFor="name">Campus Name</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    placeholder="e.g., City Campus"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="code">Code</Label>
                  <Input
                    id="code"
                    name="code"
                    required
                    placeholder="e.g., CC"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="city">City</Label>
                  <Select name="city" defaultValue={CITIES[0]}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {CITIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="Street and area"
                  />
                </div>
                <div className="sm:col-span-2 flex justify-end gap-2">
                  <Button type="reset" variant="outline">
                    Reset
                  </Button>
                  <Button type="submit">Create Campus</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Manage Current Campus</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-w-xs">
                <Label>Select Campus</Label>
                <Select value={selected?.id} onValueChange={setSelectedId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {campuses.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} ({c.code})
                        </SelectItem>
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
                    const data = Object.fromEntries(
                      new FormData(e.currentTarget).entries(),
                    );
                    updateCampus(selected.id, {
                      name: String(data.name),
                      code: String(data.code).toUpperCase(),
                      city: String(data.city),
                      address: String(data.address || ""),
                    });
                  }}
                >
                  <div className="space-y-1.5">
                    <Label htmlFor="m-name">Campus Name</Label>
                    <Input
                      id="m-name"
                      name="name"
                      defaultValue={selected.name}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="m-code">Code</Label>
                    <Input
                      id="m-code"
                      name="code"
                      defaultValue={selected.code}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>City</Label>
                    <Select name="city" defaultValue={selected.city}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {CITIES.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="m-address">Address</Label>
                    <Input
                      id="m-address"
                      name="address"
                      defaultValue={selected.address}
                    />
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-2">
                    <Badge
                      variant={
                        selected.status === "active" ? "default" : "secondary"
                      }
                    >
                      {selected.status === "active" ? "Active" : "Suspended"}
                    </Badge>
                    <div className="ml-auto flex gap-2">
                      {selected.status === "active" ? (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setStatus(selected.id, "suspended")}
                        >
                          Suspend
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          onClick={() => setStatus(selected.id, "active")}
                        >
                          Activate
                        </Button>
                      )}
                      <Button type="submit">Save Changes</Button>
                    </div>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suspended" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Suspended Campuses</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suspended.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.name}</TableCell>
                      <TableCell>{c.code}</TableCell>
                      <TableCell>{c.city}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">Suspended</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => setStatus(c.id, "active")}
                        >
                          Activate
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!suspended.length && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground"
                      >
                        No suspended campuses.
                      </TableCell>
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
              <CardTitle>All Campuses</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campuses.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.name}</TableCell>
                      <TableCell>{c.code}</TableCell>
                      <TableCell>{c.city}</TableCell>
                      <TableCell>
                        {c.status === "active" ? (
                          <Badge>Active</Badge>
                        ) : (
                          <Badge variant="secondary">Suspended</Badge>
                        )}
                      </TableCell>
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
