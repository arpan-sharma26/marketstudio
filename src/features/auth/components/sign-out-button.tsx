"use client";

import { useFormStatus } from "react-dom";

import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { signOut } from "../actions";

function SignOutSubmit() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="ghost"
      className="gap-2 whitespace-nowrap"
      disabled={pending}
      aria-disabled={pending}
    >
      {pending ? (
        <>
          <Spinner label="Signing out" />
          Signing out…
        </>
      ) : (
        "Sign out"
      )}
    </Button>
  );
}

/** Sign-out control. Uses a form posting to the `signOut` server action. */
export function SignOutButton() {
  return (
    <form action={signOut}>
      <SignOutSubmit />
    </form>
  );
}
