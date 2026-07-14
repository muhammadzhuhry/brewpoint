"use client";

import { useState } from "react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Coffee, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#D9D5CD] p-6">
      <div className="flex w-full max-w-[1000px] min-h-[640px] overflow-hidden rounded-2xl shadow-2xl">
        {/* Left side: Brand */}
        <div className="relative hidden w-[44%] flex-col justify-between bg-primary p-12 md:flex">
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex size-[38px] items-center justify-center rounded-[10px] bg-secondary/[.16]">
              <Coffee className="size-[21px] text-secondary" />
            </div>
            <span className="font-display text-lg font-semibold text-white">
              BrewPoint
            </span>
          </div>

          <div className="relative z-10 flex flex-col gap-4">
            <h1 className="font-display text-[32px] font-semibold leading-[1.18] text-white">
              Good morning.
              <br />
              Let&apos;s open up.
            </h1>
            <p className="max-w-[290px] text-[14.5px] leading-relaxed text-white/60">
              Sign in to ring up orders, manage the menu, and keep an eye on the
              day&apos;s sales — all from the counter.
            </p>
          </div>

          <span className="relative z-10 text-xs text-white/40">
            Maple &amp; Vine Coffee · POS v1.0
          </span>

          <Coffee
            className="pointer-events-none absolute -right-[46px] -bottom-[52px] size-[300px] text-secondary opacity-[0.06]"
            strokeWidth={1}
          />
        </div>

        {/* Right side: Form */}
        <div className="flex flex-1 items-center justify-center bg-white p-11">
          <div className="flex w-full max-w-[328px] flex-col gap-[22px]">
            <div className="flex flex-col gap-1">
              <h2 className="font-display text-[23px] font-semibold text-primary">
                Sign in
              </h2>
              <span className="text-[13.5px] text-muted-foreground">
                Enter your staff credentials to continue.
              </span>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="e.g. sofia"
                  className="mt-1.5"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Your password"
                    className="mt-1.5"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-1 mt-0.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="size-[17px]" />
                    ) : (
                      <Eye className="size-[17px]" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <Button className="w-full">Log in</Button>

            <span className="text-center text-[12.5px] text-muted-foreground">
              Forgot your password? Ask your store admin to reset it.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
