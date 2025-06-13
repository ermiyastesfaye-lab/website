import {
  IconLayoutDashboard,
  IconUsers,
  IconBuilding,
  IconCalendarEvent,
  IconSettings,
  IconLogout,
} from "@tabler/icons-react";
import { Group, ScrollArea } from "@mantine/core";
import classes from "./NavbarNested.module.css";
import { LinksGroup } from "./NavBarLinksGroup/NavBarLinksGroup";
import { UserButton } from "./UserButton/UserButton";

const mockdata = [
  { label: "Dashboard", icon: IconLayoutDashboard, link: "/dashboard" },
  { label: "Employees", icon: IconUsers, link: "/employees" },
  { label: "Lots", icon: IconBuilding, link: "/lots" },
  { label: "Reservations", icon: IconCalendarEvent, link: "/reservations" },
  { label: "Settings", icon: IconSettings, link: "/settings" },
  { label: "Logout", icon: IconLogout, link: "/logout" },
];

export function NavbarNested() {
  const links = mockdata.map((item) => (
    <LinksGroup {...item} key={item.label} />
  ));

  return (
    <nav className={classes.navbar}>
      <div className={classes.header}>
        <Group justify="space-between">
          <h2 className="text-primary font-bold text-xl">Nova Parking</h2>
        </Group>
      </div>

      <ScrollArea className={classes.links}>
        <div className={classes.linksInner}>{links}</div>
      </ScrollArea>
      <div className={classes.footer}>
        <UserButton />
      </div>
    </nav>
  );
}
