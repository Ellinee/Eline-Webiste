import { Heartbeat, Robot, ShieldCheck, type Icon } from "@phosphor-icons/react";

type IconType = "device" | "care" | "shield";

const icons: Record<IconType, Icon> = {
  device: Robot,
  care: Heartbeat,
  shield: ShieldCheck,
};

export function MiniIcon({ type }: { type: IconType }) {
  const IconComponent = icons[type];

  return <IconComponent className="h-6 w-6 shrink-0" weight="duotone" aria-hidden="true" />;
}
