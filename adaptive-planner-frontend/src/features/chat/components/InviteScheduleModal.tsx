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
import { useP2PChatStore } from '../store/useP2PChatStore';
import { PersonaId } from '../types';
import {
  CalendarDays,
  Clock,
  MapPin,
  FileText,
  CalendarPlus,
  Coffee,
  Sparkles,
  Users,
} from 'lucide-react';
import { format } from 'date-fns';

interface InviteScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientId: PersonaId;
  recipientName: string;
}

export function InviteScheduleModal({
  open,
  onOpenChange,
  recipientId,
  recipientName,
}: InviteScheduleModalProps) {
  const tomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return format(d, 'yyyy-MM-dd');
  };

  const [title, setTitle] = useState('Coffee & Design Sync ☕');
  const [date, setDate] = useState(tomorrowStr());
  const [startTime, setStartTime] = useState('15:00');
  const [endTime, setEndTime] = useState('16:00');
  const [category, setCategory] = useState<'social' | 'focus' | 'admin'>('social');
  const [location, setLocation] = useState('Highlands Coffee / Discord Voice');
  const [note, setNote] = useState('Let’s discuss the latest Modo adaptive sprint & catch up.');

  const { sendScheduleInvite } = useP2PChatStore();

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date || !startTime || !endTime) return;

    sendScheduleInvite(recipientId, {
      title: title.trim(),
      date,
      startTime,
      endTime,
      category,
      location: location.trim() || undefined,
      note: note.trim() || undefined,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-3xl border-border/80 bg-background/95 backdrop-blur-xl p-6 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2.5 text-primary mb-1">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
              <CalendarPlus className="size-5" />
            </div>
            <DialogTitle className="text-xl font-bold text-foreground">
              Propose Schedule Invite
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            Send an interactive calendar meeting card to <span className="font-semibold text-foreground">{recipientName}</span>. When accepted, it pins to both timelines.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSendInvite} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Meeting Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Study Session or Coffee Catchup"
              className="h-10 rounded-xl bg-card/60 border-border"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5 col-span-1">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <CalendarDays className="size-3 text-muted-foreground" /> Date
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-10 rounded-xl bg-card/60 border-border text-xs"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Clock className="size-3 text-muted-foreground" /> Start
              </label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-10 rounded-xl bg-card/60 border-border text-xs"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Clock className="size-3 text-muted-foreground" /> End
              </label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="h-10 rounded-xl bg-card/60 border-border text-xs"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1">
              <MapPin className="size-3 text-muted-foreground" /> Location / Meeting Link
            </label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Google Meet or Coffee Shop"
              className="h-10 rounded-xl bg-card/60 border-border"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1">
              <FileText className="size-3 text-muted-foreground" /> Note / Agenda
            </label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Quick description of the meetup"
              className="h-10 rounded-xl bg-card/60 border-border"
            />
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border-border"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-xl bg-primary text-primary-foreground font-semibold shadow-sm"
            >
              Send Invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
