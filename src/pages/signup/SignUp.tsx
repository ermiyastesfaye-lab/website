import {
  Anchor,
  Button,
  Checkbox,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { Link, useNavigate } from "react-router-dom";
import image from "../../assets/images/sign_up.png";
import { useState } from "react";

export function SignUp() {
  const navigate = useNavigate();

  // State for form fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Store form data for later use (e.g., in context or localStorage)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save form data to localStorage for use after company creation
    localStorage.setItem(
      "signupForm",
      JSON.stringify({ name, phone, email, password, rememberMe })
    );
    navigate("/createcompany");
  };

  return (
    <div className="flex w-screen h-screen">
      <div className="w-[60%] h-screen flex flex-col justify-center">
        <Paper className="max-w-[800px] px-[200px] pt-[80px] border-0">
          <Title order={2} className="font-medium mt-4 pb-6 font-outfit">
            Get Started With Nova
          </Title>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <TextInput
              label="Name"
              placeholder="Name"
              size="md"
              radius="md"
              required
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
            />
            <TextInput
              label="Phone"
              placeholder="+251-911-123-456"
              size="md"
              radius="md"
              required
              value={phone}
              onChange={(e) => setPhone(e.currentTarget.value)}
            />
            <TextInput
              label="Email"
              placeholder="hello@gmail.com"
              size="md"
              radius="md"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
            />
            <div>
              <PasswordInput
                label="Password"
                placeholder="Your password"
                size="md"
                radius="md"
                required
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full   mt-4 py-2 px-4 rounded-md bg-primary text-white hover:bg-primary transition-colors duration-200 font-bold"
            >
              Create Company
            </button>
          </form>

          <Text ta="center" mt="md">
            Already have an account?{" "}
            <Link to="/" className="text-secondary font-bold">
              Log in
            </Link>
          </Text>
        </Paper>
      </div>
      <div className="w-1/2 h-screen">
        <img
          src={image}
          alt="Sign up illustration"
          className="w-full h-screen object-cover"
        />
      </div>
    </div>
  );
}
