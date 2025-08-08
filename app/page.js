"use client";
import { useEffect } from "react";
import { redirect } from "next/navigation";
import { ProfileBasic } from "./components/section/ProfileBasic";
import { ProfilePro } from "./components/section/profilePro";
import { Navbar } from "./components/section/Navbar";
import { MyMatches } from "./components/MyMatches";
import { RelationshipMeter } from "./components/section/RelationshipMeter";
import Image from "next/image";
// import CompatibilityTest from '@/components/CompatibilityTest';
// import Question1 from '@/components/Question1';

export default function Home() {
  useEffect(() => {
    redirect("/pricing");
  }, []);

  return (
    <div>
      {/* <Navbar /> */}
      {/* <ProfileBasic />
      <ProfilePro />
      <RelationshipMeter />
      <MyMatches />
      <Image /> */}
      {/* <CompatibilityTest />
      < Question1 /> */}
    </div>
  );
}
