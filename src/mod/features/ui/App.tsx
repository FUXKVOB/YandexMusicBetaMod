import { ThemeProvider } from "./contexts/ThemeContext";
import { useQuery } from "@tanstack/react-query";

import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@ui/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@ui/components/ui/tooltip";
import { ScrollArea } from "@ui/components/ui/scroll-area";
import { Suspense, lazy, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Toaster } from "@ui/components/ui/sonner";

import { Button } from "./components/ui/button";

import logo from "@ui/assets/logo.webp?inline";
import discordBg from "@ui/assets/discord-bg.png?inline";

import { FaDiscord, FaGithub } from "react-icons/fa";
import { RxUpdate } from "react-icons/rx";

const Downloader = lazy(() => import("@ui/components/downloader").then((m) => ({ default: m.Downloader })));
const FontChanger = lazy(() => import("@ui/components/font-changer").then((m) => ({ default: m.FontChanger })));
const Devtools = lazy(() => import("@ui/components/devtools").then((m) => ({ default: m.Devtools })));
const DiscordRPC = lazy(() => import("@ui/components/discord-rpc").then((m) => ({ default: m.DiscordRPC })));
const Settings = lazy(() => import("@ui/components/settings").then((m) => ({ default: m.Settings })));
const ExperimentsToggle = lazy(
  () => import("@ui/components/experiments-toggle").then((m) => ({ default: m.ExperimentsToggle })),
);
const ScaleChanger = lazy(() => import("@ui/components/scale-changer").then((m) => ({ default: m.ScaleChanger })));
const CustomThemes = lazy(() => import("@ui/components/custom-themes").then((m) => ({ default: m.CustomThemes })));
const NewYearSnowfall = lazy(
  () => import("@ui/components/snowfall-animation").then((m) => ({ default: m.NewYearSnowfall })),
);
const NewYearSnowfallAnimation = lazy(
  () => import("@ui/components/snowfall-animation").then((m) => ({ default: m.NewYearSnowfallAnimation })),
);
const AutoBestQuality = lazy(
  () => import("@ui/components/auto-best-quality").then((m) => ({ default: m.AutoBestQuality })),
);
const AutoLiker = lazy(() => import("@ui/components/auto-liker").then((m) => ({ default: m.AutoLiker })));

const IS_DEV = false;
const DISCORD_INVITE_URL = "https://discord.gg/4nK7nk2sY8";
const GITHUB_REPO_URL = "https://github.com/Stephanzion/YandexMusicBetaMod/";

function LazyFallback() {
  return <div className="h-12 animate-pulse rounded-md bg-muted" />;
}

