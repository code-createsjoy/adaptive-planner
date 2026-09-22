import React, { useMemo } from 'react';
import { ScheduleInviteData } from '../types';
import { useP2PChatStore, DEMO_PERSONAS } from '../store/useP2PChatStore';
import { useTimeBlocksQuery, useCreateTimeBlockMutation } from '@/hooks/useTimeBlocks';
import {
  CalendarPlus,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  Users,
  Check,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface ScheduleInviteCardProps {
  invite: ScheduleInviteData;
}

export function ScheduleInviteCard({ invite }: ScheduleInviteCardProps) {
  const { activeUserId, respondToInvite } = useP2PChatStore();
  const createBlockMutation = useCreateTimeBlockMutation();

  const isSender = activeUserId === invite.senderId;
  const isRecipient = activeUserId === invite.recipientId;
  const senderPersona = DEMO_PERSONAS[invite.senderId] || { name: 'Sender' };

  // Fetch target date blocks to detect conflicts
  const { data: dateBlocks = [] } = useTimeBlocksQuery(invite.date);

  const conflict = useMemo(() => {
    if (!dateBlocks || dateBlocks.length === 0) return null;
    const invStart = timeToMinutes(invite.startTime);
    const invEnd = timeToMinutes(invite.endTime);

    for (const b of dateBlocks) {
      const bStart = timeToMinutes(b.startTime);
      const bEnd = timeToMinutes(b.endTime);
      if (Math.max(invStart, bStart) < Math.min(invEnd, bEnd)) {
        return b;
      }
    }
    return null;
  }, [dateBlocks, invite.startTime, invite.endTime]);

  const handleAccept = async () => {
    respondToInvite(invite.inviteId, 'ACCEPTED');

    try {
      await createBlockMutation.mutateAsync({
        title: `${invite.title} (with ${senderPersona.name})`,
        targetDate: invite.date,
        startTime: invite.startTime,
        endTime: invite.endTime,
        category: 'social',
        energyLevel: 'medium',
        isFixed: true,
        priority: 'high',
        note: invite.note
          ? `${invite.note} — Scheduled via Friends Chat`
          : `Meeting scheduled via Friends Chat with ${senderPersona.name}`,
      });
      toast.success(`Meeting accepted & added to your timeline! 🎉`);
    } catch (e) {
      console.error('Failed to sync to timeline:', e);
      toast.success(`Meeting accepted!`);
    }
  };

  const handleDecline = () => {
    respondToInvite(invite.inviteId, 'DECLINED');
    toast.info('Meeting invitation declined.');
  };

  return (
    <div className="w-full max-w-sm rounded-2xl border border-primary/20 bg-card/90 shadow-md backdrop-blur-md p-4 space-y-3 transition-all hover:border-primary/40">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 border-b border-border/60 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <CalendarPlus className="size-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-primary font-bold">
              Schedule Invitation
            </span>
            <h4 className="text-sm font-bold text-foreground leading-tight">{invite.title}</h4>
          </div>
        </div>

        {/* Status Badge */}
        {invite.status === 'ACCEPTED' && (
          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-bold gap-1 px-2 py-0.5">
            <CheckCircle2 className="size-3" /> Confirmed
          </Badge>
        )}
        {invite.status === 'DECLINED' && (
          <Badge variant="outline" className="text-muted-foreground border-border text-[10px] gap-1 px-2 py-0.5">
            <XCircle className="size-3" /> Declined
          </Badge>
        )}
        {invite.status === 'PENDING' && (
          <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] font-semibold gap-1 px-2 py-0.5">
            Pending
          </Badge>
        )}
      </div>

      {/* Details list */}
      <div className="space-y-1.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-2 text-foreground font-medium">
          <Calendar className="size-3.5 text-primary shrink-0" />
          <span>{invite.date}</span>
          <span className="text-muted-foreground">·</span>
          <Clock className="size-3.5 text-primary shrink-0" />
          <span>{invite.startTime} - {invite.endTime}</span>
        </div>

        {invite.location && (
          <div className="flex items-center gap-2">
            <MapPin className="size-3.5 text-muted-foreground shrink-0" />
            <span className="truncate">{invite.location}</span>
          </div>
        )}

        {invite.note && (
          <p className="text-[11px] text-muted-foreground italic bg-muted/40 p-2 rounded-lg border border-border/40">
            "{invite.note}"
          </p>
        )}
      </div>

      {/* Conflict Check Hint */}
      {invite.status === 'PENDING' && (
        <div className="pt-0.5">
          {conflict ? (
            <div className="flex items-center gap-1.5 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-300 font-medium">
              <AlertTriangle className="size-3.5 shrink-0 text-amber-500" />
              <span>Overlaps with: <strong>{conflict.title}</strong> ({conflict.startTime}-{conflict.endTime})</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium px-1">
              <CheckCircle2 className="size-3.5 shrink-0" />
              <span>No schedule conflict detected on your calendar</span>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {invite.status === 'PENDING' && (
        <div className="pt-1">
          {isRecipient ? (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleAccept}
                className="flex-1 rounded-xl bg-primary text-primary-foreground font-bold text-xs h-9 shadow-xs hover:bg-primary/90 gap-1.5"
              >
                <Check className="size-3.5" /> Accept & Sync
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDecline}
                className="rounded-xl border-border text-muted-foreground hover:text-foreground text-xs h-9 px-3"
              >
                <X className="size-3.5" /> Decline
              </Button>
            </div>
          ) : (
            <div className="p-2 rounded-xl bg-muted/50 border border-border/50 text-center text-[11px] text-muted-foreground font-medium">
              Waiting for recipient to respond...
            </div>
          )}
        </div>
      )}

      {invite.status === 'ACCEPTED' && (
        <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-center gap-1.5">
          <Sparkles className="size-3.5" /> Event synchronized to timeline
        </div>
      )}
    </div>
  );
}

function timeToMinutes(t: string): number {
  if (!t) return 0;
  const [h, m] = t.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}
