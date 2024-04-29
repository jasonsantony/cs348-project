import { useState, useEffect } from "react";

import { useRouter } from "next/router";

import {
  Container,
  Grid,
  SimpleGrid,
  rem,
  Paper,
  PaperProps,
  Button,
  Text,
} from "@mantine/core";

import { RichTextEditor, Link } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import Highlight from "@tiptap/extension-highlight";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Superscript from "@tiptap/extension-superscript";
import SubScript from "@tiptap/extension-subscript";

import { modals } from "@mantine/modals";
import { IconHome, IconLogout } from "@tabler/icons-react";

const PRIMARY_COL_HEIGHT = rem(440);

export default function AccountGrid(props: PaperProps) {
  const SECONDARY_COL_HEIGHT = `calc(${PRIMARY_COL_HEIGHT} / 2 - var(--mantine-spacing-md) / 2)`;

  const router = useRouter();
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

  function HomeButton() {
    return (
      <Button
        onClick={() => {
          router.push("/user-list");
        }}
      >
        <IconHome size={20} />
      </Button>
    );
  }

  function DeleteAccountButton() {
    const openDeleteModal = () =>
      modals.openConfirmModal({
        title: "Delete your account",
        centered: true,
        children: (
          <Text size="sm">
            Are you sure you want to delete your account? This action is
            permanent.
          </Text>
        ),
        labels: { confirm: "Delete account", cancel: "No don't delete it" },
        confirmProps: { color: "red" },
        onConfirm: () =>
          deleteAccountButtonConfirm(String(localStorage.getItem("username"))),
      });

    return (
      <Button
        onClick={openDeleteModal}
        color="red"
        style={{ borderRadius: "25px", height: "45px" }}
        size="md"
      >
        Delete account
      </Button>
    );
  }

  function deleteAccountButtonConfirm(username: string) {
    fetch(`http://localhost:8080/api/delete-account/${username}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        localStorage.clear();
        router.push("/auth-page");
        console.log("Account deleted");
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  const [bio, setBio] = useState("");
  function Editor() {
    useEffect(() => {
      fetch(
        `http://localhost:8080/api/user/${localStorage.getItem("username")}/bio`
      )
        .then((response) => response.json())
        .then((data) => {
          setBio(data.bio);
          console.log("Bio fetched");
        });
    }, []);

    const editor = useEditor({
      extensions: [
        StarterKit,
        Underline,
        Link,
        Superscript,
        SubScript,
        Highlight,
        TextAlign.configure({ types: ["heading", "paragraph"] }),
      ],
      content: bio,
      onUpdate: ({ editor }) => {
        const newBio = editor.getHTML();
        fetch(
          `http://localhost:8080/api/user/${localStorage.getItem(
            "username"
          )}/bio`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ bio: newBio }),
          }
        )
          .then((res) => {
            if (res.ok) return res.json();
            else {
              throw new Error("Error");
            }
          })
          .then((data) => {
            console.log(data);
          })
          .catch((error) => console.error(error));
      },
    });

    return (
      <RichTextEditor editor={editor} className="h-full overflow-auto w-full">
        <RichTextEditor.Toolbar sticky stickyOffset={0}>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold />
            <RichTextEditor.Italic />
            <RichTextEditor.Underline />
            <RichTextEditor.Strikethrough />
            <RichTextEditor.ClearFormatting />
            <RichTextEditor.Highlight />
            <RichTextEditor.Code />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.H1 />
            <RichTextEditor.H2 />
            <RichTextEditor.H3 />
            <RichTextEditor.H4 />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Blockquote />
            <RichTextEditor.Hr />
            <RichTextEditor.BulletList />
            <RichTextEditor.OrderedList />
            <RichTextEditor.Subscript />
            <RichTextEditor.Superscript />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Link />
            <RichTextEditor.Unlink />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.AlignLeft />
            <RichTextEditor.AlignCenter />
            <RichTextEditor.AlignJustify />
            <RichTextEditor.AlignRight />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Undo />
            <RichTextEditor.Redo />
          </RichTextEditor.ControlsGroup>
        </RichTextEditor.Toolbar>

        <RichTextEditor.Content />
      </RichTextEditor>
    );
  }

  return (
    <div className="">
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          display: "flex",
          gap: "10px",
        }}
      >
        <HomeButton />
        <LogOutButton />
      </div>
      <Paper
        radius="lg"
        withBorder
        {...props}
        className="w-5/6 mx-auto mt-40 overflow-auto p-5"
      >
        <h1
          style={{ textAlign: "center", color: "gray" }}
          className="text-2xl font-bold"
        >
          Account Management
        </h1>
        <Container my="md">
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <Paper
              radius="md"
              p="sm"
              withBorder
              {...props}
              className=""
              style={{
                display: "flex",
                flexDirection: "column", // Add this line to arrange children vertically
                justifyContent: "center",
                alignItems: "center",
                height: PRIMARY_COL_HEIGHT, // Set the height to PRIMARY_COL_HEIGHT
              }}
            >
              <BioText />
              <Editor />
            </Paper>
            <Grid gutter="md">
              <Grid.Col>
                <Paper
                  radius="md"
                  p="sm"
                  withBorder
                  {...props}
                  className=""
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: SECONDARY_COL_HEIGHT, // Set the height to SECONDARY_COL_HEIGHT
                  }}
                >
                  <ThankYouNote />
                </Paper>
              </Grid.Col>
              <Grid.Col>
                <Paper
                  radius="md"
                  p="sm"
                  withBorder
                  {...props}
                  className=""
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: SECONDARY_COL_HEIGHT, // Set the height to SECONDARY_COL_HEIGHT
                  }}
                >
                  <DeleteAccountButton />
                </Paper>
              </Grid.Col>
            </Grid>
          </SimpleGrid>
        </Container>
      </Paper>
    </div>
  );
}

const BioText = () => <p style={{ fontWeight: "600" }}>Edit Bio</p>;

const colors = ["blue", "red", "green", "yellow", "orange", "pink"];

const ThankYouNote = () => {
  const [colorIndex, setColorIndex] = useState(0);

  const handleClick = () => {
    setColorIndex((colorIndex + 1) % colors.length);
  };

  return (
    <Button
      color={colors[colorIndex]}
      onClick={handleClick}
      style={{ borderRadius: "25px", height: "45px" }}
      size="xl"
    >
      🎉 🎉 🎉
    </Button>
  );
};
