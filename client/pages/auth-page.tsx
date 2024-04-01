import { useToggle, upperFirst } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import {
  TextInput,
  PasswordInput,
  Text,
  Paper,
  Group,
  PaperProps,
  Button,
  Anchor,
  Stack,
} from "@mantine/core";

import { useRouter } from "next/router";

export default function AuthPage(props: PaperProps) {
  const [type, toggle] = useToggle(["Login", "Register"]);
  const form = useForm({
    initialValues: {
      username: "",
      password: "",
    },

    validate: {
      username: (val) =>
        /^[a-zA-Z0-9._]+$/.test(val) ? null : "Invalid username",
      password: (val) =>
        val.length <= 6
          ? "Password should include at least 6 characters"
          : null,
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    form.validate();
    // Check if there are any validation errors
    if (Object.keys(form.errors).length > 0) {
      return;
    }

    const formData = {
      type: type.toLowerCase(),
      ...form.values,
    };
    authorize(formData);
  };

  const router = useRouter();
  function authorize(data: Object) {
    console.log(data);
    fetch("http://localhost:8080/api/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Invalid username or password");
        }
        return response.json();
      })
      .then((data) => {
        if (
          data.message === "Login successful!" ||
          data.message === "User registered successfully!"
        ) {
          localStorage.setItem("username", data.username);
          router.push("/account");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  return (
    <div className="">
      <Paper
        radius="lg"
        p="xl"
        withBorder
        {...props}
        className="w-1/2 mx-auto mt-40"
      >
        <Text size="2xl" fw={700}>
          {type}
        </Text>

        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              required
              label="Username"
              placeholder="Your username"
              value={form.values.username}
              onChange={(event) =>
                form.setFieldValue("username", event.currentTarget.value)
              }
              error={form.errors.username && "Invalid username"}
              radius="md"
            />

            <PasswordInput
              required
              label="Password"
              placeholder="Your password"
              value={form.values.password}
              onChange={(event) =>
                form.setFieldValue("password", event.currentTarget.value)
              }
              error={
                form.errors.password &&
                "Password should include at least 6 characters"
              }
              radius="md"
            />
          </Stack>

          <Group justify="space-between" mt="xl">
            <Anchor
              component="button"
              type="button"
              c="dimmed"
              onClick={() => toggle()}
              size="xs"
            >
              {type === "Register"
                ? "Already have an account? Login"
                : "Don't have an account? Register"}
            </Anchor>
            <Button type="submit" radius="xl">
              {upperFirst(type)}
            </Button>
          </Group>
        </form>
      </Paper>
    </div>
  );
}
