import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Ban } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function AdminUsersList() {
  const users = [
    { id: 1, name: "Sarah Chen", email: "sarah.chen@example.com", role: "Host", meetings: 23, status: "Active", joined: "2023-12-01" },
    { id: 2, name: "Mike Ross", email: "mike.ross@example.com", role: "Host", meetings: 19, status: "Active", joined: "2023-11-15" },
    { id: 3, name: "Emma Wilson", email: "emma.wilson@example.com", role: "Host", meetings: 17, status: "Active", joined: "2023-10-20" },
    { id: 4, name: "John Doe", email: "john.doe@example.com", role: "Participant", meetings: 12, status: "Active", joined: "2024-01-05" },
    { id: 5, name: "Jane Smith", email: "jane.smith@example.com", role: "Host", meetings: 15, status: "Active", joined: "2023-12-10" },
    { id: 6, name: "Alex Johnson", email: "alex.j@example.com", role: "Participant", meetings: 8, status: "Inactive", joined: "2023-09-15" },
    { id: 7, name: "Maria Garcia", email: "maria.g@example.com", role: "Host", meetings: 21, status: "Active", joined: "2023-11-01" },
    { id: 8, name: "David Lee", email: "david.lee@example.com", role: "Participant", meetings: 5, status: "Active", joined: "2024-01-12" },
  ];

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-playfair mb-2">Users Management 👥</h1>
          <p className="text-muted-foreground">Manage all users and their permissions</p>
        </div>

        <Card className="p-6 shadow-soft">
          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Meetings</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow 
                    key={user.id} 
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.role}</Badge>
                    </TableCell>
                    <TableCell>{user.meetings}</TableCell>
                    <TableCell>
                      <Badge
                        variant={user.status === "Active" ? "default" : "secondary"}
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.joined}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Ban className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
