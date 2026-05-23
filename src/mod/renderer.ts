import { initFetchInterceptor } from "~/mod/features/utils";
import { registry } from "~/mod/core/registry";

initFetchInterceptor();

registry.register({
  name: "plus-unlocker",
  init: async () => {
    await import("./features/plus-unlocker");
  },
});

registry.register({
  name: "ui",
  init: async () => {
    await import("./features/ui/index");
  },
});

registry.register({
  name: "font-changer",
  init: async () => {
    await import("./features/font-changer");
  },
});

registry.register({
  name: "scale-changer",
  init: async () => {
    await import("./features/scale-changer");
  },
});

registry.register({
  name: "custom-themes",
  init: async () => {
    await import("./features/custom-themes");
  },
});

registry.register({
  name: "devtools",
  init: async () => {
    await import("./features/devtools");
  },
});

registry.register({
  name: "auto-best-quality",
  init: async () => {
    await import("./features/auto-best-quality");
  },
});

registry.register({
  name: "discord-rpc",
  init: async () => {
    await import("./features/discord-RPC/discordRPC");
  },
});

registry.register({
  name: "settings",
  init: async () => {
    await import("./features/settings");
  },
});

registry.register({
  name: "experiments-toggle",
  init: async () => {
    await import("./features/experiments-toggle");
  },
});

registry.initAll();
