import { WelcomeEmail } from "../src/templates/welcome";

export default function WelcomeEmailPreview() {
  return <WelcomeEmail appUrl="http://localhost:3000/protected" locale="en" name="Taylor" />;
}
