import { signOut } from "../actions";
import { Button } from "@/components/ui/button";

/** Sign-out control. Uses a form posting to the `signOut` server action. */
export function SignOutButton() {
  return (
    <form action={signOut}>
      <Button type="submit" variant="ghost" className="w-full justify-start">
        Sign out
      </Button>
    </form>
  );
}
