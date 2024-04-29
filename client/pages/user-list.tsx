import { use, useEffect, useState } from "react";
import {
  Paper,
  Table,
  ScrollArea,
  UnstyledButton,
  Group,
  Anchor,
  Text,
  Center,
  TextInput,
  rem,
  keys,
  PaperProps,
  Button,
} from "@mantine/core";
import {
  IconSelector,
  IconChevronDown,
  IconChevronUp,
  IconSearch,
  IconUser,
  IconLogout,
} from "@tabler/icons-react";
import classes from "../styles/user-list.module.css";
import { Router, useRouter } from "next/router";

interface RowData {
  username: string;
  bio: string;
}

interface ThProps {
  children: React.ReactNode;
  reversed: boolean;
  sorted: boolean;
  onSort(): void;
}

type RowJson = {
  username: string;
  bio: string;
};

function Th({ children, reversed, sorted, onSort }: ThProps) {
  const Icon = sorted
    ? reversed
      ? IconChevronUp
      : IconChevronDown
    : IconSelector;
  return (
    <Table.Th className={classes.th}>
      <UnstyledButton onClick={onSort} className={classes.control}>
        <Group justify="space-between">
          <Text fw={500} fz="sm">
            {children}
          </Text>
          <Center className={classes.icon}>
            <Icon style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
          </Center>
        </Group>
      </UnstyledButton>
    </Table.Th>
  );
}

function filterData(data: RowData[], search: string) {
  const query = search.toLowerCase().trim();
  return data.filter((item) =>
    keys(data[0]).some((key) => item[key].toLowerCase().includes(query))
  );
}

function sortData(
  data: RowData[],
  payload: { sortBy: keyof RowData | null; reversed: boolean; search: string }
) {
  const { sortBy } = payload;

  if (!sortBy) {
    return filterData(data, payload.search);
  }

  return filterData(
    [...data].sort((a, b) => {
      if (payload.reversed) {
        return b[sortBy].localeCompare(a[sortBy]);
      }

      return a[sortBy].localeCompare(b[sortBy]);
    }),
    payload.search
  );
}

export default function UserList(props: PaperProps) {
  const [users, setUsers] = useState<RowJson[]>([]);
  useEffect(() => {
    fetch("http://localhost:8080/api/user-list")
      .then((response) => response.json())
      .then((data) => {
        setUsers(data);
      })
      .catch((error) => {
        console.error("Error fetching users: ", error);
      });
  }, []);

  const router = useRouter();
  function TableSort() {
    const [search, setSearch] = useState("");
    const [sortedData, setSortedData] = useState(users);
    const [sortBy, setSortBy] = useState<keyof RowData | null>(null);
    const [reverseSortDirection, setReverseSortDirection] = useState(false);

    const setSorting = (field: keyof RowData) => {
      const reversed = field === sortBy ? !reverseSortDirection : false;
      setReverseSortDirection(reversed);
      setSortBy(field);
      setSortedData(sortData(users, { sortBy: field, reversed, search }));
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.currentTarget;
      setSearch(value);
      setSortedData(
        sortData(users, {
          sortBy,
          reversed: reverseSortDirection,
          search: value,
        })
      );
    };

    const rows = sortedData.map((row) => (
      <Table.Tr key={row.username}>
        <Table.Td>
          <Anchor
            component="button"
            fz="sm"
            onClick={() => {
              localStorage.setItem("blogPageUsername", row.username);
              router.push("/blog-page");
            }}
          >
            {row.username}
          </Anchor>
        </Table.Td>
        <Table.Td>{row.bio}</Table.Td>
      </Table.Tr>
    ));

    return (
      <ScrollArea>
        <TextInput
          placeholder="Search by any field"
          mb="md"
          leftSection={
            <IconSearch
              style={{ width: rem(16), height: rem(16) }}
              stroke={1.5}
            />
          }
          value={search}
          onChange={handleSearchChange}
        />
        <Table
          horizontalSpacing="md"
          verticalSpacing="xs"
          miw={700}
          layout="fixed"
        >
          <Table.Tbody>
            <Table.Tr>
              <Th
                sorted={sortBy === "username"}
                reversed={reverseSortDirection}
                onSort={() => setSorting("username")}
              >
                Username
              </Th>
              <Table.Th>Bio</Table.Th>
            </Table.Tr>
          </Table.Tbody>
          <Table.Tbody>
            {rows.length > 0 ? (
              rows
            ) : (
              <Table.Tr>
                <Table.Td colSpan={users[0] ? Object.keys(users[0]).length : 0}>
                  <Text fw={500} ta="center">
                    Nothing found
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    );
  }

  function LogOutButton() {
    return (
      <Button
        onClick={() => {
          localStorage.clear();
          router.push("/");
          console.log("Logged out");
        }}
      >
        <IconLogout size={20} />
      </Button>
    );
  }

  return (
    <div
      className={classes.wrapper}
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          display: "flex",
          gap: "10px",
        }}
      >
        <Button onClick={() => router.push("/account")}>
          <IconUser size={20} />
        </Button>
        <LogOutButton />
      </div>
      <div>
        <h1 style={{ fontSize: "2em", fontWeight: "bold", color: "gray" }}>
          Rate Shows and Stuff
        </h1>
      </div>
      <Paper
        radius="lg"
        p="xl"
        withBorder
        {...props}
        style={{
          maxWidth: "87.5%",
          width: "100%",
          height: "82.5vh",
          overflow: "auto",
        }}
      >
        <TableSort />
      </Paper>
    </div>
  );
}
