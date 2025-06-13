import {
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
import { registerEmployeeProvider } from "../../api/registerEmployeeProvider";

export function CreateCompany() {
  const navigate = useNavigate();

  // State for company form
  const [companyName, setCompanyName] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [hasValet, setHasValet] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // Retrieve signup form data from localStorage
      const signupForm = localStorage.getItem("signupForm");
      if (!signupForm) throw new Error("Signup form data not found.");
      const { name, phone, email, password } = JSON.parse(signupForm);

      // Prepare payload for API
      const payload = {
        employee: {
          name,
          phone,
          email,
          password,
        },
        provider: {
          name: companyName,
          phone: companyPhone,
          email: companyEmail,
          hasValet,
        },
      };
      await registerEmployeeProvider(payload);
      localStorage.removeItem("signupForm");
      navigate("/dashboard"); // Redirect after success
    } catch (err: any) {
      setError(err.message || "Failed to register.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-screen h-screen">
      <div className="w-[60%] h-screen flex flex-col justify-center">
        <Paper className="max-w-[800px] px-[200px] pt-[80px] border-0">
          <Title order={2} className="font-medium mt-4 pb-6 font-outfit">
            Create Company
          </Title>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <TextInput
              label="Name"
              placeholder="Name"
              size="md"
              radius="md"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.currentTarget.value)}
            />
            <TextInput
              label="Phone"
              placeholder="+251-911-123-456"
              size="md"
              radius="md"
              required
              value={companyPhone}
              onChange={(e) => setCompanyPhone(e.currentTarget.value)}
            />
            <div>
              <TextInput
                label="Email"
                placeholder="hello@gmail.com"
                size="md"
                radius="md"
                type="email"
                required
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.currentTarget.value)}
              />
              <Checkbox
                label="Does your company provide valet parking services?"
                mt="sm"
                size="sm"
                checked={hasValet}
                onChange={(e) => setHasValet(e.currentTarget.checked)}
              />
            </div>
            {error && <Text color="red">{error}</Text>}
            <div className="flex gap-10">
              <Link to="/signup" className="w-full">
                <button className="w-full mt-4 py-2 px-4 rounded-md bg-secondary text-white transition-colors duration-200 font-bold">
                  BACK
                </button>
              </Link>
              <button
                type="submit"
                className="w-full mt-4 py-2 px-4 rounded-md bg-primary text-white transition-colors duration-200 font-bold"
                disabled={loading}
              >
                {loading ? "Submitting..." : "FINISH"}
              </button>
            </div>
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
