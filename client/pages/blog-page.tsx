import {
  Text,
  Group,
  TypographyStylesProvider,
  Paper,
  RingProgress,
  PaperProps,
  Modal,
  Button,
  Slider,
} from "@mantine/core";

import { useDisclosure } from "@mantine/hooks";

import { RichTextEditor, Link } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import Highlight from "@tiptap/extension-highlight";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Superscript from "@tiptap/extension-superscript";
import SubScript from "@tiptap/extension-subscript";

import classes from "../styles/review.module.css";
import { useEffect, useState } from "react";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import parse from "html-react-parser";

type ReviewJson = {
  show_title: string;
  show_director: string;
  show_release_year: number;
  rating_value: number;
  review_text: string;
  timestamp: string;
};

export default function BlogPage(props: PaperProps) {
  const [reviews, setReviews] = useState<ReviewJson[]>([]);
  const [blogPageUsername, setBlogPageUsername] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  useEffect(() => {
    setBlogPageUsername(localStorage.getItem("blogPageUsername") || "");
  }, []);
  useEffect(() => {
    setUsername(localStorage.getItem("username") || "");
  }, []);

  const [blogBio, setBlogBio] = useState("");
  useEffect(() => {
    fetch(
      `http://localhost:8080/api/user/${localStorage.getItem(
        "blogPageUsername"
      )}/bio`
    )
      .then((response) => response.json())
      .then((data) => setBlogBio(data.bio));
  }, []);

  useEffect(() => {
    fetch(
      `http://localhost:8080/api/user/${localStorage.getItem(
        "blogPageUsername"
      )}/reviews`
    )
      .then((response) => response.json())
      .then((data) => {
        setReviews(data);
      })
      .catch((error) => {
        console.error("Error fetching reviews", error);
      });
  }, []);

  const [bio, setBio] = useState("");
  function BioEditor() {
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

  const Review = ({
    show_title,
    show_director,
    show_release_year,
    rating_value,
    review_text,
    timestamp,
  }: ReviewJson) => {
    const getColor = (progress: number) => {
      if (progress >= 9) return "blue";
      if (progress >= 7) return "green";
      if (progress >= 5) return "yellow";
      return "red";
    };

    const color = getColor(rating_value);

    const timeSinceReview = formatDistanceToNow(parseISO(timestamp));
    const readableTimestamp = format(parseISO(timestamp), "PPpp");

    return (
      <Paper
        withBorder
        radius="md"
        className={classes.comment}
        style={{ overflow: "auto" }}
      >
        <Group>
          <div style={{ position: "relative", width: 80, height: 80 }}>
            <RingProgress
              sections={[{ value: rating_value, color: color }]}
              roundCaps
              size={80}
              label={
                <Text c={color} fw={700} ta="center" size="xl">
                  {rating_value}
                </Text>
              }
            />
          </div>
          <div>
            <Text fz="xl">{show_title}</Text>
            <Text fz="xs">
              Directed by {show_director}, {show_release_year}
            </Text>
            <Text fz="xs" c="dimmed" title={readableTimestamp}>
              Reviewed {timeSinceReview} ago
            </Text>
          </div>
        </Group>
        <TypographyStylesProvider className={classes.body}>
          <div>{parse(review_text)}</div>
        </TypographyStylesProvider>
      </Paper>
    );
  };

  function WriteReview() {
    const [opened, { open, close }] = useDisclosure(false);
    const [reviewContent, setReviewContent] = useState("");
    const [sliderValue, setSliderValue] = useState(5);

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
      content: "",
      onUpdate: () => {
        if (editor) {
          setReviewContent(editor.getHTML());
        }
      },
    });

    const submitReview = async () => {
      // use the reviewContent variable to submit the content of the editor

      console.log(reviewContent, sliderValue);
      close();
    };

    function ReviewSlider() {
      const marks = [
        { value: 0, label: "0" },
        { value: 1, label: "1" },
        { value: 2, label: "2" },
        { value: 3, label: "3" },
        { value: 4, label: "4" },
        { value: 5, label: "5" },
        { value: 6, label: "6" },
        { value: 7, label: "7" },
        { value: 8, label: "8" },
        { value: 9, label: "9" },
        { value: 10, label: "10" },
      ];
      return (
        <>
          <Slider
            value={sliderValue}
            onChange={(val) => setSliderValue(val)}
            min={0}
            max={10}
            label={(val) => marks.find((mark) => mark.value === val)!.label}
            step={1}
            marks={marks}
            styles={{
              markLabel: { display: "none" },
              root: { margin: "40px 0" },
            }}
          />
        </>
      );
    }

    return (
      <>
        <Modal
          opened={opened}
          onClose={close}
          title="Write a Review"
          size="87.5%"
          radius={0}
          yOffset="15%"
          transitionProps={{ transition: "fade", duration: 200 }}
        >
          <RichTextEditor
            editor={editor}
            className="h-full overflow-auto w-full"
          >
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
          <ReviewSlider />
          <Button onClick={submitReview}>Submit Review</Button>
        </Modal>

        <Button onClick={open}>Write a Review</Button>
      </>
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
      <div>
        <h1 style={{ fontSize: "2em", fontWeight: "bold" }}>
          Welcome to {blogPageUsername}'s Page
        </h1>
      </div>
      <Paper
        radius="lg"
        p="sm"
        withBorder
        style={{
          maxWidth: "87.5%",
          width: "100%",
          height: "20vh",
          marginBottom: "1em", // Add some space between the papers
          overflow: username === blogPageUsername ? "hidden" : "auto",
          position: "relative",
        }}
      >
        <TypographyStylesProvider className={classes.body}>
          {username === blogPageUsername ? (
            <div
              style={{
                height: "100%",
                width: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  position: "absolute", // Add this line
                  top: 10, // Add this line
                  bottom: 10, // Add this line
                  left: 10, // Add this line
                  right: 10, // Add this line
                }}
              >
                <BioEditor />
              </div>
            </div>
          ) : blogBio ? (
            <div>{parse(blogBio)}</div>
          ) : (
            <div style={{ color: "#888" }}>
              <Text fz="md" c="dimmed" style={{ paddingLeft: "20px" }}>
                User has no bio.
              </Text>
            </div>
          )}
        </TypographyStylesProvider>
      </Paper>

      <Paper
        radius="lg"
        p="xl"
        withBorder
        {...props}
        style={{
          maxWidth: "87.5%",
          width: "100%",
          height: "60vh",
          overflow: "auto",
        }}
      >
        <TypographyStylesProvider className={classes.body}>
          <div
            style={{
              display: "flex",
              marginTop: "-10px",
              marginBottom: "20px",
            }}
          >
            {blogPageUsername === username ? <WriteReview /> : null}
          </div>
          {reviews.length === 0 ? (
            <Text fz="md" c="dimmed">
              User has no reviews.
            </Text>
          ) : (
            reviews.map((review) => (
              <Review key={review.timestamp} {...review} />
            ))
          )}
        </TypographyStylesProvider>
      </Paper>
    </div>
  );
}
