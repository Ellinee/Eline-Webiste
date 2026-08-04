import { BellRinging, Heartbeat, HouseLine, Robot, ShieldCheck, Sparkle, type Icon } from "@phosphor-icons/react";

type IconType = "alert" | "device" | "care" | "scene" | "home" | "shield";

const icons: Record<IconType, Icon> = {
  alert: BellRinging,
  device: Robot,
  care: Heartbeat,
  scene: Sparkle,
  home: HouseLine,
  shield: ShieldCheck,
};

export function MiniIcon({ type }: { type: IconType }) {
  const IconComponent = icons[type];

  return <IconComponent className="h-6 w-6 shrink-0" weight="duotone" aria-hidden="true" />;
}
