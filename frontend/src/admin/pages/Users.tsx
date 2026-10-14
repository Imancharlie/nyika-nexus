import { useState } from "react";
import { adminApi, fmtDate, fmtDay, useAdminList, useAdminMutation } from "../lib";
import { PageTitle, Pager, Pill, SearchBox, Select, Table, Td } from "../ui";
import { prettyPhone } from "@/lib/api";
import { TZ_REGIONS } from "@/lib/regions";
import { useAuth, type User } from "@/context/AuthContext";
import { Switch } from "@/components/ui/switch";

type AdminUser = User & { isActive: boolean; lastLogin: string | null; ordersCount: number };

const Users = () => {
  const { user: me } = useAuth();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [region, setRegion] = useState("");
  const [verified, setVerified] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminList<AdminUser>("/admin/users/", {
    search,
    is_staff: role === "staff" ? "true" : role === "farmers" ? "false" : undefined,
    phone_verified: verified || undefined,
    region: region || undefined,
    page,
  });
  const update = useAdminMutation(
    ({ id, body }: { id: number; body: Record<string, unknown> }) => adminApi.patch(`/admin/users/${id}/`, body),
    "User updated",
  );

  return (
    <div>
      <PageTitle title="Users" subtitle="Everyone who has registered on AGRIMIKA." />
      <div className="mb-4 flex flex-wrap gap-2">
        <SearchBox value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Name, username or phone" />
        <Select value={role} onChange={(v) => { setRole(v); setPage(1); }} options={[{ value: "", label: "All roles" }, { value: "farmers", label: "Farmers" }, { value: "staff", label: "Staff (admins)" }]} />
        <Select value={verified} onChange={(v) => { setVerified(v); setPage(1); }} options={[{ value: "", label: "Any phone status" }, { value: "true", label: "Phone verified" }, { value: "false", label: "Not verified" }]} />
        <Select value={region} onChange={(v) => { setRegion(v); setPage(1); }} options={[{ value: "", label: "All regions" }, ...TZ_REGIONS.map((r) => ({ value: r, label: r }))]} />
      </div>

      <Table head={["User", "Phone", "Region", "Joined", "Last login", "Orders", "Active", "Admin"]} loading={isLoading} empty={!data?.results.length}>
        {data?.results.map((u) => (
          <tr key={u.id} className="hover:bg-chip/30">
            <Td>
              <div className="flex items-center gap-3">
                <img src={u.avatar} alt="" className="h-9 w-9 rounded-full bg-chip" />
                <div>
                  <p className="font-semibold">{u.fullName}</p>
                  <p className="text-xs text-muted-foreground">@{u.username}</p>
                </div>
              </div>
            </Td>
            <Td>
              <p className="whitespace-nowrap">{prettyPhone(u.phone)}</p>
              <button
                type="button"
                onClick={() => update.mutate({ id: u.id, body: { phoneVerified: !u.phoneVerified } })}
                title="Click to toggle"
              >
                {u.phoneVerified ? <Pill tone="green">verified</Pill> : <Pill tone="amber">not verified</Pill>}
              </button>
            </Td>
            <Td>{u.region || "—"}</Td>
            <Td className="whitespace-nowrap">{fmtDay(u.dateJoined)}</Td>
            <Td className="whitespace-nowrap text-muted-foreground">{fmtDate(u.lastLogin)}</Td>
            <Td className="tabular-nums">{u.ordersCount}</Td>
            <Td>
              <Switch
                checked={u.isActive}
                disabled={u.id === me?.id}
                onCheckedChange={(v) => update.mutate({ id: u.id, body: { isActive: v } })}
              />
            </Td>
            <Td>
              <Switch
                checked={u.isStaff}
                disabled={u.id === me?.id}
                onCheckedChange={(v) => update.mutate({ id: u.id, body: { isStaff: v } })}
              />
            </Td>
          </tr>
        ))}
      </Table>
      <Pager page={page} count={data?.count ?? 0} onPage={setPage} />
    </div>
  );
};

export default Users;
