"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import api from "@/lib/authAxios";
import { getErrorMessage } from "@/lib/errors";
import { FormField } from "@/components/forms/FormField";
import { FormMessage } from "@/components/forms/FormMessage";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

/**
 * `DELETE /users/me`: password confirm, or typing DELETE for accounts that
 * only sign in with Google. The server anonymises the account, keeps order
 * history and clears the cookie; we then go home.
 */
export function DeleteAccount({ googleOnly = false }: { googleOnly?: boolean }) {
  const [open, setOpen] = useState(false);
  const [useWord, setUseWord] = useState(googleOnly);
  const [password, setPassword] = useState("");
  const [word, setWord] = useState("");
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const ready = useWord ? word.trim() === "DELETE" : password.length > 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready) return;
    setDeleting(true);
    setError("");
    try {
      await api.delete("/users/me", { data: useWord ? { confirm: "DELETE" } : { password } });
      try {
        localStorage.removeItem("elvate:cart");
      } catch {
        // storage blocked: nothing to clear
      }
      window.location.assign("/");
    } catch (err) {
      setError(getErrorMessage(err, "Could not delete your account."));
      setDeleting(false);
    }
  };

  return (
    <div className="grid gap-3">
      <p className="text-sm text-muted-foreground">
        Your personal details are removed and you are signed out everywhere. Past orders and payments are kept without
        your name for our records. This can&apos;t be undone.
      </p>
      <Button variant="destructive" className="justify-self-start" onClick={() => setOpen(true)}>
        <Trash2 aria-hidden="true" />
        Delete my account
      </Button>

      <Dialog
        open={open}
        onOpenChange={(o) => {
          if (deleting) return;
          setOpen(o);
          if (!o) {
            setPassword("");
            setWord("");
            setError("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>
              This permanently removes your profile, saved addresses and sign-ins. It can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="grid gap-4" noValidate>
            {error ? <FormMessage variant="error">{error}</FormMessage> : null}
            {useWord ? (
              <FormField id="delete-word" label="Type DELETE to confirm" required>
                <Input autoComplete="off" value={word} onChange={(e) => setWord(e.target.value)} />
              </FormField>
            ) : (
              <FormField id="delete-password" label="Your password" required>
                <Input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormField>
            )}
            {!googleOnly ? (
              <Button
                type="button"
                variant="link"
                className="h-auto justify-self-start px-0 text-link"
                onClick={() => {
                  setUseWord((v) => !v);
                  setError("");
                }}
              >
                {useWord ? "I have a password" : "I only sign in with Google"}
              </Button>
            ) : null}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={deleting}>
                Keep my account
              </Button>
              <Button type="submit" variant="destructive" disabled={!ready} loading={deleting}>
                Delete account
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
