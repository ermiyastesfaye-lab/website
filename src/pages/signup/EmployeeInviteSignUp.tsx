import {
  Anchor,
  Button,
  Checkbox,
  Loader,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { Link, useLocation, useNavigate } from "react-router-dom";
import image from "../../assets/images/sign_up.png";
import { useState } from "react";
import { invitedEmployeeSignUp } from "../../api/inviteEmployee";

export function EmployeeInviteSignUp() {
  const navigate = useNavigate();
  const location = useLocation();

  // State for form fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string>("");

  // Store form data for later use (e.g., in context or localStorage)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setError("");
    // Get token from query string
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (!token) {
      setStatus("error");
      setError(
        "Invite token not found in the link. Please use the invite link from your email."
      );
      setTimeout(() => setStatus("idle"), 2000);
      return;
    }
    try {
      await invitedEmployeeSignUp(
        { name, phone, password, confirmPassword },
        token
      );
      setStatus("success");
      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err: any) {
      console.error("Signup error:", err);
      setStatus("error");
      setError(
        err?.response?.data?.message || err?.message || "Failed to sign up."
      );
      setTimeout(() => setStatus("idle"), 2000);
    }
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
            <PasswordInput
              label="Password"
              placeholder="Your password"
              size="md"
              radius="md"
              required
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
            />
            <PasswordInput
              label="Confirm Password"
              placeholder="Re-enter your password"
              size="md"
              radius="md"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.currentTarget.value)}
            />

            {status === "success" && (
              <Text c="green" ta="center">
                Sign up successful! Redirecting...
              </Text>
            )}
            {status === "error" && error && (
              <Text c="red" ta="center">
                {error}
              </Text>
            )}
            <button
              type="submit"
              className="w-full mt-4 py-2 px-4 rounded-md bg-primary text-white hover:bg-primary transition-colors duration-200 font-bold flex items-center justify-center"
              disabled={status === "submitting"}
            >
              {status === "submitting" ? (
                <>
                  <Loader size={18} color="white" style={{ marginRight: 8 }} />
                  Signing up...
                </>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          <Text ta="center" mt="md">
            Already have an account?{" "}
            <Link to="/login" className="text-secondary font-bold">
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
