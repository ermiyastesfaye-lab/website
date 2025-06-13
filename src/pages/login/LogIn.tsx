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
import { useState } from "react";
import { loginEmployee } from "../../api/Login";
import image from "../../assets/images/log_in.png";

export function LogIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await loginEmployee({ email, password });
      localStorage.setItem("token", res.token);
      // Optionally handle rememberMe logic here
      navigate("/dashboard"); // Redirect to dashboard or desired page
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-screen h-screen">
      <div className="w-1/2 h-screen">
        <img
          src={image}
          alt="Login illustration"
          className="w-full h-screen object-cover"
        />
      </div>
      <div className="w-[60%] h-screen flex flex-col justify-center">
        <Paper className="max-w-[800px] px-[200px] pt-[80px] border-0">
          <Title order={2} className="font-medium mt-4 pb-6 font-outfit">
            Welcome Back!
          </Title>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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
            {error && <Text color="red">{error}</Text>}
            <button
              type="submit"
              className="w-full mt-4 py-2 px-4 rounded-md bg-primary text-white hover:bg-primary transition-colors duration-200 font-bold"
              disabled={loading}
            >
              {loading ? "Logging in..." : "LOG IN"}
            </button>
          </form>
          <Text ta="center" mt="md">
            Don't have an account?{" "}
            <Link to="/signup" className="text-secondary font-bold">
              Sign up
            </Link>
          </Text>
        </Paper>
      </div>
    </div>
  );
}
