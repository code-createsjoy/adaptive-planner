import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useP2PChatStore, DEMO_PERSONAS } from '../store/useP2PChatStore';
import { Mail, UserPlus, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

interface AddFriendModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ALL_CONTACTS = [
  { name: 'Thai', email: 'quoc.thai@modo.app' },
  { name: 'Minh (UI Designer)', email: 'minh.designer@gmail.com' },
  { name: 'Lan (Product Lead)', email: 'lan.product@gmail.com' },
  { name: 'Huan (Fullstack Engineer)', email: 'huan.engineer@gmail.com' },
];

export function AddFriendModal({ open, onOpenChange }: AddFriendModalProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const { addFriendByEmail } = useP2PChatStore();

  const handleAdd = (targetEmail?: string, targetName?: string) => {
    const emailToUse = targetEmail || email;
    const nameToUse = targetName || name;

    if (!emailToUse.trim()) {
      setFeedback({ type: 'error', text: 'Please enter a valid Gmail address.' });
      return;
    }

    const res = addFriendByEmail(emailToUse, nameToUse);
    if (res.success) {
      setFeedback({ type: 'success', text: res.message });
      setEmail('');
      setName('');
      setTimeout(() => {
        setFeedback(null);
        onOpenChange(false);
      }, 1000);
    } else {
      setFeedback({ type: 'error', text: res.message });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] rounded-3xl border-border/80 bg-background/95 backdrop-blur-xl p-6 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2.5 text-primary mb-1">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
              <UserPlus className="size-5" />
            </div>
            <DialogTitle className="text-xl font-bold text-foreground">Add Friend by Gmail</DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            Connect with team members or study buddies using their registered Gmail to chat and sync schedule invites.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Friend's Gmail Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="name@gmail.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (feedback) setFeedback(null);
                }}
                className="pl-10 h-11 rounded-xl bg-card/60 border-border"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Display Name (Optional)</label>
            <Input
              placeholder="e.g. Alex"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 rounded-xl bg-card/60 border-border"
            />
          </div>

          {/* Quick suggestions */}
          <div className="space-y-2 pt-1">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="size-3 text-primary" /> Suggested Contacts
            </p>
            <div className="flex flex-col gap-1.5">
              {ALL_CONTACTS.filter((c) => {
                const currentUser = DEMO_PERSONAS[useP2PChatStore.getState().activeUserId];
                return !currentUser || c.email.toLowerCase() !== currentUser.email.toLowerCase();
              }).map((sug) => (
                <button
                  key={sug.email}
                  type="button"
                  onClick={() => handleAdd(sug.email, sug.name)}
                  className="flex items-center justify-between p-2 rounded-xl border border-border/60 bg-card/40 hover:bg-card hover:border-primary/40 text-left transition-all group"
                >
                  <div>
                    <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                      {sug.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground font-mono">{sug.email}</p>
                  </div>
                  <span className="text-[11px] font-semibold text-primary px-2 py-0.5 rounded-lg bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    Add
                  </span>
                </button>
              ))}
            </div>
          </div>

          {feedback && (
            <div
              className={`flex items-center gap-2 p-3 rounded-xl text-xs font-medium ${
                feedback.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-destructive/10 text-destructive border border-destructive/20'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="size-4 shrink-0" />
              ) : (
                <AlertCircle className="size-4 shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl border-border"
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleAdd()}
            className="rounded-xl bg-primary text-primary-foreground font-semibold"
          >
            Connect Friend
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