export default function App() {
  const [mountNode, setMountNode] = useState<HTMLDivElement | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(IS_DEV);
  const [devtoolsEnabled, setDevtoolsEnabled] = useState(false);

  const appMetaQuery = useQuery({
    queryKey: ["appMeta"],
    queryFn: async () => {
      const data = await fetch(
        "https://raw.githubusercontent.com/Stephanzion/YandexMusicBetaMod/refs/heads/master/.meta/meta.json",
      );
      if (data.status !== 200) {
        throw new Error("Failed to fetch app meta");
      }
      return data.json();
    },
    enabled: true,
    retry: true,
  });

  useEffect(() => {
    (async () => {
      setDevtoolsEnabled((await window.yandexMusicMod.getStorageValue("devtools/enabled")) || false);
    })();

    window.yandexMusicMod.onStorageChanged((key: string, value: any) => {
      if (key.includes("devtools/enabled")) setDevtoolsEnabled(value);
    });
  }, []);

  useEffect(() => {
    const targetSelector = 'div[class*="NavbarDesktopUserWidget_userProfileContainer"]';
    const containerId = "mod-sheet-container";

    const checkAndPlaceButton = () => {
      const targetElement = IS_DEV ? document.body : document.querySelector(targetSelector);
      let container = document.getElementById(containerId) as HTMLDivElement | null;

      if (targetElement) {
        if (!container) {
          container = document.createElement("div");
          container.id = containerId;
          container.style.display = "flex";
          container.style.justifyContent = "center";

          targetElement.parentNode?.insertBefore(container, targetElement);
        }
        setMountNode(container);
      } else {
        if (container) {
          container.remove();
        }
        setMountNode(null);
      }
    };

    checkAndPlaceButton();

    const observer = new MutationObserver(checkAndPlaceButton);

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      const container = document.getElementById(containerId);
      if (container) {
        container.remove();
      }
    };
  }, []);

  const sheetTrigger = (
    <>
      <SheetTrigger className="flex w-full items-center justify-center gap-2.5 rounded-full border-2 border-[var(--ym-outline-color-primary-disabled)] p-[5px] text-[var(--ym-controls-color-primary-text-enabled_variant)] transition-colors duration-100 ease-in-out hover:bg-[var(--ym-surface-color-primary-enabled-list)] px-6">
        <div
          className="h-[25px] w-[25px] bg-contain bg-no-repeat"
          style={{
            backgroundImage: `url(${logo})`,
          }}
        ></div>
        <span className="trigger-text hidden lg:inline">Меню мода</span>
        <Toaster position="bottom-right" />
      </SheetTrigger>

      <Suspense fallback={null}>
        <NewYearSnowfallAnimation />
      </Suspense>
    </>
  );

  return (
    <ThemeProvider>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        {mountNode && createPortal(sheetTrigger, mountNode)}
        <SheetContent side="left" className="w-full" onOpenAutoFocus={(e) => e.preventDefault()}>
          <div
            id="header"
            className="flex items-center justify-between px-4"
            style={{
              height: "var(--ym-spacer-size-xxxl)",
              backgroundColor: "var(--ym-background-color-primary-enabled-basic)",
            }}
          ></div>

          <div className="bg-secondary/20 m-3 mb-0 flex justify-between rounded-md border px-4 py-2 shadow-sm">
            <div className="flex items-center gap-2">
              <div
                className="h-6 w-6 bg-contain bg-no-repeat"
                style={{
                  backgroundImage: `url(${logo})`,
                }}
              />
              <span className="text-foreground text-base font-semibold">Yandex Music Mod</span>
              <span className="text-muted-foreground text-xs font-semibold">v{import.meta.env.VITE_MOD_VERSION}</span>
            </div>

            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(DISCORD_INVITE_URL, "_blank", "noreferrer")}
                  >
                    <FaDiscord className="text-blue-500 h-[1.3rem]! w-[1.3rem]!" fill="currentColor" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Discord сервер</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(GITHUB_REPO_URL, "_blank", "noreferrer")}
                  >
                    <FaGithub className="text-foreground h-[1.3rem]! w-[1.3rem]!" fill="currentColor" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Исходный код на Github</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <ScrollArea
            className="flex h-full flex-col p-1 pt-0 overflow-hidden overflow-x-auto overflow-y-auto rounded-md"
            viewportClassName="gap-2"
          >
            {appMetaQuery.isSuccess &&
              appMetaQuery.data &&
              appMetaQuery.data.modStable !== import.meta.env.VITE_MOD_VERSION && (
                <div
                  className="m-4 py-4 px-5 flex flex-row justify-center items-center gap-3 bg-secondary border-border rounded-xl hover:scale-105 transition-all cursor-pointer"
                  onClick={() => window.open(appMetaQuery.data.downloadUrl, "_blank", "noreferrer")}
                >
                  <RxUpdate className="text-foreground h-[2.5rem]! w-[2.5rem]!" fill="currentColor" />
                  <div className="flex flex-col gap-1 justify-center items-start">
                    <span className="text-foreground text-base font-semibold">
                      Доступно обновление v{appMetaQuery.data.modStable}
                    </span>
                    <span className="text-muted-foreground text-sm">Нажмите, чтобы скачать новую версию мода</span>
                  </div>
                </div>
              )}

            <Suspense fallback={<LazyFallback />}>
              <Downloader />
            </Suspense>
            <Suspense fallback={<LazyFallback />}>
              <NewYearSnowfall />
            </Suspense>
            <Suspense fallback={<LazyFallback />}>
              <DiscordRPC />
            </Suspense>
            <Suspense fallback={<LazyFallback />}>
              <AutoLiker />
            </Suspense>
            <Suspense fallback={<LazyFallback />}>
              <CustomThemes />
            </Suspense>
            <Suspense fallback={<LazyFallback />}>
              <FontChanger />
            </Suspense>
            <Suspense fallback={<LazyFallback />}>
              <ScaleChanger />
            </Suspense>
            <Suspense fallback={<LazyFallback />}>
              <AutoBestQuality />
            </Suspense>

            <Suspense fallback={<LazyFallback />}>
              <Settings />
            </Suspense>
            <Suspense fallback={<LazyFallback />}>
              <Devtools />
            </Suspense>

            {devtoolsEnabled && (
              <>
                <Suspense fallback={<LazyFallback />}>
                  <ExperimentsToggle />
                </Suspense>
              </>
            )}

            <div className="flex flex-col gap-4 justify-center items-center m-6 ">
              <div
                className="py-3 px-2 w-full flex flex-row justify-center items-center gap-4 border-violet-400 border-1 rounded-xl hover:scale-105 transition-all cursor-pointer opacity-90 dark:opacity-100"
                style={{
                  backgroundImage: `url(${discordBg})`,
                  backgroundSize: "contain",
                  backgroundRepeat: "repeat-x",
                  zoom: ".9",
                }}
                onClick={() => window.open(DISCORD_INVITE_URL, "_blank", "noreferrer")}
              >
                <FaDiscord className="text-white h-[2.5rem]! w-[2.5rem]!" fill="currentColor" />
                <div className="flex flex-col gap-1 justify-center items-start">
                  <span className="text-white text-lg font-semibold">Yandex Music Mod</span>
                  <span className="text-slate-200 text-sm mt-[-3px]">Присоединяйтесь к нам в Discord</span>
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="m-4 flex flex-row">
            <Button variant="default" className="flex-1 opacity-0" onClick={() => setIsSheetOpen(false)}>
              Сохранить
            </Button>
            <Button variant="outline" className="text-foreground flex-1" onClick={() => setIsSheetOpen(false)}>
              Назад
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </ThemeProvider>
  );
}
