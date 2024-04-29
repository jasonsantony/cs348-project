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
  TextInput,
  ActionIcon,
  rem,
  HoverCard,
} from "@mantine/core";

import { IconTrash, IconHome, IconUser, IconLogout } from "@tabler/icons-react";

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
import { use, useEffect, useState } from "react";
import { Router, useRouter } from "next/router";
import { format, formatDistanceToNow, parseISO, set } from "date-fns";
import parse from "html-react-parser";

type ReviewJson = {
  review_id: number;
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
  const [refresh, setRefresh] = useState(false);
  const [statistics, setStatistics] = useState({
    mean: 0,
    min: 0,
    med: 0,
    max: 0,
  });

  const router = useRouter();

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
  }, [refresh]);

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
              sections={[{ value: rating_value * 10, color: color }]}
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
            <Text fz="xl" style={{ marginBottom: "0px" }}>
              {show_title}
            </Text>
            <Text fz="xs" style={{ marginBottom: "0px" }}>
              Directed by: {show_director}, {show_release_year}
            </Text>
            <Text
              fz="xs"
              c="dimmed"
              title={readableTimestamp}
              style={{ marginBottom: "0px" }}
            >
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
    const [reviewText, setReviewText] = useState("");
    const [sliderValue, setSliderValue] = useState(5);
    const [director, setDirector] = useState("");
    const [year, setYear] = useState("");
    const [title, setTitle] = useState("");

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
          setReviewText(editor.getHTML());
        }
      },
    });

    const submitReview = async () => {
      const review: ReviewJson = {
        review_id: -1,
        show_title: title,
        show_director: director,
        show_release_year: parseInt(year),
        rating_value: sliderValue,
        review_text: reviewText,
        timestamp: new Date().toISOString(),
      };

      try {
        const response = await fetch(
          `http://localhost:8080/api/user/${localStorage.getItem(
            "username"
          )}/create-review`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(review),
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        console.log("Review submitted successfully");
      } catch (error) {
        console.error("Error:", error);
      }

      setRefresh(!refresh);
      close();
      setReviewText("");
      setSliderValue(5);
      setDirector("");
      setYear("");
      setTitle("");
    };

    return (
      <>
        <Modal
          opened={opened}
          onClose={close}
          title="Compose Review"
          size="87.5%"
          radius={0}
          yOffset="14%"
          transitionProps={{ transition: "fade", duration: 200 }}
        >
          <TitleInput title={title} setTitle={setTitle} />
          <DirectorInput director={director} setDirector={setDirector} />
          <YearInput year={year} setYear={setYear} />
          <div style={{ height: "10px" }} />
          <Text size="sm" style={{ marginBottom: "5px" }}>
            Your Thoughts
          </Text>
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
          <Text size="sm" style={{ marginTop: "10px" }}>
            Rating
          </Text>
          <ReviewSlider
            sliderValue={sliderValue}
            setSliderValue={setSliderValue}
          />
          <Button onClick={submitReview}>Submit Review</Button>
        </Modal>

        <Button onClick={open}>Create Review</Button>
      </>
    );
  }

  const handleDelete = (review_id: string) => {
    fetch(`http://localhost:8080/api/review/${review_id}/delete-review`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Delete operation failed");
        }
        setRefresh(!refresh);
      })
      .catch((error) => {
        console.error("Error deleting item:", error);
      });
  };

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

  useEffect(() => {
    const ratings = reviews.map((review) => review.rating_value);
    const min = Math.min(...ratings);
    const max = Math.max(...ratings);
    const mean = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    const mid = Math.floor(ratings.length / 2);
    const nums = [...ratings].sort((a, b) => a - b);
    const med =
      ratings.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;

    setStatistics({ mean, min, med, max });
  }, [refresh]);

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
        <Button onClick={() => router.push("/user-list")}>
          <IconHome size={20} />
        </Button>
        <Button onClick={() => router.push("/account")}>
          <IconUser size={20} />
        </Button>
        <LogOutButton />
      </div>
      <div>
        <h1 style={{ fontSize: "2em", fontWeight: "bold", color: "gray" }}>
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
        p="sm"
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
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {blogPageUsername === username ? <WriteReview /> : <div />}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: username === blogPageUsername ? "-57px" : "-20px",
              marginBottom: "20px",
            }}
          >
            <Statistics {...statistics} />
          </div>
          {reviews.length === 0 ? (
            <Text
              fz="md"
              c="dimmed"
              style={{ position: "relative", top: "-5px", right: "-20px" }}
            >
              User has no reviews.
            </Text>
          ) : (
            reviews
              .sort(
                (a, b) =>
                  new Date(b.timestamp).getTime() -
                  new Date(a.timestamp).getTime()
              )
              .map((review, index) => (
                <div
                  key={review.timestamp}
                  style={{
                    position: "relative",
                    marginBottom: "10px",
                    marginTop: "-5px",
                  }}
                >
                  {username === blogPageUsername && (
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                      }}
                      onClick={() => handleDelete(String(review.review_id))}
                    >
                      <IconTrash
                        style={{
                          width: rem(20),
                          height: rem(20),
                        }}
                        stroke={1.5}
                      />
                    </ActionIcon>
                  )}
                  <Review {...review} />
                </div>
              ))
          )}
        </TypographyStylesProvider>
      </Paper>
    </div>
  );
}

interface titleInputProps {
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
}

function TitleInput({ title, setTitle }: titleInputProps) {
  return (
    <TextInput
      label="Title"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
    />
  );
}

interface DirectorInputProps {
  director: string;
  setDirector: React.Dispatch<React.SetStateAction<string>>;
}

function DirectorInput({ director, setDirector }: DirectorInputProps) {
  return (
    <TextInput
      label="Director"
      value={director}
      onChange={(e) => setDirector(e.target.value)}
    />
  );
}

interface YearInputProps {
  year: string;
  setYear: React.Dispatch<React.SetStateAction<string>>;
}

function YearInput({ year, setYear }: YearInputProps) {
  const [error, setError] = useState("");

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.currentTarget.value;
    const isNaturalNumber = /^[1-9]\d*$/.test(inputValue);

    if (isNaturalNumber || inputValue === "") {
      setYear(inputValue);
      setError("");
    } else {
      setError("Input must be a year");
    }
  };

  return (
    <TextInput
      label="Year"
      value={year}
      onChange={handleInputChange}
      autoComplete="nope"
      error={error}
    />
  );
}

interface SliderProps {
  sliderValue: number;
  setSliderValue: React.Dispatch<React.SetStateAction<number>>;
}

function ReviewSlider({ sliderValue, setSliderValue }: SliderProps) {
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
          root: { marginBottom: "20px" },
        }}
      />
    </>
  );
}

interface StatisticsProps {
  mean: number;
  min: number;
  med: number;
  max: number;
}

function Statistics({ mean, min, med, max }: StatisticsProps) {
  return (
    <Group justify="center">
      <HoverCard width={175} shadow="md">
        <HoverCard.Target>
          <Button>Statistics</Button>
        </HoverCard.Target>
        <HoverCard.Dropdown>
          <Text size="lg">Mean Rating: {mean.toFixed(2)}</Text>
          <Text size="sm">Minimum: {min}</Text>
          <Text size="sm">Median: {med.toFixed(2)}</Text>
          <Text size="sm">Maximum: {max}</Text>
        </HoverCard.Dropdown>
      </HoverCard>
    </Group>
  );
}
