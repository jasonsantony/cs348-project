import {
  Container,
  Grid,
  SimpleGrid,
  rem,
  Paper,
  PaperProps,
  SegmentedControl,
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

const PRIMARY_COL_HEIGHT = rem(440);

export function LeadGrid(props: PaperProps) {
  const SECONDARY_COL_HEIGHT = `calc(${PRIMARY_COL_HEIGHT} / 2 - var(--mantine-spacing-md) / 2)`;

  return (
    <div className="">
      <Paper
        radius="lg"
        withBorder
        {...props}
        className="w-5/6 mx-auto mt-40 overflow-auto p-5"
      >
        <h1 style={{ textAlign: "center" }} className="text-2xl font-bold">
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
                  <SegmentedControl
                    radius="xl"
                    size="md"
                    data={["User", "Admin"]}
                    defaultValue="User"
                    onChange={(newValue) => {
                      const response = fetch(
                        "https://your-backend-url.com/api-endpoint",
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({ value: newValue }),
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
                          // do whatever
                        })
                        .catch((error) => console.error(error));
                    }}
                  />
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

const content =
  '<h2 style="text-align: center;">Welcome to Mantine rich text editor</h2><p><code>RichTextEditor</code> component focuses on usability and is designed to be as simple as possible to bring a familiar editing experience to regular users. <code>RichTextEditor</code> is based on <a href="https://tiptap.dev/" rel="noopener noreferrer" target="_blank">Tiptap.dev</a> and supports all of its features:</p><ul><li>General text formatting: <strong>bold</strong>, <em>italic</em>, <u>underline</u>, <s>strike-through</s> </li><li>Headings (h1-h6)</li><li>Sub and super scripts (<sup>&lt;sup /&gt;</sup> and <sub>&lt;sub /&gt;</sub> tags)</li><li>Ordered and bullet lists</li><li>Text align&nbsp;</li><li>And all <a href="https://tiptap.dev/extensions" target="_blank" rel="noopener noreferrer">other extensions</a></li></ul>';

function Editor() {
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
    content,
  });

  return (
    <RichTextEditor editor={editor} className="h-full overflow-auto">
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

const BioText = () => <p style={{ fontWeight: "600" }}>Edit Bio</p>;

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
      onCancel: () => console.log("Cancel"),
      onConfirm: () => console.log("Confirmed"),
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
