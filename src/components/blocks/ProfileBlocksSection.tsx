import type { Profile } from "@/lib/profile-storage";
import type { ProfileBlock } from "@/lib/profile-blocks";
import { groupBlocksForLayout } from "@/lib/profile-blocks";
import { ProfileBlockRenderer } from "@/components/blocks/ProfileBlockRenderer";
import { motion } from "motion/react";
import type { Transition } from "motion/react";

type Props = {
  blocks: ProfileBlock[];
  profile: Profile;
  placement: "inside" | "outside";
  animate?: boolean;
  animKey?: number;
  cardInitial?: object;
  cardAnimate?: object;
  cardTransition?: Transition;
  revealDelayMs?: number;
};

const GRID_COLS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
};

function renderRow(row: ProfileBlock[], profile: Profile, placement: "inside" | "outside") {
  const shared = row.length > 1;

  if (shared) {
    return (
      <div className={`grid ${GRID_COLS[row.length] ?? "grid-cols-1"} gap-2 sm:gap-3`}>
        {row.map((block) => (
          <ProfileBlockRenderer
            key={block.id}
            block={block}
            profile={profile}
            variant={placement}
            sharedInRow
          />
        ))}
      </div>
    );
  }

  return (
    <ProfileBlockRenderer block={row[0]} profile={profile} variant={placement} />
  );
}

export function ProfileBlocksSection({
  blocks,
  profile,
  placement,
  animate = false,
  animKey = 0,
  cardInitial,
  cardAnimate,
  cardTransition,
  revealDelayMs = 0,
}: Props) {
  if (blocks.length === 0) return null;

  const rows = groupBlocksForLayout(blocks);
  const gapClass = placement === "inside" ? "mt-4 space-y-3" : "mt-4 space-y-4";

  return (
    <div className={gapClass}>
      {rows.map((row, index) => {
        const rowKey = row.map((b) => b.id).join("-");
        const node = renderRow(row, profile, placement);

        if (!animate || !cardInitial || !cardAnimate || !cardTransition) {
          return <div key={rowKey}>{node}</div>;
        }

        const delay = revealDelayMs / 1000;

        return (
          <motion.div
            key={`${rowKey}-${animKey}`}
            initial={cardInitial}
            animate={cardAnimate}
            transition={{ ...cardTransition, delay }}
            className="relative"
            style={{ willChange: "transform" }}
          >
            {node}
          </motion.div>
        );
      })}
    </div>
  );
}
